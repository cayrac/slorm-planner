import { Injectable } from '@angular/core';

import { DATA_REAPER_LEVEL } from '../constants/data/data-reaper-level';
import { HeroClass } from '../model/enum/hero-class';
import { GameDataReaper } from '../model/game/data/game-data-reaper';
import { GameWeapon } from '../model/game/game-save';
import { MinMax } from '../model/minmax';
import { Reaper } from '../model/reaper';
import { ReaperBuilder } from '../model/reaper-builder';
import { ReaperEffect } from '../model/reaper-effect';
import { compare, isNotNullOrUndefined, removeEmptyValues, splitData, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerReaperService {

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    private getReaperLevel(xp: number): number {
        let level = 1;

        for (let data of DATA_REAPER_LEVEL) {
            level = data.level;

            if (data.next !== null) {
                xp -= data.next;
            }
            
            if (data.next === null || xp < 0) {
                break;
            }
        }

        return level;
    }

    private getReaperBuilder(id: number): ReaperBuilder {
        return {
            id,
            name: this.slormancerTemplateService.getReaperBuilderName(id)
        }
    }

    private getReaperParents(gameData: GameDataReaper): Array<GameDataReaper> {
        let result: Array<GameDataReaper> = [];
        let current: Array<GameDataReaper> = [gameData];
        let i = 0;

        while (result.length !== current.length && i <= 5) {
            result = current;
            const parents = result.map(data => this.slormancerDataService.getParentsGameDataReaper(data.REF))
                .reduce((a, b) => a.concat(b), []);

                i++;
            current = Array.from(new Set([...result, ...parents]));
        }

        return result.sort((a, b) => compare(a.REF, b.REF));
    }

    public getReaperDamages(reaper: Reaper, level: number): MinMax {
        let result: MinMax | null = valueOrNull(reaper.damages[level]);


        if (result === null) {
            const keys = Array.from(Object.keys(reaper.damages)).map(parseInt);
            
            let closest = <number>keys[0];

            for (const key of keys) {
                if (key > closest && key <= level) {
                    closest = key;
                }
            }

            result = <MinMax>reaper.damages[closest];
        }

        return result;
    }

    public getReaper(reaper: GameWeapon, weaponClass: HeroClass, primordial: boolean, bonusLevel: number = 0): Reaper | null {
        const data = primordial ? reaper.primordial : reaper.basic;
        const level = this.getReaperLevel(data.experience);
        return this.getReaperById(reaper.id, weaponClass, primordial, level, data.kills, bonusLevel);
    }

    private getReaperEffect(template: string | null, stat: string | null, real: string | null): ReaperEffect | null {
        let result: ReaperEffect | null = null;

        if (template !== null) {
            const parsedStat = stat === null ? [] : removeEmptyValues(splitData(stat, '|'));
            const parsedReal = real === null ? [] : removeEmptyValues(splitData(real, '|'));
    
            this.slormancerTemplateService.getReaperDescriptionTemplate(template, parsedStat, parsedReal)

            result = {
                template: this.slormancerTemplateService.getReaperDescriptionTemplate(template, parsedStat, parsedReal),
                values: []
            }
        }

        return result;
    }

    private getReaperEffects(gameData: GameDataReaper): { base: Array<ReaperEffect>, benediction: Array<ReaperEffect>, malediction: Array<ReaperEffect> } {
        const gameDatas = this.getReaperParents(gameData);

        const base: Array<ReaperEffect | null> = [];
        const benediction: Array<ReaperEffect | null> = [];
        const malediction: Array<ReaperEffect | null> = [];

        for (const data of gameDatas) {
            const [baseStat, benedictionStat, maledictionStat] = splitData(data.VALUE_STAT, '\n');
            const [baseReal, benedictionReal, maledictionReal] = splitData(data.VALUE_REAL, '\n');
            const [baseTemplate, benedictionTemplate, maledictionTemplate] = splitData(data.EN_DESC, '/\n');

            base.push(this.getReaperEffect(valueOrNull(baseTemplate), valueOrNull(baseStat), valueOrNull(baseReal)));
            benediction.push(this.getReaperEffect(valueOrNull(benedictionTemplate), valueOrNull(benedictionStat), valueOrNull(benedictionReal)));
            malediction.push(this.getReaperEffect(valueOrNull(maledictionTemplate), valueOrNull(maledictionStat), valueOrNull(maledictionReal)));
        }

        return {
            base: base.filter(isNotNullOrUndefined),
            benediction: benediction.filter(isNotNullOrUndefined),
            malediction: malediction.filter(isNotNullOrUndefined),
        }
    }

    public getReaperById(id: number, weaponClass: HeroClass, primordial: boolean, level: number, kills: number, bonusLevel: number = 0): Reaper | null {
        const gameData = this.slormancerDataService.getGameDataReaper(id);
        const damages = this.slormancerDataService.getDataReaperDamages(id);
        let result: Reaper | null = null;

        if (gameData !== null && damages !== null) {
            const templates = this.getReaperEffects(gameData);
            result = {
                type: this.slormancerTemplateService.getReaperType(weaponClass),
                icon: 'reaper_' + weaponClass + '_' + id + (primordial ? '_p' : ''),
                primordial,
                level: Math.min(level, gameData.MAX_LVL),
                bonusLevel,
                kills,
                name: this.slormancerTemplateService.getReaperName(gameData.EN_NAME, weaponClass, primordial),
                description: '',
                templates,
                builder: this.getReaperBuilder(gameData.BLACKSMITH),
                damages,
                damageType: 'weapon_damage',
                maxLevel: gameData.MAX_LVL,
            }

            this.updateReaperTemplates(result);
        }

        return result
    }

    public updateReaperTemplates(reaper: Reaper) {
        let contents: Array<string> = [];

        let stats: Array<string> = [];
        let effects: Array<string> = [];
        for (let base of reaper.templates.base) {
            const template = base.template;
            const [stat, effect] = splitData(template);
            stats.push(<string>stat);
            effects.push(<string>effect);
        }
        contents.push(removeEmptyValues(stats).join('<br/>'));
        contents.push(removeEmptyValues(effects).join('<br/><br/>'));






        reaper.description = removeEmptyValues(contents).join('<br/><br/>');

        console.log(reaper.description);
    }

}