import { Injectable } from '@angular/core';

import { DATA_REAPER_LEVEL } from '../../constants/content/data/data-reaper-level';
import { Activable } from '../../model/content/activable';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { HeroClass } from '../../model/content/enum/hero-class';
import { ReaperSmith } from '../../model/content/enum/reaper-smith';
import { GameDataReaper } from '../../model/content/game/data/game-data-reaper';
import { Reaper, ReaperTemplates } from '../../model/content/reaper';
import { ReaperEffect } from '../../model/content/reaper-effect';
import { MinMax } from '../../model/minmax';
import { GameWeapon } from '../../model/parser/game/game-save';
import { effectValueSynergy, effectValueVariable } from '../../util/effect-value.util';
import { list } from '../../util/math.util';
import { strictParseFloat } from '../../util/parse.util';
import {
    compare,
    emptyStringToNull,
    isEffectValueSynergy,
    isEffectValueVariable,
    isNotNullOrUndefined,
    notEmptyOrNull,
    removeEmptyValues,
    splitData,
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

    private getDamages(level: number, base: MinMax, perLevel: MinMax, multiplier: number): MinMax {
        const weapon_mult = multiplier;
        const bminr = base.min;
        const lminr = perLevel.min;
        const bmaxr = base.max;
        const lmaxr = perLevel.max;
        let mult = 0;

        switch (weapon_mult) {
            case 0:
                mult = 0;
                break
            case 1:
                mult = 0.007;
                break
            case 2:
                mult = 0.01;
                break
            case 3:
                mult = 0.016;
                break
            case 4:
                mult = 0.019;
                break
            case 5:
                mult = 0.023;
                break
        }

        let prev = bminr;
        let max_prev = bmaxr;
        let cminr = bminr;
        let cmaxr = bmaxr;
        for (let i = 2; i <= level; i++) {
            let basic_total = ((prev + lminr) + (mult * prev));
            let max_basic_total = ((max_prev + lmaxr) + (mult * max_prev));
            if (i == level)
            {
                cminr = basic_total
                cmaxr = max_basic_total
            }
            prev = Math.ceil(basic_total)
            max_prev = Math.ceil(max_basic_total)
        }

        return { min: Math.round(cminr), max: Math.round(cmaxr) };
    }
    
    public getReaperName(template: string, primordial: boolean, heroClass: HeroClass): string {
        const weaponName = this.slormancerTranslateService.translate('weapon_' + heroClass);
        return this.buildReaperName(weaponName, template, primordial);
    }        
                
    private buildReaperName(weaponName: string, nameTemplate: string, primordial: boolean): string {
        
        if (primordial) {
            weaponName = this.slormancerTemplateService.replaceAnchor(this.PRIMORDIAL_REAPER_LABEL, weaponName , this.slormancerTemplateService.VALUE_ANCHOR);
        }

        return this.slormancerTemplateService.replaceAnchor(nameTemplate, weaponName, this.slormancerTemplateService.TYPE_ANCHOR);
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

    private parseReaperEffectVariableValue(base: number, level: string | null, type: string | null, stat: string | null): AbstractEffectValue {
        let result: AbstractEffectValue;

        if (level === null) {
            result = effectValueVariable(base, 0, EffectValueUpgradeType.ReaperLevel, type === '%', stat);
        } else {
            result = effectValueVariable(0, base, this.parseUpgradeType(level), type === '%', stat);
        }

        return result;        
    }

    private parseReaperEffectSynergyValue(real: string | null, stat: string | null): AbstractEffectValue {
        let result: AbstractEffectValue;

        const typeValues = splitData(real, ':');
        const source = <string>typeValues[1];
        const brutValue = <string>typeValues[2];
        const isVariable = brutValue.indexOf('*') !== -1;
        const [upgradeValue, upgradeType] = splitData(brutValue, '*');

        const value = isVariable ? 0 : strictParseFloat(brutValue);
        const upgrade = isVariable ? strictParseFloat(<string>upgradeValue) : 0;
        result = effectValueSynergy(value, upgrade, this.parseUpgradeType(valueOrNull(upgradeType)), false, source, stat);
        
        return result;   
    }

    private getReaperValues(bases: Array<string>, types: Array<string>, levels: Array<string>, reals: Array<string>, stats: Array<string>): Array<AbstractEffectValue> {
        const result: Array<AbstractEffectValue> = [];
        
        let synergyCursor = 0;
        
        const baseAndReal = [...emptyStringToNull(bases), ...emptyStringToNull(reals) ].filter(isNotNullOrUndefined).length
        const nb = Math.max(types.length, baseAndReal, levels.length, stats.length);
        for (let i of list(nb)) {
            const base = notEmptyOrNull(bases[i]);
            const level = notEmptyOrNull(levels[i]);
            const type = notEmptyOrNull(types[i]);
            const stat = notEmptyOrNull(stats[i]);

            const parsedBase = base === null ? null : strictParseFloat(base);

            if (parsedBase != null) {
                result.push(this.parseReaperEffectVariableValue(parsedBase, level, type, stat));
            } else {
                const real = notEmptyOrNull(reals[synergyCursor++]);
                if (real !== null) {
                    result.push(this.parseReaperEffectSynergyValue(real, stat));
                }
            }
        }
        
        return result;
    }

    private getReaperEffect(template: string | null, base: string | null, type: string | null, level: string | null, real: string | null, stat: string | null): ReaperEffect {
        let result: ReaperEffect = {
            template: template !== null && template !== '|' ? template : null,
            values: []
        };

        const parsedBase = base === null ? [] : splitData(base, '|');
        const parsedType = type === null ? [] : splitData(type, '|');
        const parsedLevel = level === null ? [] : splitData(level, '|');
        const parsedStat = stat === null ? [] : splitData(stat, '|');
        const parsedReal = real === null ? [] : splitData(real, '|');
        result.values = this.getReaperValues(parsedBase, parsedType, parsedLevel, parsedReal, parsedStat);

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

            const [statStat, benedictionStat, maledictionStat] = splitData(data.VALUE_STAT, '\n');
            const [descBase, benedictionBase, maledictionBase] = splitData(data.VALUE_BASE, '\n');
            const [descType, benedictionType, maledictionType] = splitData(data.VALUE_TYPE, '\n');
            const [descLevel, benedictionLevel, maledictionLevel] = splitData(data.VALUE_LEVEL, '\n');
            const [descReal, benedictionReal, maledictionReal] = splitData(data.VALUE_REAL, '\n');
            const reaperData = this.slormancerDataService.getDataReaper(data.REF);

            const baseEffect = this.getReaperEffect(
                            valueOrNull(baseTemplate),
                            valueOrNull(descBase),
                            valueOrNull(descType),
                            valueOrNull(descLevel),
                            valueOrNull(descReal),
                            valueOrNull(statStat)
                            );
            const benedictionEffect = this.getReaperEffect(
                            valueOrNull(benedictionTemplate),
                            valueOrNull(benedictionBase),
                            valueOrNull(benedictionType),
                            valueOrNull(benedictionLevel),
                            valueOrNull(benedictionReal),
                            valueOrNull(benedictionStat)
                            );
            const maledictionEffect = this.getReaperEffect(
                            valueOrNull(maledictionTemplate),
                            valueOrNull(maledictionBase),
                            valueOrNull(maledictionType),
                            valueOrNull(maledictionLevel),
                            valueOrNull(maledictionReal),
                            valueOrNull(maledictionStat)
                            );

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
        const level = this.getReaperLevel(data.basic.experience);
        const levelPrimordial = this.getReaperLevel(data.primordial.experience);
        return this.getReaperById(data.id, weaponClass, primordial, level, levelPrimordial, data.basic.kills, data.primordial.kills, bonusLevel);
    }

    private getReaperEffectClone(reaperEffect: ReaperEffect): ReaperEffect {
        return {
            ...reaperEffect,
            values: reaperEffect.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        };
    }

    public getReaperClone(reaper: Reaper): Reaper {
        const result: Reaper = {
            ...reaper,
            smith: { ...reaper.smith },
            baseInfo: { ...reaper.baseInfo },
            primordialInfo: { ...reaper.primordialInfo },
            templates: {
                ...reaper.templates,
                base: reaper.templates.base.map(effect => this.getReaperEffectClone(effect)),
                benediction: reaper.templates.benediction.map(effect => this.getReaperEffectClone(effect)),
                malediction: reaper.templates.malediction.map(effect => this.getReaperEffectClone(effect)),
                activables: reaper.templates.activables.map(activable => this.slormancerActivableService.getActivableClone(activable)),
                primordialSkills: reaper.templates.primordialSkills.map(activable => this.slormancerActivableService.getActivableClone(activable))
            }
        };

        return result;
    }

    public getDefaultReaper(weaponClass: HeroClass) {
        const defaultGameData = <GameDataReaper>this.slormancerDataService.getGameDataAvailableReaper()[0];
        return this.getReaper(defaultGameData, weaponClass, false, 1, 1, 0, 0, 0);
    }

    public getReaper(gameData: GameDataReaper, weaponClass: HeroClass, primordial: boolean, level: number, levelPrimordial: number, kills: number, killsPrimordial: number, bonusLevel: number = 0): Reaper {
       
        let result = {
            id: gameData.REF,
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
            damageType: 'weapon_damage',
            minLevel: this.getReaperMinimumLevel(gameData.REF),
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
            },
            damagesBase: { min: gameData.BASE_DMG_MIN, max: gameData.BASE_DMG_MAX },
            damagesLevel: { min: gameData.MIN_DMG_LVL, max: gameData.MAX_DMG_LVL },
            damagesMultiplier: gameData.DMG_MULTIPLIER
        } as Reaper;

        this.updateReaperModel(result);
        this.updateReaperView(result);

        return result;
    }

    public getReaperById(id: number, weaponClass: HeroClass, primordial: boolean, level: number, levelPrimordial: number, kills: number, killsPrimordial: number, bonusLevel: number = 0): Reaper | null {
        const gameData = this.slormancerDataService.getGameDataReaper(id);
        let result: Reaper | null = null;

        if (gameData !== null) {
            result = this.getReaper(gameData, weaponClass, primordial, level, levelPrimordial, kills, killsPrimordial, bonusLevel);
        }

        return result;
    }

    private updateEffectValue(value: AbstractEffectValue, reaper: Reaper) {
        let upgradeValue = reaper.level;
        if ((isEffectValueVariable(value) || isEffectValueSynergy(value)) && value.upgradeType === EffectValueUpgradeType.NonPrimordialReaperLevel) {
            upgradeValue = reaper.baseInfo.level + reaper.bonusLevel;
        }
        this.slormancerEffectValueService.updateEffectValue(value, upgradeValue);
    }

    public updateReaperModel(reaper: Reaper) {
        reaper.primordialInfo.level = Math.min(reaper.maxLevel, Math.max(reaper.primordialInfo.level, reaper.minLevel));
        reaper.baseInfo.level = Math.min(reaper.maxLevel, Math.max(reaper.baseInfo.level, reaper.minLevel));

        const info = reaper.primordial ? reaper.primordialInfo : reaper.baseInfo;
        reaper.kills = info.kills;
        reaper.baseLevel = info.level;
        reaper.bonusLevel = Math.max(0, Math.min(this.MAX_REAPER_BONUS, reaper.bonusLevel));
        reaper.level = reaper.baseLevel + reaper.bonusLevel;
        reaper.maxDamagesWithBonuses = this.getDamages(reaper.maxLevelWithBonuses, reaper.damagesBase, reaper.damagesLevel, reaper.damagesMultiplier);
        reaper.activables = reaper.templates.activables;

        reaper.damages = this.getDamages(reaper.level, reaper.damagesBase, reaper.damagesLevel, reaper.damagesMultiplier);

        for (const reaperEffect of reaper.templates.base) {
            for (const value of reaperEffect.values) {
                this.updateEffectValue(value, reaper);
            }
        }
        for (const reaperEffect of reaper.templates.benediction) {
            for (const value of reaperEffect.values) {
                this.updateEffectValue(value, reaper);
            }
        }
        for (const reaperEffect of reaper.templates.malediction) {
            for (const value of reaperEffect.values) {
                this.updateEffectValue(value, reaper);
            }
        }


        if (reaper.primordial) {
            reaper.activables = [...reaper.activables, ...reaper.templates.primordialSkills];
        }

        for (const activable of reaper.activables) {
            activable.level = reaper.level;
            this.slormancerActivableService.updateActivableModel(activable);
        }
    }

    public updateReaperView(reaper: Reaper) {
        reaper.icon = 'assets/img/reaper/' + reaper.weaponClass + '/' + reaper.id + (reaper.primordial ? '_p' : '') + '.png';
        reaper.name = this.buildReaperName(reaper.type, reaper.templates.name, reaper.primordial);

        reaper.description = this.formatTemplate(reaper.templates.base);

        if (reaper.primordial) {
            reaper.benediction = this.formatTemplate(reaper.templates.benediction);
            reaper.malediction = this.formatTemplate(reaper.templates.malediction);
        } else {
            reaper.benediction = null;
            reaper.malediction = null;
        }

        for (const activable of reaper.activables) {
            this.slormancerActivableService.updateActivableView(activable);
        }

        reaper.smith.name = this.slormancerTranslateService.translate('weapon_reapersmith_' + (reaper.smith.id === ReaperSmith.ReapersmithBrotherhood ? 'all' : reaper.smith.id));
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