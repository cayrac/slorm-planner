import { Injectable } from '@angular/core';

import { DATA_REAPER_LEVEL } from '../../constants/content/data/data-reaper-level';
import { Activable } from '../../model/content/activable';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { HeroClass } from '../../model/content/enum/hero-class';
import { GameDataReaper } from '../../model/content/game/data/game-data-reaper';
import { Reaper, ReaperTemplates } from '../../model/content/reaper';
import { ReaperEffect } from '../../model/content/reaper-effect';
import { GameWeapon } from '../../model/parser/game/game-save';
import { effectValueSynergy, effectValueVariable } from '../../util/effect-value.util';
import { list } from '../../util/math.util';
import { strictParseFloat } from '../../util/parse.util';
import {
    compare,
    isNotNullOrUndefined,
    lastIndex,
    notEmptyOrNull,
    removeEmptyValues,
    splitData,
    valueOrDefault,
    valueOrNull,
} from '../../util/utils';
import { SlormancerActivableService } from '.././content/slormancer-activable.service';
import { SlormancerEffectValueService } from '.././content/slormancer-effect-value.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerReaperService {

    private readonly BENEDICTION_LABEL = this.slormancerTranslateService.translate('tt_ancient_bonus');
    private readonly MALEDICTION_LABEL = this.slormancerTranslateService.translate('tt_ancient_malus');
    private readonly VICTIMS_LABEL = this.slormancerTranslateService.translate('tt_victims');
    private readonly LEVEL_LABEL = this.slormancerTranslateService.translate('level');
    private readonly REAPERSMITH_LABEL = this.slormancerTranslateService.translate('weapon_reapersmith_light');
    private readonly PRIMORDIAL_REAPER_LABEL = this.slormancerTranslateService.translate('tt_reaper_corrupted');

    private readonly DESCRIPTION_SKILL_REGEXP = /act:[0-9]+/g;

    public readonly MAX_REAPER_BONUS = 55;

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerEffectValueService: SlormancerEffectValueService,
                private slormancerActivableService: SlormancerActivableService) { }

    private getReaperName(reaper: Reaper): string {
        let type = reaper.type
        
        if (reaper.primordial) {
            type = this.slormancerTemplateService.replaceAnchor(this.PRIMORDIAL_REAPER_LABEL, type , this.slormancerTemplateService.VALUE_ANCHOR);
        }

        return this.slormancerTemplateService.replaceAnchor(reaper.templates.name, type, this.slormancerTemplateService.TYPE_ANCHOR);
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

    private getReaperMinimumLevel(reaperId: number): number {
        const parentsMinLevel = this.slormancerDataService.getParentsGameDataReaper(reaperId).map(parent => parent.MAX_LVL);
        return Math.max(...parentsMinLevel, 1);
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

    private parseUpgradeType(upgradeType: string | null): EffectValueUpgradeType {
        let result: EffectValueUpgradeType = EffectValueUpgradeType.ReaperLevel;

        if (upgradeType === 'rl') {
            result = EffectValueUpgradeType.ReaperLevel;
        } else if (upgradeType === 'rln') {
            result = EffectValueUpgradeType.NonPrimordialReaperLevel;
        }

        return result;
    }

    private parseReaperEffectVariableValue(base: number, level: string | null, type: string | null): AbstractEffectValue {
        let result: AbstractEffectValue;

        if (level === null) {
            result = effectValueVariable(base, 0, EffectValueUpgradeType.ReaperLevel, type === '%');
        } else {
            result = effectValueVariable(0, base, this.parseUpgradeType(level), type === '%');
        }

        return result;        
    }

    private parseReaperEffectSynergyValue(real: string | null): AbstractEffectValue {
        let result: AbstractEffectValue;

        const typeValues = splitData(real, ':');
        const source = <string>typeValues[1];
        const brutValue = <string>typeValues[2];
        const isVariable = brutValue.indexOf('*') !== -1;
        const [upgradeValue, upgradeType] = splitData(brutValue, '*');

        const value = isVariable ? 0 : strictParseFloat(brutValue);
        const upgrade = isVariable ? strictParseFloat(<string>upgradeValue) : 0;
        result = effectValueSynergy(value, upgrade, this.parseUpgradeType(valueOrNull(upgradeType)), false, source);
        
        return result;   
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
                result.push(this.parseReaperEffectVariableValue(parsedBase, level, type));
            }
        }

        for (let real of reals) {
            result.push(this.parseReaperEffectSynergyValue(real));
        }
        
        return result;
    }

    private getReaperEffect(template: string | null, base: string | null, type: string | null, level: string | null, real: string | null): ReaperEffect {
        let result: ReaperEffect = {
            template: template !== null && template !== '|' ? template : null,
            values: []
        };

        const parsedBase = base === null ? [] : splitData(base, '|');
        const parsedType = type === null ? [] : splitData(type, '|');
        const parsedLevel = level === null ? [] : splitData(level, '|');
        const parsedReal = removeEmptyValues(real === null ? [] : splitData(real, '|'));
        result.values = this.getReaperValues(parsedBase, parsedType, parsedLevel, parsedReal);

        return result;
    }

    private getReaperTemplates(gameData: GameDataReaper, heroClass: HeroClass): ReaperTemplates {
        const gameDatas = this.getReaperParents(gameData);

        const base: Array<ReaperEffect | null> = [];
        const benediction: Array<ReaperEffect | null> = [];
        const malediction: Array<ReaperEffect | null> = [];

        let skills: Array<Activable> = [];
        let primordialSkills: Array<Activable> = [];

        for (const data of gameDatas) {
            const stats = splitData(data.VALUE_STAT, '\n')
                .map(stats => splitData(stats, '|'))
                .reduce((stats, total) => [...stats, ...total] , [])
                .filter(notEmptyOrNull);

            const template = data.EN_DESC.replace(this.DESCRIPTION_SKILL_REGEXP, '');

            const [baseTemplate, benedictionTemplate, maledictionTemplate] =
                this.slormancerTemplateService.prepareReaperDescriptionTemplate(template, stats);

            const [descBase, benedictionBase, maledictionBase] = splitData(data.VALUE_BASE, '\n');
            const [descType, benedictionType, maledictionType] = splitData(data.VALUE_TYPE, '\n');
            const [descLevel, benedictionLevel, maledictionLevel] = splitData(data.VALUE_LEVEL, '\n');
            const [descReal, benedictionReal, maledictionReal] = splitData(data.VALUE_REAL, '\n');
            const reaperData = this.slormancerDataService.getDataReaper(data.REF);

            const baseEffect = this.getReaperEffect(valueOrNull(baseTemplate),
                            valueOrNull(descBase),
                            valueOrNull(descType),
                            valueOrNull(descLevel),
                            valueOrNull(descReal));
            const benedictionEffect = this.getReaperEffect(valueOrNull(benedictionTemplate),
                            valueOrNull(benedictionBase),
                            valueOrNull(benedictionType),
                            valueOrNull(benedictionLevel),
                            valueOrNull(benedictionReal));
            const maledictionEffect = this.getReaperEffect(valueOrNull(maledictionTemplate),
                            valueOrNull(maledictionBase),
                            valueOrNull(maledictionType),
                            valueOrNull(maledictionLevel),
                            valueOrNull(maledictionReal));

            if (reaperData !== null) {
                reaperData.override(baseEffect, benedictionEffect, maledictionEffect, gameData.REF);
            }

            base.push(baseEffect);
            benediction.push(benedictionEffect);
            malediction.push(maledictionEffect);

            skills = [...skills, ...this.slormancerActivableService.getReaperActivable(data.REF, 0, heroClass)];
            primordialSkills = [...primordialSkills, ...this.slormancerActivableService.getPrimordialReaperActivable(data.REF, 0, heroClass)];
        }

        return {
            name: gameData.EN_NAME,
            base: base.filter(isNotNullOrUndefined),
            benediction: benediction.filter(isNotNullOrUndefined),
            malediction: malediction.filter(isNotNullOrUndefined),
            activables: skills,
            primordialSkills
        }
    }

    private formatTemplate(reaperEffects: Array<ReaperEffect>): string {
        let contents: Array<string> = [];
        let stats: Array<string> = [];
        let effects: Array<string> = [];
        for (let reaperEffect of reaperEffects) {
            if (reaperEffect.template !== null) {
                const template = this.slormancerTemplateService.formatReaperTemplate(reaperEffect.template, reaperEffect.values);
                const [stat, effect] = splitData(template);
                stats.push(<string>stat);
                effects.push(<string>effect);
            }
        }
        contents.push(removeEmptyValues(stats).join('<br/>'));
        contents.push(removeEmptyValues(effects).join('<br/><br/>'));
        return removeEmptyValues(contents).join('<br/><br/>');
    }

    public getReaperFromGameWeapon(data: GameWeapon, weaponClass: HeroClass, primordial: boolean, bonusLevel: number = 0): Reaper | null {
        return this.getReaper(data.id, weaponClass, primordial, data.basic.experience, data.primordial.experience, data.basic.kills, data.primordial.kills, bonusLevel);
    }

    public getReaper(id: number, weaponClass: HeroClass, primordial: boolean, xp: number, xpPrimordial: number, kills: number, killsPrimordial: number, bonusLevel: number = 0): Reaper | null {
        const gameData = this.slormancerDataService.getGameDataReaper(id);
        const damagesRange = this.slormancerDataService.getDataReaperDamages(id);
        let result: Reaper | null = null;

        const level = this.getReaperLevel(xp);
        const levelPrimordial = this.getReaperLevel(xpPrimordial);

        if (gameData !== null && damagesRange !== null) {
            result = {
                id,
                weaponClass,
                type: this.slormancerTranslateService.translate('weapon_' + weaponClass),
                icon: '',
                primordial,
                level: 0,
                baseLevel: level,
                bonusLevel,
                kills,
                name: '',
                description: '',
                benediction: null,
                malediction: null,
                lore: this.slormancerTemplateService.getReaperLoreTemplate(gameData.EN_LORE),
                templates: this.getReaperTemplates(gameData, weaponClass),
                smith: { id: gameData.BLACKSMITH, name: '' },
                damagesRange,
                damageType: 'weapon_damage',
                minLevel: this.getReaperMinimumLevel(id),
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
            } as Reaper;

            this.updateReaper(result);
        }

        return result
    }

    public updateReaper(reaper: Reaper) {
        const info = reaper.primordial ? reaper.primordialInfo : reaper.baseInfo;
        
        reaper.icon = 'assets/img/reaper/' + reaper.weaponClass + '/' + reaper.id + (reaper.primordial ? '_p' : '') + '.png';
        reaper.kills = info.kills;
        reaper.baseLevel = Math.max(reaper.minLevel, info.level);
        reaper.bonusLevel = Math.max(0, Math.min(this.MAX_REAPER_BONUS, reaper.bonusLevel));
        reaper.level = reaper.baseLevel + reaper.bonusLevel;
        reaper.maxDamagesWithBonuses = valueOrDefault(reaper.damagesRange[reaper.maxLevelWithBonuses],  {min: 0, max: 0 });
        reaper.activables = reaper.templates.activables;
        reaper.name = this.getReaperName(reaper);

        const lastDamagesIndex = lastIndex(reaper.damagesRange);
        let damagesIndex = reaper.level;
        if (lastDamagesIndex !== null) {
            damagesIndex = Math.min(lastDamagesIndex, damagesIndex)
        }
        reaper.damages = valueOrDefault(reaper.damagesRange[damagesIndex],  {min: 0, max: 0 });

        for (const reaperEffect of reaper.templates.base) {
            for (const value of reaperEffect.values) {
                this.slormancerEffectValueService.updateEffectValue(value, reaper.level);
            }
        }
        for (const reaperEffect of reaper.templates.benediction) {
            for (const value of reaperEffect.values) {
                this.slormancerEffectValueService.updateEffectValue(value, reaper.level);
            }
        }
        for (const reaperEffect of reaper.templates.malediction) {
            for (const value of reaperEffect.values) {
                this.slormancerEffectValueService.updateEffectValue(value, reaper.level);
            }
        }

        reaper.description = this.formatTemplate(reaper.templates.base);

        if (reaper.primordial) {
            reaper.benediction = this.formatTemplate(reaper.templates.benediction);
            reaper.malediction = this.formatTemplate(reaper.templates.malediction);
            reaper.activables = [...reaper.activables, ...reaper.templates.primordialSkills];
        } else {
            reaper.benediction = null;
            reaper.malediction = null;
        }

        for (const activable of reaper.activables) {
            activable.level = reaper.level;
            this.slormancerActivableService.updateActivable(activable);
        }


        reaper.smith.name = this.slormancerTranslateService.translate('weapon_reapersmith_' + reaper.smith.id);
        reaper.smithLabel = this.slormancerTemplateService.replaceAnchor(this.REAPERSMITH_LABEL, reaper.smith.name, this.slormancerTemplateService.TYPE_ANCHOR);
        reaper.victimsLabel = reaper.kills + ' ' + this.VICTIMS_LABEL;
        reaper.levelLabel = this.LEVEL_LABEL + ' : '
            + (reaper.maxLevel === reaper.baseLevel ? 'Max(' + reaper.baseLevel + ')' : reaper.baseLevel)
            + (reaper.bonusLevel > 0 ? this.slormancerTemplateService.asSpan('+' + reaper.bonusLevel, 'bonus-level') : '');
        reaper.damageTypeLabel = this.slormancerTranslateService.translate(reaper.damageType);
        reaper.benedictionTitleLabel = this.BENEDICTION_LABEL;
        reaper.maledictionTitleLabel = this.MALEDICTION_LABEL;
    }

}