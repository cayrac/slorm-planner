import { Injectable } from '@angular/core';

import { DATA_REAPER_LEVEL } from '../constants/data/data-reaper-level';
import { AbstractEffectValue } from '../model/effect-value';
import { HeroClass } from '../model/enum/hero-class';
import { GameDataReaper } from '../model/game/data/game-data-reaper';
import { GameWeapon } from '../model/game/game-save';
import { MinMax } from '../model/minmax';
import { Reaper, ReaperTemplates } from '../model/reaper';
import { ReaperBuilder } from '../model/reaper-builder';
import { ReaperEffect } from '../model/reaper-effect';
import { list } from '../util/math.util';
import { strictParseFloat } from '../util/parse.util';
import { compare, isNotNullOrUndefined, notEmptyOrNull, removeEmptyValues, splitData, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerReaperService {

    public readonly MAX_REAPER_BONUS = 55;

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerEffectValueService: SlormancerEffectValueService) { }

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

    private getReaperValues(bases: Array<string>, types: Array<string>, levels: Array<string>, reals: Array<string>): Array<AbstractEffectValue> {
        const result: Array<AbstractEffectValue> = [];
        
        const nb = Math.max(types.length, bases.length, levels.length);
        for (let i of list(nb)) {
            const base = notEmptyOrNull(bases[i]);
            const level = notEmptyOrNull(levels[i]);
            const type = notEmptyOrNull(types[i]);

            const parsedBase = base === null ? null : strictParseFloat(base);

            if (parsedBase !== null) {
                result.push(this.slormancerEffectValueService.parseReaperEffectVariableValue(parsedBase, level, type));
            }
        }

        for (let real of reals) {
            result.push(this.slormancerEffectValueService.parseReaperEffectSynergyValue(real));
        }
        
        return result;
    }

    private getReaperEffect(template: string | null, base: string | null, type: string | null, level: string | null, stat: string | null, real: string | null): ReaperEffect | null {
        let result: ReaperEffect | null = null;

        if (template !== null && template !== '|') {
            const parsedBase = base === null ? [] : splitData(base, '|');
            const parsedType = type === null ? [] : splitData(type, '|');
            const parsedLevel = level === null ? [] : splitData(level, '|');
            const parsedStat = stat === null ? [] : splitData(stat, '|');
            const parsedReal = removeEmptyValues(real === null ? [] : splitData(real, '|'));
    
            console.log('getReaperEffect', template, stat, parsedStat, removeEmptyValues(parsedStat));
            result = {
                template: this.slormancerTemplateService.getReaperDescriptionTemplate(template, removeEmptyValues(parsedStat), parsedReal),
                values: this.getReaperValues(parsedBase, parsedType, parsedLevel, parsedReal)
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
            const [baseTemplate, benedictionTemplate, maledictionTemplate] = splitData(data.EN_DESC, '/\n');
            const [descBase, benedictionBase, maledictionBase] = splitData(data.VALUE_BASE, '\n');
            const [descType, benedictionType, maledictionType] = splitData(data.VALUE_TYPE, '\n');
            const [descLevel, benedictionLevel, maledictionLevel] = splitData(data.VALUE_LEVEL, '\n');
            const [descStat, benedictionStat, maledictionStat] = splitData(data.VALUE_STAT, '\n');
            const [descReal, benedictionReal, maledictionReal] = splitData(data.VALUE_REAL, '\n');
            const reaperData = this.slormancerDataService.getDataReaper(data.REF);

            const baseEffect = this.getReaperEffect(valueOrNull(baseTemplate),
                            valueOrNull(descBase),
                            valueOrNull(descType),
                            valueOrNull(descLevel),
                            valueOrNull(descStat),
                            valueOrNull(descReal));
            const benedictionEffect = this.getReaperEffect(valueOrNull(benedictionTemplate),
                            valueOrNull(benedictionBase),
                            valueOrNull(benedictionType),
                            valueOrNull(benedictionLevel),
                            valueOrNull(benedictionStat),
                            valueOrNull(benedictionReal));
            const maledictionEffect = this.getReaperEffect(valueOrNull(maledictionTemplate),
                            valueOrNull(maledictionBase),
                            valueOrNull(maledictionType),
                            valueOrNull(maledictionLevel),
                            valueOrNull(maledictionStat),
                            valueOrNull(maledictionReal))   

            if (reaperData !== null) {
                reaperData.override(baseEffect, benedictionEffect, maledictionEffect, gameData.REF);
            }

            base.push(baseEffect);
            benediction.push(benedictionEffect);
            malediction.push(maledictionEffect);
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
            const template = this.slormancerTemplateService.formatReaperTemplate(base.template, base.values, reaper.level + reaper.bonusLevel, reaper.baseInfo.level);
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