import { Injectable } from '@angular/core';

import { MAX_EFFECT_AFFINITY_BASE, MAX_REAPER_AFFINITY_BASE, MAX_REAPER_LEVEL, UNITY_REAPERS } from '../../constants';
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
import { bankerRound, list, round } from '../../util/math.util';
import { strictParseFloat } from '../../util/parse.util';
import {
    compare,
    emptyStringToNull,
    isNotNullOrUndefined,
    notEmptyOrNull,
    removeEmptyValues,
    splitData,
    valueOrNull
} from '../../util/utils';
import { SlormancerActivableService } from '.././content/slormancer-activable.service';
import { SlormancerEffectValueService, UpdateEffectValueContext } from '.././content/slormancer-effect-value.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerReaperService {

    private readonly BENEDICTION_LABEL = this.slormancerTranslateService.translate('tt_ancient_bonus');
    private readonly MALEDICTION_LABEL = this.slormancerTranslateService.translate('tt_ancient_malus');
    private readonly ACTIVABLES_LABEL = this.slormancerTranslateService.translate('tt_unlocked_actives');
    private readonly VICTIMS_LABEL = this.slormancerTranslateService.translate('tt_victims');
    private readonly LEVEL_LABEL = this.slormancerTranslateService.translate('level');
    private readonly REAPERSMITH_LABEL = this.slormancerTranslateService.translate('weapon_reapersmith_light');
    private readonly PRIMORDIAL_REAPER_LABEL = this.slormancerTranslateService.translate('tt_reaper_corrupted');
    private readonly GRANTED_BY_MASTERY_LABEL = this.slormancerTranslateService.translate('reaper_mastery_tt_from');

    private readonly DESCRIPTION_SKILL_REGEXP = /act:[0-9]+/g;

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerEffectValueService: SlormancerEffectValueService,
                private slormancerActivableService: SlormancerActivableService) { }

    private getAffinityMultiplier(affinity: number): number {
        return 1 + affinity / 200;
    }

    public getDamages(level: number, base: MinMax, perLevel: MinMax, multiplier: number, affinity: number): MinMax {
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

        const affinityMultiplier =  this.getAffinityMultiplier(affinity);

        return { min: bankerRound(cminr * affinityMultiplier), max: bankerRound(cmaxr * affinityMultiplier) };
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

    public getReaperLevel(xp: number): number {
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

    public getReaperMinimumLevel(reaperId: number): number {
        let result = 1;

        if (!UNITY_REAPERS.includes(reaperId)) {
            const parentsMinLevel = this.slormancerDataService.getParentsGameDataReaper(reaperId)
                .map(parent => parent.MAX_LVL)
                .filter(isNotNullOrUndefined);
            result = Math.max(...parentsMinLevel, 1);
        }

        return result;
    }

    public getReaperParentIds(id: number): number[] {
        const gameData = this.slormancerDataService.getGameDataReaper(id);
        let result: number[] = [ id ];

        if (gameData !== null) {
            result = this.getReaperParents(gameData).map(r => r.REF);
        }
        
        return result;
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

    public getReaperFromGameWeapon(data: GameWeapon, weaponClass: HeroClass, primordial: boolean): Reaper | null {
        const level = this.getReaperLevel(data.basic.experience + data.primordial.experience);
        return this.getReaperById(data.id, weaponClass, primordial, level, 0, data.basic.kills, data.primordial.kills, 0, 0, 0);
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
        return this.getReaper(defaultGameData, weaponClass, false, 1, 0, 0, 0, 0);
    }

    public getReaper(gameData: GameDataReaper, weaponClass: HeroClass, primordial: boolean, baseLevel: number, bonusLevel: number, baseKills: number, primordialKills: number, baseReaperAffinity: number = 0, baseEffectAffinity: number = 0, bonusAffinity: number = 0, masteryLevel = 0): Reaper {
        
        const maxLevel = gameData.MAX_LVL ?? 100;

        let result: Reaper = {
            id: gameData.REF,
            weaponClass,
            type: this.slormancerTranslateService.translate('weapon_' + weaponClass),
            icon: '',
            primordial,
            level: 0,
            masteryLevel,
            baseLevel,
            bonusLevel,
            baseReaperAffinity,
            baseEffectAffinity,
            bonusAffinity,
            reaperAffinity: 0,
            effectAffinity: 0,
            kills: 0,
            baseKills,
            primordialKills,
            name: '',
            description: '',
            benediction: null,
            malediction: null,
            activables: [],
            lore: this.slormancerTemplateService.getReaperLoreTemplate(gameData.EN_LORE),
            templates: this.getReaperTemplates(gameData, weaponClass),
            smith: { id: gameData.BLACKSMITH ?? ReaperSmith.Adrianne, name: '' },
            damageType: 'weapon_damage',
            minLevel: this.getReaperMinimumLevel(gameData.REF),
            maxLevel: maxLevel,
            damages: { min: 0, max: 0 },
            damagesLabel: '',
            maxDamages: { min: 0, max: 0 },
            maxDamagesLabel: '',
            damagesBase: { min: gameData.BASE_DMG_MIN ?? 0, max: gameData.BASE_DMG_MAX ?? 0 },
            damagesLevel: { min: gameData.MIN_DMG_LVL ?? 0, max: gameData.MAX_DMG_LVL ?? 0 },
            damagesMultiplier: gameData.DMG_MULTIPLIER ?? 1,
            benedictionTitleLabel: '',
            maledictionTitleLabel: '',
            activablesTitleLabel: '',
            affinityLabel: '',
            smithLabel: '',
            victimsLabel: '',
            levelLabel: '',
            bonusLevelLabel: '',
            damageTypeLabel: '',
            masteryLabel: null,
        };

        this.updateReaperModel(result);
        this.updateReaperView(result);

        return result;
    }

    public getReaperById(id: number, weaponClass: HeroClass, primordial: boolean, baseLevel: number, bonusLevel: number, kills: number, killsPrimordial: number, reaperAffinity: number = 0, effectAffinity: number = 0, bonusAffinity: number = 0, masteryLevel = 0): Reaper | null {
        const gameData = this.slormancerDataService.getGameDataReaper(id);
        let result: Reaper | null = null;

        if (gameData !== null) {
            result = this.getReaper(gameData, weaponClass, primordial, baseLevel, bonusLevel, kills, killsPrimordial, reaperAffinity, effectAffinity, bonusAffinity, masteryLevel);
        }

        return result;
    }

    private updateEffectValue(value: AbstractEffectValue, reaper: Reaper, affinityMultiplier: number) {
        const context: UpdateEffectValueContext = { globalMultiplier: 5, affinityMultiplier };
        let upgradeValue = reaper.level;
        /*
        // It's probably a good idea to keep it here in case of
        if ((isEffectValueVariable(value) || isEffectValueSynergy(value)) && value.upgradeType === EffectValueUpgradeType.NonPrimordialReaperLevel) {
            upgradeValue = reaper.baseInfo.level;
        }
        */
        const statsUsingRealValues = [
            'summon_skeleton_squire_cost_lock_reduction',
            'aura_equipped_per_aura_active_add',
            'sun_effect_health_regen_global_mult',
            'moon_effect_health_on_hit_global_mult',
            'righteous_sunlight_damage',
            'butterfly_elemental_damage',
            'overdriving_overdrive_damage_percent'
        ]

        if (statsUsingRealValues.includes(value.stat)) {
            context.useOldAffinityFormula = true;
        }

        this.slormancerEffectValueService.updateEffectValue(value, upgradeValue, context);

        const statsRounded = [
            'overdriving_overdrive_damage_percent'
        ];

        if (statsRounded.includes(value.stat)) {
            value.value = round(value.value);
        }
    }

    public useDifferentAffinityForEffects(reaper: Reaper): boolean {
        return reaper.id === 90 && reaper.primordial;
    }

    public updateReaperModel(reaper: Reaper) {
        reaper.baseLevel = Math.min(reaper.maxLevel, Math.max(reaper.baseLevel, reaper.minLevel));
        reaper.kills = reaper.primordial ? reaper.primordialKills : reaper.baseKills;
        reaper.level = reaper.baseLevel + reaper.bonusLevel;
        reaper.baseReaperAffinity = Math.min(MAX_REAPER_AFFINITY_BASE, Math.max(0, reaper.baseReaperAffinity));
        reaper.baseEffectAffinity = Math.min(MAX_EFFECT_AFFINITY_BASE, Math.max(0, reaper.baseEffectAffinity));
        reaper.bonusAffinity = Math.max(0, reaper.bonusAffinity);
        reaper.reaperAffinity = reaper.baseReaperAffinity + reaper.bonusAffinity;
        reaper.effectAffinity = reaper.baseEffectAffinity + reaper.bonusAffinity;
        reaper.maxDamages = this.getDamages(100, reaper.damagesBase, reaper.damagesLevel, reaper.damagesMultiplier, reaper.reaperAffinity);
        reaper.activables = reaper.templates.activables;

        let damageLevel = reaper.level;
        if (reaper.masteryLevel > damageLevel) {
            damageLevel = reaper.masteryLevel;
            reaper.masteryLabel = this.GRANTED_BY_MASTERY_LABEL.replace('@', damageLevel.toString());
        } else {
            reaper.masteryLabel = null;
        }

        reaper.damages = this.getDamages(damageLevel, reaper.damagesBase, reaper.damagesLevel, reaper.damagesMultiplier, reaper.reaperAffinity);

        const effectAffinityMultiplier =  this.getAffinityMultiplier(reaper.effectAffinity);

        for (const reaperEffect of reaper.templates.base) {
            for (const value of reaperEffect.values) {
                this.updateEffectValue(value, reaper, effectAffinityMultiplier);
            }
        }
        for (const reaperEffect of reaper.templates.benediction) {
            for (const value of reaperEffect.values) {
                this.updateEffectValue(value, reaper, effectAffinityMultiplier);
            }
        }
        for (const reaperEffect of reaper.templates.malediction) {
            for (const value of reaperEffect.values) {
                this.updateEffectValue(value, reaper, effectAffinityMultiplier);
            }
        }


        if (reaper.primordial) {
            reaper.activables = [...reaper.activables, ...reaper.templates.primordialSkills];
        }

        for (const activable of reaper.activables) {
            activable.level = reaper.level;
            this.slormancerActivableService.updateActivableModel(activable, { affinityMultiplier: effectAffinityMultiplier });
        }
    }

    public updateReaperView(reaper: Reaper) {
        reaper.icon = 'assets/img/reaper/' + reaper.weaponClass + '/' + reaper.id + (reaper.primordial ? '_p' : '') + '.png';
        reaper.name = this.buildReaperName(reaper.type, reaper.templates.name, reaper.primordial);

        reaper.damagesLabel = reaper.damages.min + '-' + reaper.damages.max;
        reaper.maxDamagesLabel = reaper.maxDamages.min + '-' + reaper.maxDamages.max + ' at level ' + Math.max(reaper.maxLevel, MAX_REAPER_LEVEL);

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
            + (reaper.maxLevel === reaper.baseLevel ? 'Max(' + reaper.baseLevel + ')' : reaper.baseLevel);
        reaper.bonusLevelLabel = reaper.bonusLevel === 0 ? null : '+' + reaper.bonusLevel;
        reaper.damageTypeLabel = this.slormancerTranslateService.translate(reaper.damageType);
        reaper.affinityLabel = reaper.effectAffinity === 0 ? (reaper.reaperAffinity === 0 ? null : reaper.reaperAffinity.toString() ) :  reaper.effectAffinity.toString();
        reaper.benedictionTitleLabel = this.BENEDICTION_LABEL;
        reaper.maledictionTitleLabel = this.MALEDICTION_LABEL;
        reaper.activablesTitleLabel = this.ACTIVABLES_LABEL;
    }
}