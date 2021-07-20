import { Injectable } from '@angular/core';

import { DATA_REAPER_LEVEL } from '../constants/data/data-reaper-level';
import { HeroClass } from '../model/enum/hero-class';
import { GameDataReaper } from '../model/game/data/game-data-reaper';
import { GameWeapon } from '../model/game/game-save';
import { MinMax } from '../model/minmax';
import { Reaper, ReaperTemplates } from '../model/reaper';
import { ReaperBuilder } from '../model/reaper-builder';
import { ReaperEffect } from '../model/reaper-effect';
import { compare, isNotNullOrUndefined, removeEmptyValues, splitData, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerReaperService {

    public readonly MAX_REAPER_BONUS = 55;

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    public getReaper(reaper: GameWeapon, weaponClass: HeroClass, primordial: boolean, bonusLevel: number = 0): Reaper | null {
        const level = this.getReaperLevel(reaper.basic.experience);
        const levelPrimordial = this.getReaperLevel(reaper.primordial.experience);
        return this.getReaperById(reaper.id, weaponClass, primordial, level, levelPrimordial, reaper.basic.kills, reaper.primordial.kills, bonusLevel);
    }

    public getReaperById(id: number, weaponClass: HeroClass, primordial: boolean, level: number, levelPrimordial: number, kills: number, killsPrimordial: number, bonusLevel: number = 0): Reaper | null {
        const gameData = this.slormancerDataService.getGameDataReaper(id);
        const damagesRange = this.slormancerDataService.getDataReaperDamages(id);
        let result: Reaper | null = null;

        if (gameData !== null && damagesRange !== null) {
            const templates = this.getReaperTemplates(gameData);
            result = {
                id,
                weaponClass,
                type: this.slormancerTemplateService.getReaperType(weaponClass),
                icon: '',
                primordial,
                level: 0,
                bonusLevel,
                kills,
                name: '',
                description: '',
                templates,
                builder: this.getReaperBuilder(gameData.BLACKSMITH),
                damagesRange,
                damageType: 'weapon_damage',
                maxLevel: gameData.MAX_LVL,
                maxLevelWithBonuses: gameData.MAX_LVL + this.MAX_REAPER_BONUS,
                damages: { min: 0, max: 0 },
                maxDamagesWithBonuses: { min: 0, max: 0 },
                baseInfo: {
                    kills: kills,
                    level: Math.min(level, gameData.MAX_LVL)
                },
                primordialInfo: {
                    kills: killsPrimordial,
                    level: Math.min(levelPrimordial, gameData.MAX_LVL)
                }
            }

            this.updateReaper(result);
        }

        return result
    }

    private getReaperDamages(reaper: Reaper, level: number): MinMax {
        let result: MinMax | null = valueOrNull(reaper.damagesRange[level]);

        if (result === null) {
            const keys = Array.from(Object.keys(reaper.damagesRange)).map(parseInt);
            
            let closest = <number>keys[0];

            for (const key of keys) {
                if (key > closest && key <= level) {
                    closest = key;
                }
            }

            result = <MinMax>reaper.damagesRange[closest];
        }

        return result;
    }

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

    private getReaperTemplates(gameData: GameDataReaper): ReaperTemplates {
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
            name: gameData.EN_NAME,
            base: base.filter(isNotNullOrUndefined),
            benediction: benediction.filter(isNotNullOrUndefined),
            malediction: malediction.filter(isNotNullOrUndefined),
        }
    }

    public updateReaper(reaper: Reaper) {
        let contents: Array<string> = [];
        const info = reaper.primordial ? reaper.primordialInfo : reaper.baseInfo;
        
        reaper.icon = 'reaper_' + reaper.weaponClass + '_' + reaper.id + (reaper.primordial ? '_p' : '');
        reaper.kills = info.kills;
        reaper.level = info.level;
        reaper.damages = this.getReaperDamages(reaper, reaper.level + reaper.bonusLevel);
        reaper.maxDamagesWithBonuses = this.getReaperDamages(reaper, reaper.maxLevelWithBonuses);

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

        reaper.name = this.slormancerTemplateService.getReaperName(reaper.templates.name, reaper.weaponClass, reaper.primordial)
        reaper.description = removeEmptyValues(contents).join('<br/><br/>');
    }

}