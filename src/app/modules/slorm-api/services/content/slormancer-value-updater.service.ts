import { Injectable } from '@angular/core';

import { FAST_SKILL_BASE_COOLDOWN, UNITY_REAPERS } from '../../constants';
import {
    COOLDOWN_MAPPING,
    LIFE_COST_MAPPING,
    MANA_COST_MAPPING,
    MergedStatMapping,
} from '../../constants/content/data/data-character-stats-mapping';
import { ALL_REAPER_SMITH, LegendaryEffect, Skill } from '../../model';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { Activable } from '../../model/content/activable';
import { AncestralLegacy } from '../../model/content/ancestral-legacy';
import { MergedStat } from '../../model/content/character-stats';
import { ClassMechanic } from '../../model/content/class-mechanic';
import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../../model/content/effect-value';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { HeroClass } from '../../model/content/enum/hero-class';
import { MechanicType } from '../../model/content/enum/mechanic-type';
import { ALL_SKILL_COST_TYPES, SkillCostType } from '../../model/content/enum/skill-cost-type';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { Mechanic } from '../../model/content/mechanic';
import { Reaper } from '../../model/content/reaper';
import { Rune } from '../../model/content/rune';
import { isEffectRune, RuneType } from '../../model/content/rune-type';
import { SkillElement } from '../../model/content/skill-element';
import { SkillUpgrade } from '../../model/content/skill-upgrade';
import { Entity } from '../../model/entity';
import { EntityValue } from '../../model/entity-value';
import { MinMax } from '../../model/minmax';
import { add, bankerRound, mult, round } from '../../util/math.util';
import {
    getAllLegendaryEffects,
    isDamageType,
    isEffectValueConstant,
    isEffectValueSynergy,
    isEffectValueVariable,
    isNotNullOrUndefined,
    valueOrDefault,
    valueOrNull,
} from '../../util/utils';
import { SlormancerActivableService } from './slormancer-activable.service';
import { SlormancerAncestralLegacyService } from './slormancer-ancestral-legacy.service';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerMergedStatUpdaterService } from './slormancer-merged-stat-updater.service';
import { SlormancerSkillService } from './slormancer-skill.service';
import { SlormancerStatMappingService } from './slormancer-stat-mapping.service';
import { ExtractedStatMap } from './slormancer-stats-extractor.service';
import { CharacterStatsBuildResult, SkillStatsBuildResult } from './slormancer-stats.service';

interface SkillStats {
    mana: MergedStat<number>;
    life: MergedStat<number>;
    cooldownReduction: MergedStat<number>;
    increasedDamage: MergedStat<number>;
    indirectIncreasedDamage: MergedStat<number>;
    skillIncreasedDamage: MergedStat<number>;
    skillIncreasedAoe: MergedStat<number>;
    dotIncreasedDamage: MergedStat<number>;
    totemIncreasedEffect: MergedStat<number>;
    auraIncreasedEffect: MergedStat<number>;
    aoeIncreasedEffect: MergedStat<number>;
    aoeIncreasedSize: MergedStat<number>;
    minionIncreasedDamage: MergedStat<number>;
    additionalDamages: MergedStat;
    additionalDuration: MergedStat<number>;
    additionalProjectiles: MergedStat<number>;
    characterAdditionalProjectiles: MergedStat<number>;
}

@Injectable()
export class SlormancerValueUpdaterService {

    constructor(private slormancerEffectValueService: SlormancerEffectValueService,
                private slormancerStatMappingService: SlormancerStatMappingService,
                private slormancerMergedStatUpdaterService: SlormancerMergedStatUpdaterService,
                private slormancerAncestrayLegacyService: SlormancerAncestralLegacyService,
                private slormancerActivableService: SlormancerActivableService,
                private slormancerSkillService: SlormancerSkillService,
        ) { }

    private getStatValueOrDefault(stats: Array<MergedStat>, stat: string): MergedStat {
        let result: MergedStat | undefined = stats.find(s => s.stat === stat);

        if (result === undefined) {
            result = {
                allowMinMax: false,
                readonly: false,
                suffix: '',
                precision: 0,
                displayPrecision: undefined,
                stat,
                total: 0,
                totalWithoutSynergy: 0,
                totalDisplayed: 0,
                values: { flat: [], maxPercent: [], max: [], multiplier: [], percent: [], maxMultiplier: [] }
            };
        }
        return result
    }

    private isValidBleedingMultipluer(entity: Entity): boolean {
        let valid = true;

        if ('ancestralLegacy' in entity && entity.ancestralLegacy.id === 61) {
            valid = false;
        } else if ('reaper' in entity && [117, 118].includes(entity.reaper.id)) {
            valid = false;
        }

        return valid;
    }

    private getValidDamageMultipliers(genres: Array<SkillGenre>, skillStats: SkillStats, stats: SkillStatsBuildResult, stat: string, isSkill: boolean, element: SkillElement = SkillElement.Neutral, isDirectDamage: boolean = false): Array<number> {
        const multipliers: Array<number> = [];
        const isBleeding = stat === 'bleed_damage';

        if (!isDirectDamage) {
            multipliers.push(...skillStats.indirectIncreasedDamage.values.multiplier.map(entity => entity.value))
        }

        multipliers.push(skillStats.increasedDamage.values.percent.reduce((t, v) => t + v.value, 0));
        multipliers.push(...skillStats.increasedDamage.values.multiplier
            .map(v => v.value));

        if (isSkill) {
            const percentMultiplier = skillStats.skillIncreasedDamage.values.percent
                .reduce((total, percent) => total = total + percent.value, 0);
            multipliers.push(percentMultiplier);
            multipliers.push(...skillStats.skillIncreasedDamage.values.multiplier
                .filter(v => !isBleeding || this.isValidBleedingMultipluer(v.source))
                .map(v => v.value));
        }
        
        if (genres.includes(SkillGenre.AreaOfEffect)) {
            multipliers.push(skillStats.aoeIncreasedEffect.total);
        }

        if (genres.includes(SkillGenre.Totem)) {
            multipliers.push(skillStats.totemIncreasedEffect.total);
            const totemIncreasedDamage = <MergedStat<number>>stats.stats.find(mergedStat => mergedStat.stat === 'totem_increased_damage');
            if (totemIncreasedDamage !== undefined) {
                multipliers.push(totemIncreasedDamage.total);
            }
        }

        if (genres.includes(SkillGenre.Aura)) {
            multipliers.push(skillStats.auraIncreasedEffect.total);
        }

        if (genres.includes(SkillGenre.Minion)) {
            multipliers.push(skillStats.minionIncreasedDamage.total);
        }

        if (isBleeding || genres.includes(SkillGenre.DamageOverTime)) {
            multipliers.push(skillStats.dotIncreasedDamage.total);
        }

        if (stat == 'bleed_damage') {
            const bleedIncreasedDamage = <MergedStat<number>>stats.stats.find(mergedStat => mergedStat.stat === 'bleed_increased_damage');
            if (bleedIncreasedDamage) {
                multipliers.push(...bleedIncreasedDamage.values.multiplier.map(v => v.value));
            }
        }

        if (element == SkillElement.Lightning) {
            const lightning = this.getStatValueOrDefault(stats.stats, 'lightning_increased_damages');
            multipliers.push(...lightning.values.multiplier.map(v => v.value));
        }

        if (stats.extractedStats['increased_damage_mult_per_potential_projectile'] !== undefined) {
            const increasedDamage = (<EntityValue<number>>stats.extractedStats['increased_damage_mult_per_potential_projectile'][0]).value;
            const projectilesMultiplier = Math.floor(skillStats.additionalProjectiles.total);
            multipliers.push(increasedDamage * projectilesMultiplier);
        }

        return multipliers.filter(v => v !== 0);
    }

    private getValidStatMultipliers(genres: Array<SkillGenre>, skillStats: SkillStats): Array<number> {
        const multipliers: Array<number> = [];
        
        if (genres.includes(SkillGenre.AreaOfEffect)) {
            multipliers.push(skillStats.aoeIncreasedEffect.total);
        }

        if (genres.includes(SkillGenre.Totem)) {
            multipliers.push(skillStats.totemIncreasedEffect.total);
        }

        if (genres.includes(SkillGenre.Aura)) {
            multipliers.push(skillStats.auraIncreasedEffect.total);
        }

        if (genres.includes(SkillGenre.Minion)) {
            multipliers.push(skillStats.minionIncreasedDamage.total);
        }

        return multipliers.filter(v => v !== 0);
    }

    private getValidDurationMultipliers(genres: Array<SkillGenre>, stats: SkillStats): Array<number> {
        const multipliers: Array<number> = [];
        
        if (genres.includes(SkillGenre.Totem)) {
            multipliers.push(stats.totemIncreasedEffect.total);
        }

        if (genres.includes(SkillGenre.Aura)) {
            multipliers.push(stats.auraIncreasedEffect.total);
        }

        if (genres.includes(SkillGenre.AreaOfEffect)) {
            multipliers.push(stats.aoeIncreasedEffect.total);
        }

        return multipliers.filter(v => v !== 0);
    }

    private getSkillStats(stats: SkillStatsBuildResult, character: Character): SkillStats {
        return {
            mana: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'skill_mana_cost'),
            life: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'skill_life_cost'),
            cooldownReduction: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'cooldown_reduction'),
            skillIncreasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'skill_increased_damages'),
            skillIncreasedAoe: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'skill_aoe_increased_size'),
            dotIncreasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'dot_increased_damage'),
            indirectIncreasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'indirect_increased_damage'),
            increasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'increased_damages'),
            totemIncreasedEffect: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'totem_increased_effect'),
            auraIncreasedEffect: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'aura_increased_effect'),
            aoeIncreasedEffect: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'aoe_increased_effect'),
            aoeIncreasedSize: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'aoe_increased_size'),
            minionIncreasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'minion_increased_damage'),
            additionalDamages: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'additional_damage'),
            additionalDuration: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'skill_additional_duration'),
            additionalProjectiles: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'additional_projectile'),
            characterAdditionalProjectiles: <MergedStat<number>>this.getStatValueOrDefault(character.stats, 'additional_projectile'),
        }
    }

    public updateClassMechanic(classMechanic: ClassMechanic, statsResult: SkillStatsBuildResult) {
        const multipliers: Array<number> = [];

        if (classMechanic.genres.includes(SkillGenre.AreaOfEffect)) {
            const aoeStat = <MergedStat<number>>this.getStatValueOrDefault(statsResult.stats, 'aoe_increased_effect');
            multipliers.push(aoeStat.total);

            const aoeSizes = classMechanic.values.filter(value => value.valueType === EffectValueValueType.AreaOfEffect);
            if (aoeSizes.length > 0) {
                const aoeSizeStat = <MergedStat<number>>this.getStatValueOrDefault(statsResult.stats, 'aoe_increased_size');
                for (const aoeSize of aoeSizes) {
                    aoeSize.value = aoeSize.baseValue * (100 + aoeSizeStat.total) / 100;
                    aoeSize.displayValue = round(aoeSize.value, 2);
                }
            }
        }
        if (classMechanic.genres.includes(SkillGenre.DamageOverTime)) {
            const dotStat = <MergedStat<number>>this.getStatValueOrDefault(statsResult.stats, 'dot_increased_damage');
            multipliers.push(dotStat.total);
        }

        if (multipliers.length > 0) {
            for (const value of classMechanic.values) {
                if (isEffectValueSynergy(value) && isDamageType(value.stat)) {
                    const precision = valueOrDefault(value.precision, 0);
                    if (typeof value.synergy === 'number') {
                        for (const multiplier of multipliers) {
                            value.synergy = value.synergy * (100 + multiplier) / 100;
                        } 
                        value.displaySynergy = round(value.synergy, precision);
                    } else {
                        for (const multiplier of multipliers) {
                            value.synergy.min = value.synergy.min * (100 + multiplier) / 100;
                            value.synergy.max = value.synergy.max * (100 + multiplier) / 100;
                        }
                        value.displaySynergy = {
                            min: round(value.synergy.min, precision),
                            max: round(value.synergy.max, precision),
                        };
                    }
                }
            }
        }
    }

    public updateMechanic(mechanic: Mechanic, character: Character, statsResult: SkillStatsBuildResult, config: CharacterConfig) {

        const skillStats = this.getSkillStats(statsResult, character);

        for (const value of mechanic.values) {
            value.value = value.baseValue;

            if (value.valueType === EffectValueValueType.AreaOfEffect) {
                const aoeSizeMultipliers = skillStats.aoeIncreasedSize.total;
                value.value = isEffectValueVariable(value) ? value.upgradedValue : value.baseValue;
                value.value = value.value * (100 + aoeSizeMultipliers) / 100;
                value.displayValue = round(value.value, 2);
            }

            if (value.valueType === EffectValueValueType.Duration) {
                const durationMultipliers = this.getValidStatMultipliers(mechanic.genres, skillStats);
                value.value = isEffectValueVariable(value) ? value.upgradedValue : value.baseValue;
                if (value.percent) {
                    let sumMultiplier = 100;
                    for (const multiplier of durationMultipliers) {
                        sumMultiplier += multiplier;
                    }
                    value.value = value.value * sumMultiplier / 100;
                } else {
                    for (const multiplier of durationMultipliers) {
                        value.value = value.value * (100 + multiplier) / 100;
                    }
                }
                value.displayValue = round(value.value, 3);
            }
            if (isEffectValueSynergy(value) && isDamageType(value.stat)) {
                
                const additionalDamageMultipliers: number[] = [];
                let addedFlatDamage: number | MinMax = 0;

                if (mechanic.type === MechanicType.Burn) {

                    if (config.has_living_inferno_buff) {
                        const burnIncreasedDamageStat = statsResult.extractedStats['living_inferno_burn_increased_damage'];
                        if (burnIncreasedDamageStat) {
                            additionalDamageMultipliers.push((<EntityValue<number>>burnIncreasedDamageStat[0]).value);
                        }
                    }

                    const increasedBurnDamage = statsResult.extractedStats['increased_burn_damage'];
                    if (increasedBurnDamage) {
                        additionalDamageMultipliers.push((<EntityValue<number>>increasedBurnDamage[0]).value);
                    }
                }

                if (mechanic.type === MechanicType.Blorm) {

                    const enduringBlormIncreasedDamage = statsResult.extractedStats['enduring_blorms_blorm_increased_damage'];
                    if (enduringBlormIncreasedDamage) {
                        additionalDamageMultipliers.push((<EntityValue<number>>enduringBlormIncreasedDamage[0]).value);
                    }

                    const blormIncreasedDamage = statsResult.extractedStats['blorm_increased_damage'];
                    if (blormIncreasedDamage) {
                        additionalDamageMultipliers.push((<EntityValue<number>>blormIncreasedDamage[0]).value);
                    }
                    // il faudrait gérer la synergie si d'autres blorm_increased_damage se rajoutent
                    const leg = getAllLegendaryEffects(character.gear).find(legendaryEffect => legendaryEffect.id === 201);
                    if (leg) {
                        const value = (leg.effects[0]?.effect as EffectValueSynergy).synergy as number;
                        additionalDamageMultipliers.push(value);
                    }
                }

                if (mechanic.type === MechanicType.Dart) {
                    const flashingDartAdditionalDamage = <MergedStat>this.getStatValueOrDefault(statsResult.stats, 'flashing_dart_additional_damage')
                    if (flashingDartAdditionalDamage) {
                        addedFlatDamage = add(addedFlatDamage, flashingDartAdditionalDamage.total);
                    }
                }

                this.updateDamage(value, mechanic.genres, skillStats, statsResult, mechanic.element, false, additionalDamageMultipliers, addedFlatDamage);
            }
        }
    }

    public updateReaper(reaper: Reaper, statsResult: SkillStatsBuildResult) {
        const effectValues = [
            ...reaper.templates.base.map(effect => effect.values).flat(),
            ...reaper.templates.benediction.map(effect => effect.values).flat(),
            ...reaper.templates.malediction.map(effect => effect.values).flat()
        ];

        const dotIncreasedDamage = <MergedStat<number>>this.getStatValueOrDefault(statsResult.stats, 'dot_increased_damage')

        if (reaper.id === 53 && statsResult.extractedStats['fate_crusher_reapersmith_all']) {
            const reapersmithAll = statsResult.extractedStats['fate_crusher_reapersmith_all'][0];
            if (reapersmithAll) {
                for (const reapersmith of ALL_REAPER_SMITH) {
                    const smithStat = 'reapersmith_' + reapersmith;

                    let stat = statsResult.extractedStats[smithStat];
                    statsResult.extractedStats[smithStat] = stat ? [ ...stat, reapersmithAll ] : [ reapersmithAll ];
                }

                let stat = statsResult.extractedStats['reaper_bonus'];
                statsResult.extractedStats['reaper_bonus'] = stat ? [ ...stat, reapersmithAll ] : [ reapersmithAll ];
                
            }
            // 
        }

        if (reaper.id === 96) {
            const righteousSunlightAdditionalDamage = <EffectValueSynergy>effectValues.find(effect => effect.stat === 'righteous_sunlight_additional_damage');
            if (righteousSunlightAdditionalDamage) {
                const base = reaper.templates.base[0];
                if (base) {
                    const righteous_damage = base.values[8];
                    if (righteous_damage && isEffectValueSynergy(righteous_damage)) {
                        righteous_damage.synergy = add(righteous_damage.synergy, righteousSunlightAdditionalDamage.synergy);
                        righteous_damage.displaySynergy = round(righteous_damage.synergy, 0);
                    }
                }
            }
        }
        
        for (const effectValue of effectValues) {
            if (effectValue.valueType === EffectValueValueType.AreaOfEffect) {

                let aoeSizeMultipliers = [];                
                const vindictiveMultiplier = <EffectValueSynergy>effectValues.find(effect => isEffectValueSynergy(effect) && effect.stat === 'vindictive_slam_reaper_effect_radius_mult');
                const aoeSizeStat = <MergedStat<number>>this.getStatValueOrDefault(statsResult.stats, 'aoe_increased_size');
                if (vindictiveMultiplier && typeof vindictiveMultiplier.synergy === 'number') {
                    aoeSizeMultipliers.push(vindictiveMultiplier.synergy);
                }
                if (typeof aoeSizeStat.total === 'number') {
                    aoeSizeMultipliers.push(aoeSizeStat.total);
                }

                if ([12, 13, 14].includes(reaper.id)) {
                    const suportstreakIncreasedAoe = <EffectValueSynergy>effectValues.find(effect => effect.stat === 'suport_streak_increased_aoe');
                    if (suportstreakIncreasedAoe) {
                        aoeSizeMultipliers.push(suportstreakIncreasedAoe.value);
                    }
                }

                if (reaper.id === 29) {
                    aoeSizeMultipliers = [];
                    const auraIncreasedEffect = <MergedStat<number>>this.getStatValueOrDefault(statsResult.stats, 'aura_increased_effect');
                    if (auraIncreasedEffect) {
                        aoeSizeMultipliers.push(auraIncreasedEffect.total);
                    }
                    const auraIncreasedSize = <MergedStat<number>>this.getStatValueOrDefault(statsResult.stats, 'aura_increased_size');
                    if (auraIncreasedSize) {
                        aoeSizeMultipliers.push(auraIncreasedSize.total);
                    }
                }

                effectValue.value = aoeSizeMultipliers.reduce((total, mult) => total * (100 + mult) / 100, effectValue.baseValue);
                effectValue.displayValue = round(effectValue.value, 2);
            }
            // special interactions
            if (isEffectValueSynergy(effectValue) && isDamageType(effectValue.stat) && [65, 66, 67].includes(reaper.id)) {
                let aoeEffectMultipliers = [];
                const isSlamDamages = reaper.templates.base.map(effect => effect.values).flat().includes(effectValue);
                const vindictiveMultiplier = <EffectValueSynergy>effectValues.find(effect => isEffectValueSynergy(effect) && effect.stat === 'vindictive_slam_reaper_effect_elemental_damage_mult');
                const aoeEffectStat = <MergedStat<number>>this.getStatValueOrDefault(statsResult.stats, 'aoe_increased_effect');
                if (vindictiveMultiplier && typeof vindictiveMultiplier.synergy === 'number' && isSlamDamages) {
                    aoeEffectMultipliers.push(vindictiveMultiplier.synergy);
                }
                if (typeof aoeEffectStat.total === 'number') {
                    aoeEffectMultipliers.push(aoeEffectStat.total);
                }

                effectValue.synergy = mult(effectValue.synergy, ...aoeEffectMultipliers);
                effectValue.displaySynergy = round(effectValue.synergy, 0);
            }
            if (isEffectValueSynergy(effectValue) && isDamageType(effectValue.stat)) {

                if (reaper.id === 17) {
                    const disintegrationIncreasedDamage = <EffectValueSynergy>effectValues.find(effect => effect.stat === 'disintegration_increased_damage');
                    if (disintegrationIncreasedDamage) {
                        effectValue.synergy = mult(effectValue.synergy, disintegrationIncreasedDamage.displayValue);
                        effectValue.displaySynergy = round(effectValue.synergy, 0);
                    }
                }
                if (reaper.id === 27) {
                    const alphaOmegaIncreasedDamage = <EffectValueSynergy>effectValues.find(effect => isEffectValueSynergy(effect) && effect.stat === 'alpha_omega_orbs_increased_damage');
                    if (alphaOmegaIncreasedDamage && typeof alphaOmegaIncreasedDamage.synergy === 'number') {
                        effectValue.synergy = mult(effectValue.synergy, alphaOmegaIncreasedDamage.synergy);
                        effectValue.displaySynergy = round(effectValue.synergy, 0);
                    }
                }
                if (reaper.id === 53) {
                    const slormHammerIncreasedDamage = <EffectValueSynergy>effectValues.find(effect => effect.stat === 'slorm_hammer_increased_damages');
                    if (slormHammerIncreasedDamage) {
                        effectValue.synergy = mult(effectValue.synergy, slormHammerIncreasedDamage.displayValue);
                        effectValue.displaySynergy = round(effectValue.synergy, 0);
                    }
                }
                if (reaper.id === 57 || reaper.id === 58) {
                    const fireworkIncreasedDamage = <EffectValueSynergy>effectValues.find(effect => effect.stat === 'inner_weakness_increased_damage');
                    if (fireworkIncreasedDamage) {
                        effectValue.synergy = mult(effectValue.synergy, fireworkIncreasedDamage.displayValue);
                        effectValue.displaySynergy = round(effectValue.synergy, 0);
                    }
                }
                if (reaper.id === 77) {
                    const imbueIncreasedDamage = statsResult.extractedStats['imbued_skills_and_ancestral_beam_increased_damage_per_imbue'];
                    const equippedImbues = statsResult.extractedStats['equipped_imbues'];
                    if (imbueIncreasedDamage && equippedImbues) {
                        const imbueIncreasedDamageStat = imbueIncreasedDamage[0];
                        const equippedImbuesStat = equippedImbues[0];
                        if (imbueIncreasedDamageStat && equippedImbuesStat) {
                            const multiplier = imbueIncreasedDamageStat.value * equippedImbuesStat.value;
                            effectValue.synergy = mult(effectValue.synergy, multiplier);
                            effectValue.displaySynergy = round(effectValue.synergy, 0);
                        }
                    }
                }
                if (UNITY_REAPERS.includes(reaper.id)) {
                    const vigilantBladeAdditionalDamage = <EffectValueSynergy>effectValues.find(effect => effect.stat === 'vigilant_blade_additional_damage');
                    if (vigilantBladeAdditionalDamage) {
                        effectValue.synergy = add(effectValue.synergy, vigilantBladeAdditionalDamage.displaySynergy);
                        effectValue.displaySynergy = round(effectValue.synergy, 0);
                    }
                    
                }

                if ([12, 13, 14].includes(reaper.id)) {
                    const suportStreakIncreasedDamage = <EffectValueSynergy>effectValues.find(effect => effect.stat === 'suport_streak_increased_damage');
                    if (suportStreakIncreasedDamage) {
                        effectValue.synergy = mult(effectValue.synergy, suportStreakIncreasedDamage.value);
                        effectValue.displaySynergy = round(effectValue.synergy, 0);
                    }
                }

                // deadly accuracy damage over time
                if ([87, 88, 89].includes(reaper.id)) {
                    effectValue.synergy = mult(effectValue.synergy, dotIncreasedDamage.total);
                    effectValue.displaySynergy = round(effectValue.synergy, 0);
                }
            }
            
            if (effectValue.stat === 'berzerker_additional_damage' && isEffectValueSynergy(effectValue)) {
                const berzerkerAdditionalDamageMultiplier = <EffectValueVariable>effectValues.find(effect => effect.stat === 'berzerker_additional_damage_mult');
                if (berzerkerAdditionalDamageMultiplier) {
                    effectValue.synergy = mult(effectValue.synergy, berzerkerAdditionalDamageMultiplier.value);
                    effectValue.displaySynergy = round(effectValue.synergy, 0);
                }
            }

            if (effectValue.stat === 'drum_cast_2_chance_to_pierce_percent' && isEffectValueVariable(effectValue)) {
                const pierceMult = effectValues.find(value => value.stat === 'chance_to_pierce_global_mult');
                if (pierceMult) {
                    effectValue.upgradedValue = effectValue.upgradedValue * (100 + pierceMult.value) / 100;
                    effectValue.value = effectValue.value * (100 + pierceMult.value) / 100;
                    effectValue.displayValue = round(effectValue.value, 3);
                }
            }

            if (effectValue.stat === 'drum_cast_3_fork_chance_percent' && isEffectValueVariable(effectValue)) {
                const forkMult = effectValues.find(value => value.stat === 'fork_chance_global_mult');
                if (forkMult) {
                    effectValue.upgradedValue = effectValue.upgradedValue * (100 + forkMult.value) / 100;
                    effectValue.value = effectValue.value * (100 + forkMult.value) / 100;
                    effectValue.displayValue = round(effectValue.value, 3);
                }
            }
        }
    }

    private getSpecificStat<T extends number | MinMax>(stats: ExtractedStatMap, mapping: MergedStatMapping, config: CharacterConfig, specificstats: ExtractedStatMap = {}): T {
        // TODO factoriser avec la version faite sur stat mapping service
        const mergedStat = this.slormancerStatMappingService.buildMergedStat({ ...stats, ...specificstats }, mapping, config);
        this.slormancerMergedStatUpdaterService.updateStatTotal(mergedStat);
        return <T>mergedStat.total;
    }

    private updateActivableCost(stats: ExtractedStatMap, config: CharacterConfig, source: Activable | AncestralLegacy) {
        const costAdd: Array<EntityValue<number>> = [];
        const entity: Entity = 'level' in source ? { activable: source } : { ancestralLegacy: source }
        
        if (stats['mana_cost_add']) {
            costAdd.push(...stats['mana_cost_add']);
        }

        let baseCost = source.baseCost;
        if (baseCost !== null) {
            if ('activable' in entity) {
                if (source.id === 55) {
                    const entityValue = stats['mana_is_overrated_mana_lock_percent'];
                    if (entityValue) {
                        baseCost = (entityValue[0] as EntityValue<number>).value;
                    }
                }
                
                costAdd.push({ value: baseCost, source: entity });
            } else if (entity.ancestralLegacy.currentRankCost !== null) {
                costAdd.push({ value: entity.ancestralLegacy.currentRankCost, source: entity });
            }
        }

        if (stats['mana_cost_to_life_cost'] && config.has_life_bargain_buff && source.hasManaCost && ('level' in source || source.isActivable)) {
            if (source.costType === SkillCostType.ManaPercent) {
                source.costType = SkillCostType.LifePercent;
            }
            if (source.costType === SkillCostType.Mana) {
                source.costType = SkillCostType.Life;
            }
            
            if ('activable' in entity) {
                this.slormancerActivableService.updateActivableCostType(entity.activable);
            } else {
                this.slormancerAncestrayLegacyService.updateAncestralLegacyCostType(entity.ancestralLegacy);
            }
        }

        const skillCostStats: ExtractedStatMap = {
            mana_cost_add: costAdd,
            life_cost_add: costAdd,
            cost_type: [{ value: ALL_SKILL_COST_TYPES.indexOf(source.costType), source: entity }],
        };

        if ('activable' in entity) {
            skillCostStats['activable_id'] = [{ value: entity.activable.id, source: entity }];
        } else {
            skillCostStats['ancestral_legacy_id'] = [{ value: entity.ancestralLegacy.id, source: entity }];
        }

        const mapping = source.hasLifeCost ? LIFE_COST_MAPPING : MANA_COST_MAPPING;
        
        source.cost = Math.max(0, this.getSpecificStat(stats, mapping, config, skillCostStats));

        // Saving mana cost without skeleton for total squires computing
        if (source.id === 17 && 'level' in source) {
            skillCostStats['no_skeletons'] = [{ value: 1, source: entity }];
            source.unbuffedCost = Math.max(0, this.getSpecificStat(stats, mapping, config, skillCostStats));
        }
    }

    private getActivableCooldown(stats: ExtractedStatMap, config: CharacterConfig, source: Activable | AncestralLegacy, cooldownReduction: number): number {
        let result = 0;

        if (source.baseCooldown !== null) {
            const extraStats: ExtractedStatMap = {};
            const cooldownstats: Array<EntityValue<number>> = [];
            const entity: Entity = 'level' in source ? { activable: source } : { ancestralLegacy: source }
            
            if (source.genres.includes(SkillGenre.Movement)) {
                extraStats['skill_is_movement'] = [ { source: entity, value: 1 } ];
            }
            
            if (stats['cooldown_time_add']) {
                cooldownstats.push(...stats['cooldown_time_add']);
            }
            if (source.baseCooldown !== null) {
                if ('activable' in entity) {
                    cooldownstats.push({ value: source.baseCooldown, source: entity });
                } else if (entity.ancestralLegacy.baseCooldown !== null) {
                    cooldownstats.push({ value: entity.ancestralLegacy.baseCooldown, source: entity });
                }
            }

            if (source.costType !== SkillCostType.None) {
                extraStats['cost_type'] = [ { value: ALL_SKILL_COST_TYPES.indexOf(source.costType), source: entity } ];
            }

            extraStats['cooldown_time_add'] = cooldownstats;
            extraStats['activable_id'] = [ { value: source.id, source: entity } ];

            let minCooldown = 0;
            const minCooldownStat = stats['min_cooldown_time'];
            if (minCooldownStat !== undefined && minCooldownStat.length > 0) {
                minCooldown = Math.min(...minCooldownStat.map(v => v.value));
            }

            const cooldown = Math.max(minCooldown, this.getSpecificStat<number>(stats, COOLDOWN_MAPPING, config, extraStats));
            
            result = Math.max(0, round(cooldown * (100 - cooldownReduction) / 100, 2));
        }

        return result;
    }

    private getSkillCooldown(stats: SkillStatsBuildResult, config: CharacterConfig, skill: Skill, cooldownReduction: number): number {
        let result = 0;

        if (skill.baseCooldown !== null) {
            
            const extraStats: ExtractedStatMap = {};

            extraStats['cost_type'] = [
                { value: ALL_SKILL_COST_TYPES.indexOf(skill.manaCostType), source: { skill } },
                { value: ALL_SKILL_COST_TYPES.indexOf(skill.lifeCostType), source: { skill } }
            ];
            
            if (skill.genres.includes(SkillGenre.Movement)) {
                extraStats['skill_is_movement'] = [ { source: { skill }, value: 1 } ];
            }

            const masteryCooldownReduction = stats.stats.find(s => s.stat === 'mastery_cooldown_time_reduction_multiplier');
            if (masteryCooldownReduction) {
                const value = typeof masteryCooldownReduction.total === 'number' ? masteryCooldownReduction.total : masteryCooldownReduction.total.min;
                extraStats['cooldown_time_reduction_multiplier'] = [ { source: { skill }, value } ];
                
            }
    
            if (skill.genres.includes(SkillGenre.Fast)) {
                extraStats['cooldown_time_add'] = [ { source: { skill }, value: FAST_SKILL_BASE_COOLDOWN } ];
            } else if (stats.extractedStats['cooldown_time_add']) {
                extraStats['cooldown_time_add'] = [ ...stats.extractedStats['cooldown_time_add'] ];
            }
             
            extraStats['skill_id'] = [ { value: skill.id, source: { skill } } ];

            let minCooldown = 0;
            const minCooldownStat = stats.extractedStats['min_cooldown_time'];
            if (minCooldownStat !== undefined && minCooldownStat.length > 0) {
                minCooldown = Math.min(...minCooldownStat.map(v => v.value));
            }

            const cooldown = Math.max(minCooldown, this.getSpecificStat<number>(stats.extractedStats, COOLDOWN_MAPPING, config, extraStats));
            
            result = Math.max(0, round(cooldown * (100 - cooldownReduction) / 100, 2));
        }

        return result;
    }

    public updateActivable(character: Character, activable: Activable, statsResult: SkillStatsBuildResult, config: CharacterConfig) {
        const skillStats = this.getSkillStats(statsResult, character);

        const slot = this.getActivableSlot(character, activable);
        const extractedStats = this.addActivableExtraStats(statsResult, slot, activable);

        // Manabender (activable) cooldown
        if (activable.id === 2) {
            const manaRegen = character.stats.find(stat => stat.stat === 'mana_regeneration');
            const manaMax = character.stats.find(stat => stat.stat === 'max_mana');

            if (manaRegen !== undefined && manaMax !== undefined && typeof manaRegen.total === 'number' && typeof manaMax.total === 'number') {
                activable.baseCooldown = round(manaMax.total / manaRegen.total, 2);
            }
        }

        this.updateActivableCost(extractedStats, config, activable);
        activable.cooldown = this.getActivableCooldown(extractedStats, config, activable, skillStats.cooldownReduction.total);
        
        for (const value of activable.values) {
            const isSynergy = isEffectValueSynergy(value);
            if (isSynergy || activable.id === 21) {
                if (isDamageType(value.stat)) {
                    const additionalMultipliers: Array<number> = [];

                    additionalMultipliers.push(...this.getAmhenostDamageMultiplier(statsResult, slot));

                    // Unstable bones increase damage multiplier (+ bug precision)
                    if (activable.id === 18) {
                        const unstableBonesIncreasedDamages = statsResult.stats.find(stat => stat.stat === 'unstable_bones_increased_damages');
                        if (unstableBonesIncreasedDamages !== undefined) {
                            additionalMultipliers.push(...unstableBonesIncreasedDamages.values.flat.map(flat => <number>flat.value));
                        }
                    }

                    // mini keeper increase damage multiplier (+ bug precision)
                    if (activable.id === 21) {
                        const miniKeeperIncreasedDamages = statsResult.stats.find(stat => stat.stat === 'mini_keeper_increased_damage');
                        if (miniKeeperIncreasedDamages !== undefined) {
                            additionalMultipliers.push(...miniKeeperIncreasedDamages.values.flat.map(flat => <number>flat.value));
                        }
                    }

                    // Reaper storm increase damage multiplier
                    if (activable.id === 56) {
                        const miniKeeperIncreasedDamages = statsResult.extractedStats['reaper_storm_increased_damage'];
                        if (miniKeeperIncreasedDamages !== undefined) {
                            additionalMultipliers.push(...miniKeeperIncreasedDamages.map(flat => <number>flat.value));
                        }
                    }

                    // mini keeper increase damage multiplier (+ bug precision)
                    if (activable.id === 32 && config.use_enemy_state) {

                        const horrifiedMaxStacksStat = statsResult.extractedStats['horrified_max_stacks'];
                        const enemyHorrifiedDamageStat = statsResult.extractedStats['horrified_stack_increased_damage'];
                        
                        if (horrifiedMaxStacksStat !== undefined && enemyHorrifiedDamageStat !== undefined) {
                            const horrifiedMaxStacksStatValue = horrifiedMaxStacksStat[0];
                            const enemyHorrifiedDamageStatValue = enemyHorrifiedDamageStat[0];
                            if (horrifiedMaxStacksStatValue !== undefined && enemyHorrifiedDamageStatValue !== undefined) {
                                const horrifiedStacks = Math.max(0, Math.min(config.enemy_horrified_stacks, horrifiedMaxStacksStatValue.value));
                                additionalMultipliers.push(enemyHorrifiedDamageStatValue.value * horrifiedStacks);
                            }
                        }
                    }

                    if (isSynergy) {
                        this.updateDamage(value, activable.genres, skillStats, statsResult, SkillElement.Neutral, false, additionalMultipliers);
                    } else {
                        // special case mini keeper
                        const multipliers = this.getValidDamageMultipliers(activable.genres, skillStats, statsResult, value.stat, false);
                        value.value = mult(value.baseValue, ...multipliers, ...additionalMultipliers);
                        value.displayValue = bankerRound(value.value, 2);
                    }
                }
            } else if (value.valueType === EffectValueValueType.AreaOfEffect) {
                value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;

                // Mana harvest increased aoe size multiplier
                if (activable.id === 13) {
                    const manaHarvestAoeIncreasedSizeValues = statsResult.extractedStats['aoe_increased_size_multiplier_mana_harvest'];
                    const manaHarvestAoeIncreasedSize = valueOrNull(manaHarvestAoeIncreasedSizeValues !== undefined ? manaHarvestAoeIncreasedSizeValues[0] : null)
                    if (manaHarvestAoeIncreasedSize !== null) {
                        value.value = value.value * (100 + manaHarvestAoeIncreasedSize.value) / 100;
                    }
                }

                // aura increase aoe
                if (activable.genres.includes(SkillGenre.Aura)) {
                    const auraAoeIncreasedSizePercentStat = statsResult.stats.find(stat => stat.stat === 'aura_aoe_increased_size_percent');
                    if (auraAoeIncreasedSizePercentStat !== undefined) {
                        value.value = value.value * (100 + (auraAoeIncreasedSizePercentStat.total as number)) / 100;
                    }
                }

                value.displayValue = bankerRound(value.value, 2);
            } else if (value.valueType === EffectValueValueType.Duration) {
                // Massacre increased duration
                if (activable.id === 31) {
                    const massacreIncreasedDurationValues = statsResult.extractedStats['massacre_increased_duration'];
                    const massacreIncreasedDuration = valueOrNull(massacreIncreasedDurationValues !== undefined ? massacreIncreasedDurationValues[0] : null)
                    if (massacreIncreasedDuration !== null) {
                        value.value = value.value * (100 + massacreIncreasedDuration.value) / 100;
                    }
                }

                value.displayValue = bankerRound(value.value, 2);

            } else if (value.valueType !== EffectValueValueType.Static)  {
                const statMultipliers = this.getValidStatMultipliers(activable.genres, skillStats);
                value.value = isEffectValueVariable(value) ? value.upgradedValue : value.baseValue;
                if (value.percent) {
                    let sumMultiplier = 100;
                    for (const multiplier of statMultipliers) {
                        sumMultiplier += multiplier;
                    }
                    value.value = value.value * sumMultiplier / 100;
                } else {
                    for (const multiplier of statMultipliers) {
                        value.value = value.value * (100 + multiplier) / 100;
                    }
                }
                value.displayValue = round(value.value, 3);
            }
        }
    }

    private getActivableSlot(character: Character, activable: Activable | AncestralLegacy): number | null {
        let slot = null;
        if (character.activable1 === activable) {
            slot = 1;
        } else if (character.activable2 === activable) {
            slot = 2;
        } else if (character.activable3 === activable) {
            slot = 3;
        } else if (character.activable4 === activable) {
            slot = 4;
        }

        return slot
    }

    private addActivableExtraStats(statsResult: SkillStatsBuildResult, slot: number | null, activable: Activable | AncestralLegacy) {
        let extractedStats = statsResult.extractedStats;
        if (slot !== null) {
            const extra: ExtractedStatMap = {
                'activable_slot': [ { source: { synergy: 'Activable slot' }, value: slot }]
            };

            const nonSecondSlotActivableCostReduction = statsResult.stats.find(stat => stat.stat === 'non_second_slot_activable_cost_reduction');
            if (nonSecondSlotActivableCostReduction) {
                const value = typeof nonSecondSlotActivableCostReduction.total === 'number'
                    ? nonSecondSlotActivableCostReduction.total
                    : nonSecondSlotActivableCostReduction.total.min;
                extra['non_second_slot_activable_cost_reduction'] = [
                    { source: { synergy: 'Istrahsil non second slot effect' }, value }
                ];
            }

            const nonFirstSlotCooldownReductionGlobalMult = statsResult.stats.find(stat => stat.stat === 'non_first_slot_cooldown_reduction_global_mult');
            if (nonFirstSlotCooldownReductionGlobalMult) {
                const value = typeof nonFirstSlotCooldownReductionGlobalMult.total === 'number'
                    ? nonFirstSlotCooldownReductionGlobalMult.total
                    : nonFirstSlotCooldownReductionGlobalMult.total.min;
                extra['non_first_slot_cooldown_reduction_global_mult'] = [
                    { source: { synergy: 'Odhor non first slot effect' }, value }
                ];
            }

            extractedStats = { 
                ...extractedStats,
                ...extra,
            } as ExtractedStatMap;
        }

        return extractedStats;
    }
    
    public updateAncestralLegacyActivable(character: Character, config: CharacterConfig, ancestralLegacy: AncestralLegacy, statsResult: SkillStatsBuildResult) {
        const skillStats = this.getSkillStats(statsResult, character);

        const slot = this.getActivableSlot(character, ancestralLegacy);
        const extractedStats = this.addActivableExtraStats(statsResult, slot, ancestralLegacy);

        if (ancestralLegacy.currentRankCost !== null) {
            this.updateActivableCost(extractedStats, config, ancestralLegacy);
        }
        if (ancestralLegacy.baseCooldown !== null) {
            ancestralLegacy.cooldown = this.getActivableCooldown(extractedStats, config, ancestralLegacy, skillStats.cooldownReduction.total);
        }

        const isIcyVeins = ancestralLegacy.id === 29;
        const isConsistencyIsKey = ancestralLegacy.id === 31;
        const isWildSlap = ancestralLegacy.id === 92;

        for (const value of ancestralLegacy.values) {
            if (isEffectValueSynergy(value)) {

                let multipliers: number[] = [];

                multipliers.push(...this.getAmhenostDamageMultiplier(statsResult, slot));
                
                // spark machine and high voltage interaction
                if (ancestralLegacy.id === 30) {
                    const highVoltageMaxStacks = extractedStats['high_voltage_max_stacks'];
                    const highVoltageStackIncreasedDamage = extractedStats['high_voltage_stack_spark_machine_increased_damage'];

                    if (highVoltageMaxStacks && highVoltageMaxStacks[0] && highVoltageStackIncreasedDamage && highVoltageStackIncreasedDamage[0]) {
                        multipliers.push(highVoltageStackIncreasedDamage[0].value * Math.min(config.high_voltage_stacks, highVoltageMaxStacks[0].value));
                    }
                }

                if (isDamageType(value.stat)) {
                    this.updateDamage(value, ancestralLegacy.genres, skillStats, statsResult, ancestralLegacy.element, false, multipliers);
                }
            } else if (value.valueType === EffectValueValueType.AreaOfEffect) {
                value.value = value.baseValue;
                // aura increase aoe
                if (ancestralLegacy.genres.includes(SkillGenre.Aura)) {
                    const auraAoeIncreasedSizePercentStat = statsResult.stats.find(stat => stat.stat === 'aura_aoe_increased_size_percent');
                    if (auraAoeIncreasedSizePercentStat !== undefined) {
                        value.value = value.value * (100 + (auraAoeIncreasedSizePercentStat.total as number)) / 100;
                    }
                }

                value.value = value.value * (100 + skillStats.aoeIncreasedSize.total) / 100;
                value.displayValue = bankerRound(value.value, 2);
            } else if (value.valueType === EffectValueValueType.Duration) {
                value.value = value.baseValue;
                if (value.stat === 'avatar_of_shadow_duration') {
                    const avatarOfShadowDurationAdd = extractedStats['avatar_of_shadow_duration_add'];
                    if (avatarOfShadowDurationAdd !== undefined) {
                        for (const addedValue of avatarOfShadowDurationAdd) {
                            value.value = value.value + addedValue.value;
                        }
                    }
                }

                value.displayValue = bankerRound(value.value, 2);
            } else if (value.valueType !== EffectValueValueType.Static && !isIcyVeins) {
                const statMultipliers = this.getValidStatMultipliers(ancestralLegacy.genres, skillStats);
                value.value = isEffectValueVariable(value) ? value.upgradedValue : value.baseValue;
                if (value.percent) {
                    if (!isWildSlap) {
                        let sumMultiplier = 100;
                        for (const multiplier of statMultipliers) {
                            if (isConsistencyIsKey) {
                                sumMultiplier -= multiplier;
                            } else {
                                sumMultiplier += multiplier;
                            }
                        }
                        value.value = value.value * Math.max(0, sumMultiplier) / 100;

                        if (isConsistencyIsKey) {
                            value.value = Math.max(1, value.value);
                        }
                    }
                } else {
                    for (const multiplier of statMultipliers) {
                        value.value = value.value * (100 + multiplier) / 100;
                    }
                }
                value.displayValue = round(value.value, 3);
            }

            if (ancestralLegacy.id === 1) {
                const auraReduction = Math.min(50, skillStats.auraIncreasedEffect.total);
                const value = ancestralLegacy.values[0] as EffectValueVariable;
                value.value = value.upgradedValue * (100 - auraReduction) / 100;
                value.displayValue = round(value.value, 3);
            }
        }
    }

    public updateSkillAndUpgradeValues(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, stats: SkillStatsBuildResult, config: CharacterConfig): Array<SkillUpgrade> {
        const skillStats = this.getSkillStats(stats, character);

        this.updateSkillValues(skillAndUpgrades, skillStats, stats, config);

        // hack to add multiply and conquer bug
        if (skillAndUpgrades.skill.heroClass === HeroClass.Huntress && skillAndUpgrades.skill.id === 5 && skillAndUpgrades.activeUpgrades.includes(45) && skillAndUpgrades.activeUpgrades.includes(52)) {
            const critChanceToRemove = <number>skillAndUpgrades.upgrades.find(u => u.id === 45)?.values[0]?.value;
            const multiplyAndConquerSynergy = <EffectValueSynergy>skillAndUpgrades.upgrades.find(u => u.id === 52)?.values[0];

            (<number>multiplyAndConquerSynergy.synergy) -= critChanceToRemove;
            (<number>multiplyAndConquerSynergy.displaySynergy) -= critChanceToRemove;
        }

        for (const upgrade of skillAndUpgrades.upgrades) {
            this.updateUpgradeValues(upgrade, skillStats, stats);
        }

        return [];
    }

    public precomputeRunePowerAndEffect(character: Character, additionalRunes: Array<Rune>, stats: CharacterStatsBuildResult, config: CharacterConfig) {
        const allRunes = [character.runes.activation, character.runes.effect, character.runes.enhancement, ...additionalRunes].filter(isNotNullOrUndefined);

        // trouver pourquoi ça déconne ici
        let reduced_power = stats.extractedStats['effect_rune_reduced_power'] ? valueOrNull(stats.extractedStats['effect_rune_reduced_power'][0]?.value) : null;
        // utiliser effect_rune_increased_power une fois le bug corrigé
        const increased_power = stats.extractedStats['effect_rune_increased_effect'] ? valueOrNull(stats.extractedStats['effect_rune_increased_effect'][0]?.value) : null;
        const power_override = stats.extractedStats['rune_power_override'] ? valueOrNull(stats.extractedStats['rune_power_override'][0]?.value) : null;
        
        if (reduced_power !== null) {
            let enhancement_rune_increased_effect = stats.stats.find(stat => stat.stat === 'enhancement_rune_increased_effect');
            if (enhancement_rune_increased_effect) {
                reduced_power = reduced_power * (100 + (<MergedStat<number>>enhancement_rune_increased_effect).total) / 100;
            }
        }

        for (const rune of allRunes) {
            if (isEffectRune(rune)) {
                if (reduced_power !== null) {
                    rune.constraint = bankerRound(rune.baseConstraint * (100 - reduced_power) / 100, 2);
                } else if (increased_power !== null) {
                    rune.constraint = bankerRound(rune.baseConstraint * (100 + increased_power) / 100, 2);
                } else if (power_override !== null) {
                    rune.constraint = power_override;
                }
                stats.changed.runes.push(rune);
            }
        }

        const power = character.runes.effect !== null ? character.runes.effect.constraint : 100;

        const powerMultiplier = power / 100;
        const effectMultiplier = (100 + <number>valueOrDefault(stats.stats.find(stat => stat.stat === 'effect_rune_effect')?.total, 100)) / 100;
        const ignoredEffectMultiplierStats = [
            'inner_fire_chance_percent',
            'firework_trigger_chance',
            'brut_chance_percent',
            'crit_chance_percent',
            'unrelenting_stacks_max',
            'min_basic_damage_add',
            'afflict_chance',
            'afflict_duration',
            'alpha_omega_mana_treshold',
            'alpha_omega_increased_damage',
            'alpha_omega_increased_size',
            'prime_totem_shoot_count',
            'prime_totem_duration',
            'mana_harvest_duration',
            'cooldown_reduction_per_walk',
            'cooldown_reduction_per_walk_distance',
            'max_skeleton_count',
        ];

        for (const rune of allRunes) {
            let changed = false;

            if (rune.activable !== null && rune.id === 4 && rune.activable.baseCooldown !== null) {
                const durationReduction = rune.values[0];

                if (durationReduction) {
                    rune.activable.baseCooldown = (rune.activable.baseCooldown - durationReduction.value) * powerMultiplier;
                    changed = true;
                }
            }

            if (rune.type === RuneType.Activation) {
                for (const effectValue of rune.values) {
                    if ((isEffectValueVariable(effectValue) || isEffectValueSynergy(effectValue))) {
                        this.slormancerEffectValueService.updateRuneEffectValue(effectValue, rune.level,powerMultiplier);
                        changed = true;
                    }
                }
            }

            if (rune.type === RuneType.Effect) {
                for (const effectValue of rune.values) {
                    if (isEffectValueVariable(effectValue) || isEffectValueSynergy(effectValue)) {
                        if (!ignoredEffectMultiplierStats.includes(effectValue.stat) && (!isEffectValueSynergy(effectValue) || (effectValue.source !== 'victims_current_reaper' && effectValue.source !== 'max_mana'))) {
                            // thornbite only has 75% of the effect it should have
                            const thornbiteBugMultiplier = rune.id === 12 ? 0.75 : 1;
                            this.slormancerEffectValueService.updateRuneEffectValue(effectValue, rune.level, effectMultiplier * thornbiteBugMultiplier);
                            changed = true;
                        }
                    }
                }
            }

            if (rune.id === 22) {
                for (const effectValue of rune.values) {
                    if (isEffectValueVariable(effectValue) && effectValue.stat === 'effect_rune_trigger_chance') {
                        const triggerMultiplier =  1 + (100 - power) / 200;
                        this.slormancerEffectValueService.updateRuneEffectValue(effectValue, rune.level,triggerMultiplier);
                        changed = true;
                    }
                }
            }

            if (changed) {
                stats.changed.runes.push(rune);
            }
        }
    }

    public updateRuneValues(character: Character, additionalRunes: Array<Rune>, stats: CharacterStatsBuildResult, config: CharacterConfig) {
        const skillStats = this.getSkillStats(stats, character);
        const allRunes = [character.runes.activation, character.runes.effect, character.runes.enhancement, ...additionalRunes].filter(isNotNullOrUndefined);

        for (const rune of allRunes) {
            let changed = false;
            for (const effectValue of rune.values) {
                if (effectValue.valueType === EffectValueValueType.AreaOfEffect) {
                    const aoeMultiplier = skillStats.aoeIncreasedSize.total
                    effectValue.value = effectValue.baseValue * (100 + aoeMultiplier) / 100;
                    effectValue.displayValue = bankerRound(effectValue.value, 2);
                    changed = true;
                }
            }

            if (rune.id === 16) {
                const canonDamage = <EffectValueSynergy | undefined>rune.values[1];
                const maxCanonDamage = <EffectValueVariable | undefined>rune.values[0];

                if (canonDamage && maxCanonDamage) {

                    canonDamage.displaySynergy = Math.min(<number>canonDamage.displaySynergy, maxCanonDamage.displayValue);
                    changed = true;
                }
            }

            if (changed) {
                stats.changed.runes.push(rune);
            }
        }
    }

    public updateLegendaryValues(character: Character, legendaryEffect: LegendaryEffect, stats: CharacterStatsBuildResult): boolean {
        let changed = false;
        const skillStats = this.getSkillStats(stats, character);

        for (const effect of legendaryEffect.effects) {
            const value = effect.effect;
            if (value.valueType === EffectValueValueType.AreaOfEffect) {
                if (isEffectValueSynergy(value)) {
                    const precision = valueOrDefault(value.precision, 0);
                    if (typeof value.synergy === 'number') {
                        value.synergy = value.synergy * (100 + skillStats.aoeIncreasedEffect.total) / 100;
                        value.displaySynergy = bankerRound(value.synergy, precision);
                    } else {
                        value.synergy.min = value.synergy.min * (100 + skillStats.aoeIncreasedEffect.total) / 100;
                        value.synergy.max = value.synergy.max * (100 + skillStats.aoeIncreasedEffect.total) / 100;
                        value.displaySynergy = {
                            min: bankerRound(value.synergy.min, precision),
                            max: bankerRound(value.synergy.max, precision)
                        }
                    }
                } else {
                    value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;
                    value.displayValue = bankerRound(value.value, 2);
                }
                changed = true;
            }
        }

        return changed;
    }

    private spreadAdditionalDamages(damages: Array<EffectValueSynergy>, additional: number | MinMax) {
        if (typeof additional === 'number' && additional > 0 || typeof additional !== 'number' && (additional.min > 0 || additional.max > 0)) {
            const averageDamages = damages.map(v => typeof v.synergy === 'number' ? v.synergy : ((v.synergy.min + v.synergy.max) / 2));
            const totalDamages = averageDamages.reduce((t, v) => t + v, 0);
            
            damages.forEach((synergy, index) => {
                const ratio = totalDamages === 0 ? 1 / damages.length : <number>averageDamages[index] / totalDamages;
                const additionalDamages = typeof additional === 'number' ? additional * ratio : { min: additional.min * ratio, max: additional.max * ratio };
                synergy.synergy = add(synergy.synergy, additionalDamages);
            });
        }
    }

    private updateDamage(damage: EffectValueSynergy, genres: Array<SkillGenre>, skillStats: SkillStats, statsResult: SkillStatsBuildResult, element: SkillElement, isSkill: boolean = false, additionalMultipliers: Array<number> = [], addedFlatDamage: number | MinMax = 0, isDirectDamage: boolean = false) {
        const multipliers = this.getValidDamageMultipliers(genres, skillStats, statsResult, damage.stat, isSkill, element, isDirectDamage);

        addedFlatDamage = mult(addedFlatDamage, ...multipliers, ...additionalMultipliers);

        if (typeof addedFlatDamage === 'number') {
            addedFlatDamage = { min: addedFlatDamage, max: addedFlatDamage };
        }

        if (element === SkillElement.Lightning && typeof damage.synergy === 'number') {
            damage.synergy = {
                min: damage.synergy,
                max: damage.synergy
            }
        }

        if (typeof damage.synergy === 'number') {
            for (const multiplier of multipliers) {
                damage.synergy = damage.synergy * (100 + multiplier) / 100;
            }            
            for (const multiplier of additionalMultipliers) {
                damage.synergy = damage.synergy * (100 + multiplier) / 100;
            }
            damage.displaySynergy = bankerRound(damage.synergy, valueOrDefault(damage.precision, 0));
        } else {
            for (const multiplier of multipliers) {
                damage.synergy.min = damage.synergy.min * (100 + multiplier) / 100;
                damage.synergy.max = damage.synergy.max * (100 + multiplier) / 100;
            }         
            for (const multiplier of additionalMultipliers) {
                damage.synergy.min = damage.synergy.min * (100 + multiplier) / 100;
                damage.synergy.max = damage.synergy.max * (100 + multiplier) / 100;
            }
            if (isSkill) {
                for (const maxMultiplier of skillStats.skillIncreasedDamage.values.maxMultiplier) {
                    damage.synergy.max = damage.synergy.max * (100 + maxMultiplier.value) / 100;
                }
            }

            let minimumDamage = 0;

            if (element === SkillElement.Lightning) {
                damage.synergy.min = 1;
                const value = statsResult.stats.find(v => v.stat === 'lightning_upper_damage_range');
                if (value && (value.total as number) > 0) {
                    // Bug max reaper damage ignored for consistency is key
                    const splitReaperToPhysicalAndElement = statsResult.extractedStats['reaper_split_to_physical_and_element'] !== undefined
                    const addReaperToElements = statsResult.extractedStats['reaper_added_to_elements'] !== undefined

                    let reaperDamageRatio = 0;

                    if (splitReaperToPhysicalAndElement) {
                        reaperDamageRatio += 0.5;
                    }
                    if (addReaperToElements) {
                        reaperDamageRatio += 1;
                    }

                    const reaper = statsResult.stats.find(v => v.stat === 'weapon_damage');
                    const reaperMaximumDamage = reaper ? (typeof reaper.total === 'number' ? reaper.total : reaper.total.max) * damage.value / 100 : 0;
                    minimumDamage = ((damage.synergy.max - reaperMaximumDamage * reaperDamageRatio) * (100 - (value.total as number)) / 100) + addedFlatDamage.min;
                }
            }
            damage.displaySynergy = {
                min: bankerRound(Math.max(minimumDamage, damage.synergy.min + addedFlatDamage.min), valueOrDefault(damage.precision, 0)),
                max: bankerRound(damage.synergy.max + addedFlatDamage.max, valueOrDefault(damage.precision, 0)),
            };
        }
    }

    private updateDuration(duration: AbstractEffectValue, genres: Array<SkillGenre>, skillStats: SkillStats) {
        const durationMultipliers = this.getValidDurationMultipliers(genres, skillStats);
        duration.value = duration.baseValue;
        if (duration.stat === 'skill_duration') {
            duration.value = this.slormancerMergedStatUpdaterService.applyMergedStatToValue(duration.value, skillStats.additionalDuration) as number;
        }
        for (const multiplier of durationMultipliers) {
            duration.value = duration.value * (100 + multiplier) / 100;
        }
        duration.value = Math.max(0, duration.value);
        duration.displayValue = round(duration.value, 2);
    }

    private updateSkillCost(skillAndUpgrades: CharacterSkillAndUpgrades, skillStats: SkillStats, statsResult: SkillStatsBuildResult, config: CharacterConfig) {
        const manaCostAdd: Array<EntityValue<number>> = [];
        const lifeCostAdd: Array<EntityValue<number>> = [];
        const entity: Entity = { skill: skillAndUpgrades.skill };
        const convertManaToLifeCost = statsResult.extractedStats['mana_cost_to_life_cost'] && config.has_life_bargain_buff;
        const convertSkillManaToLifeCost = statsResult.extractedStats['skill_mana_cost_to_life_cost'];
        const addManaCostToLifeCost = statsResult.extractedStats['add_life_cost_to_mana_cost'];
        const noLongerCostPersecond = statsResult.extractedStats['no_longer_cost_per_second'] !== undefined;
        let skillHasNoCost = (statsResult.extractedStats['last_cast_tormented_remove_cost'] !== undefined && config.last_cast_tormented)
            || (statsResult.extractedStats['no_cost_if_tormented'] !== undefined && config.serenity <= 0);
        
        this.slormancerSkillService.updateSkillCost(skillAndUpgrades.skill);
        
        if (skillHasNoCost) {
            skillAndUpgrades.skill.hasNoCost = true;
        }

        if (noLongerCostPersecond) {
            if (skillAndUpgrades.skill.manaCostType === SkillCostType.ManaSecond) {
                skillAndUpgrades.skill.manaCostType = SkillCostType.Mana;
            }
            if (skillAndUpgrades.skill.lifeCostType === SkillCostType.LifeSecond) {
                skillAndUpgrades.skill.lifeCostType = SkillCostType.Life;
            }
        }

        if (addManaCostToLifeCost) {
            lifeCostAdd.push({ value: Math.max(0, skillStats.mana.total), source: entity });
            if (skillAndUpgrades.skill.manaCostType === SkillCostType.ManaPercent) {
                skillAndUpgrades.skill.lifeCostType = SkillCostType.LifePercent;
            }
            if (skillAndUpgrades.skill.manaCostType === SkillCostType.Mana) {
                skillAndUpgrades.skill.lifeCostType = SkillCostType.Life;
            }
        }
        
        if (convertManaToLifeCost || convertSkillManaToLifeCost) {
            lifeCostAdd.push({ value: Math.max(0, skillStats.mana.total), source: entity });
            if (skillAndUpgrades.skill.manaCostType === SkillCostType.ManaPercent) {
                skillAndUpgrades.skill.lifeCostType = SkillCostType.LifePercent;
                skillAndUpgrades.skill.manaCostType = SkillCostType.None;
            }
            if (skillAndUpgrades.skill.manaCostType === SkillCostType.Mana) {
                skillAndUpgrades.skill.lifeCostType = SkillCostType.Life;
                skillAndUpgrades.skill.manaCostType = SkillCostType.None;
            }
            if (convertSkillManaToLifeCost && skillAndUpgrades.skill.manaCostType === SkillCostType.ManaSecond) {
                skillAndUpgrades.skill.lifeCostType = SkillCostType.LifeSecond;
                skillAndUpgrades.skill.manaCostType = SkillCostType.None;
            }
        } else {
            manaCostAdd.push({ value: Math.max(0, skillStats.mana.total), source: entity });
        }

        const manaExtraStats: ExtractedStatMap = {
            mana_cost_add: manaCostAdd,
            cost_type: [{ value: ALL_SKILL_COST_TYPES.indexOf(skillAndUpgrades.skill.manaCostType), source: entity }],
        };

        skillAndUpgrades.skill.manaCost = Math.max(0, this.getSpecificStat(statsResult.extractedStats, MANA_COST_MAPPING, config, manaExtraStats));

        lifeCostAdd.push({ value: Math.max(0, skillStats.life.total), source: entity });

        const expectdLifeCostType = skillAndUpgrades.skill.manaCostType === SkillCostType.Mana ? SkillCostType.Life : skillAndUpgrades.skill.lifeCostType;
        const lifeExtraStats: ExtractedStatMap = {
            life_cost_add: lifeCostAdd,
            cost_type: [{ value: ALL_SKILL_COST_TYPES.indexOf(expectdLifeCostType), source: entity }],
        };
        skillAndUpgrades.skill.lifeCost = Math.max(0, this.getSpecificStat(statsResult.extractedStats, LIFE_COST_MAPPING, config, lifeExtraStats));
        
        if (skillAndUpgrades.skill.lifeCost > 0) {
            skillAndUpgrades.skill.hasLifeCost = skillAndUpgrades.skill.lifeCost > 0;
            skillAndUpgrades.skill.lifeCostType = expectdLifeCostType;
        }
        this.slormancerSkillService.updateSkillCostType(skillAndUpgrades.skill);
    }

    private updateSkillValues(skillAndUpgrades: CharacterSkillAndUpgrades, skillStats: SkillStats, statsResult: SkillStatsBuildResult, config: CharacterConfig) {
        const isNonSupportSkill = skillAndUpgrades.skill.specialization === null;

        this.updateSkillCost(skillAndUpgrades, skillStats, statsResult, config);
        skillAndUpgrades.skill.cooldown = this.getSkillCooldown(statsResult, config, skillAndUpgrades.skill, skillStats.cooldownReduction.total);

        const damageValues = skillAndUpgrades.skill.values.filter(isEffectValueSynergy).filter(value => isDamageType(value.stat));


        if (damageValues.length > 0) {
            this.spreadAdditionalDamages(damageValues.filter(damage => damage.stat !== 'bleed_damage'), skillStats.additionalDamages.total);

            if (skillAndUpgrades.skill.heroClass === HeroClass.Warrior && skillAndUpgrades.skill.id === 10) {
                const trainingLanceAdditionalDamage = statsResult.stats.find(mergedStat => mergedStat.stat === 'training_lance_additional_damage');
                const elderLanceAdditionalDamage = statsResult.stats.find(mergedStat => mergedStat.stat === 'elder_lance_additional_damage');

                const trainingLanceDamage = <EffectValueSynergy>skillAndUpgrades.skill.values[0];
                const elderLanceDamage = <EffectValueSynergy>skillAndUpgrades.skill.values[1];


                if (trainingLanceAdditionalDamage && trainingLanceDamage) { // 123
                    // equivalent a simplement changer la base value et upgrade
                    if (statsResult.extractedStats['add_twice_elder_lance_to_training_lance'] !== undefined && elderLanceDamage && skillAndUpgrades.activeUpgrades.includes(123)) {
                        trainingLanceAdditionalDamage.total = add(trainingLanceAdditionalDamage.total, add(elderLanceDamage.synergy, elderLanceDamage.synergy));
                    }

                    this.spreadAdditionalDamages([trainingLanceDamage], trainingLanceAdditionalDamage.total);
                }
                if (elderLanceAdditionalDamage && elderLanceDamage) {
                    this.spreadAdditionalDamages([elderLanceDamage], elderLanceAdditionalDamage.total);
                }
            }

            if (skillAndUpgrades.skill.heroClass === HeroClass.Huntress && skillAndUpgrades.skill.id === 7) {
                const swiftAsTheWind = skillAndUpgrades.upgrades.find(upgrade => upgrade.id === 84);
                if (swiftAsTheWind && skillAndUpgrades.activeUpgrades.includes(swiftAsTheWind.id)) {
                    const latentStormAdditionalDamage = swiftAsTheWind.values
                        .filter(isEffectValueSynergy)
                        .find(value => value.stat === 'latent_storm_additional_damage');
                    if (latentStormAdditionalDamage) {
                        const latentStormDamage = <EffectValueSynergy>skillAndUpgrades.skill.values[1];
                        this.spreadAdditionalDamages([latentStormDamage], latentStormAdditionalDamage.synergy);
                    }
                }
            }

            for (const damageValue of damageValues) {
                const additionamMultipliers: Array<number> = [];
                if (skillAndUpgrades.skill.heroClass == HeroClass.Warrior && skillAndUpgrades.skill.id === 6 && damageValues.indexOf(damageValue) === 0) {
                    const stat = <MergedStat<number>>statsResult.stats.find(mergedStat => mergedStat.stat === 'non_magnified_increased_damage_mult');
                    if (stat) {
                        additionamMultipliers.push(stat.total);
                    }
                }
                if (skillAndUpgrades.skill.heroClass === HeroClass.Warrior && skillAndUpgrades.skill.id === 10) {
                    if (skillAndUpgrades.skill.values.indexOf(damageValue) === 1) {
                        const elderLanceIncreasedDamage = statsResult.stats.find(mergedStat => mergedStat.stat === 'elder_lance_increased_damage');
                        if (elderLanceIncreasedDamage) {
                            additionamMultipliers.push(...elderLanceIncreasedDamage.values.multiplier.map(v => v.value));
                        }
                    }
                }

                if (damageValue.stat === 'elemental_damage') {
                    const elementalMultipliers = statsResult.extractedStats['skill_elemental_damage_mult'];
                    if (elementalMultipliers) {
                        additionamMultipliers.push(...elementalMultipliers.map(v => v.value));
                    }
                    const elementalMultiplierSynergy = statsResult.stats.find(stat => stat.stat === 'skill_elemental_damage_mult');
                    if (elementalMultiplierSynergy) {
                        additionamMultipliers.push(elementalMultiplierSynergy.total as number);
                    }
                }

                if (damageValue.stat === 'wandering_arrow_damage') {
                    additionamMultipliers.push(skillStats.minionIncreasedDamage.total);
                }

                if (damageValue.stat === 'physical_damage') {
                    const physicalMultipliers = statsResult.extractedStats['skill_physical_damage_mult'];
                    if (physicalMultipliers) {
                        additionamMultipliers.push(...physicalMultipliers.map(v => v.value));
                    }
                }

                this.updateDamage(damageValue, skillAndUpgrades.skill.genres, skillStats, statsResult, SkillElement.Neutral, true, additionamMultipliers, 0, isNonSupportSkill);
            }
        }
    
        const durationValues = skillAndUpgrades.skill.values.filter(value => value.valueType === EffectValueValueType.Duration);
        for (const durationValue of durationValues) {
            this.updateDuration(durationValue, skillAndUpgrades.skill.genres, skillStats);
        }

        if (skillAndUpgrades.skill.genres.includes(SkillGenre.AreaOfEffect)) {
            const aoeValues = skillAndUpgrades.skill.values.filter(value => value.valueType === EffectValueValueType.AreaOfEffect);
            if (aoeValues.length > 0) {
                for (const value of aoeValues) {
                    value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;
                    for (const multiplier of skillStats.skillIncreasedAoe.values.multiplier) {
                        value.value = value.value * (100 + multiplier.value) / 100;
                    }
                    value.displayValue = round(value.value, 2);
                }
            }
        }

        const climaxValue = skillAndUpgrades.skill.values.find(value => value.stat === 'climax_increased_damage');
        if (climaxValue) {
            const climaxAdd = valueOrDefault(statsResult.extractedStats['climax_increased_damage_add'], [])
            climaxValue.value = climaxAdd.reduce((t, v) => t + v.value, climaxValue.baseValue);
            climaxValue.displayValue = round(climaxValue.value, 3);
        }
        
        const voidArrowCountValue = skillAndUpgrades.skill.values.find(value => value.stat === 'void_arrow_count_if_fully_charged');
        if (voidArrowCountValue) {
            const voidArrowCountOverride = valueOrDefault(statsResult.extractedStats['void_arrow_count_if_fully_charged_override'], [])[0];
            if (voidArrowCountOverride) {
                voidArrowCountValue.displayValue = voidArrowCountOverride.value;
            } else {
                voidArrowCountValue.displayValue = voidArrowCountValue.value;
            }
        }

        const instructionsValue = skillAndUpgrades.skill.values.find(value => value.stat === 'instructions');
        if (instructionsValue && isEffectValueVariable(instructionsValue)) {
            this.slormancerEffectValueService.updateEffectValue(instructionsValue, skillAndUpgrades.skill.level);
            const instructionsTotal = <number>valueOrDefault(statsResult.stats.find(stat => stat.stat === 'additional_instructions')?.total, 0);
            instructionsValue.value += instructionsTotal;
            instructionsValue.displayValue = round(instructionsValue.value, 3);
        }

        const cadenceCastCount = skillAndUpgrades.skill.values.find(value => value.stat === 'cadence_cast_count');
        if (cadenceCastCount && isEffectValueConstant(cadenceCastCount)) {
            const cadenceCastCountNewvalue = statsResult.extractedStats['cadence_cast_count_new_value'];
            if (cadenceCastCountNewvalue && cadenceCastCountNewvalue[0] !== undefined) {
                cadenceCastCount.value = cadenceCastCountNewvalue[0].value;
            } else {
                cadenceCastCount.value = cadenceCastCount.baseValue;
            }
            cadenceCastCount.displayValue = round(cadenceCastCount.value, 3);
        }

        if (statsResult.extractedStats['pierce_fork_rebound_is_highest']) {
            const forkChance = <MergedStat<number> | undefined>statsResult.stats.find(value => value.stat === 'fork_chance');
            const chanceToRebound = <MergedStat<number> | undefined>statsResult.stats.find(value => value.stat === 'chance_to_rebound');
            const chanceToPierce = <MergedStat<number> | undefined>statsResult.stats.find(value => value.stat === 'chance_to_pierce');
            if (forkChance && chanceToPierce && chanceToRebound) {
                const newTotal = Math.max(forkChance.total, chanceToRebound.total, chanceToPierce.total);
                forkChance.total = newTotal;
                chanceToRebound.total = newTotal;
                chanceToPierce.total = newTotal;
            }
        }
    }

    private updateUpgradeValues(upgrade: SkillUpgrade, skillStats: SkillStats, statsResult: SkillStatsBuildResult) {  
        const damageValues = upgrade.values.filter(isEffectValueSynergy).filter(value => isDamageType(value.stat));
        for (const damageValue of damageValues) {
            this.updateDamage(damageValue, upgrade.genres, skillStats, statsResult, SkillElement.Neutral);
        }
    
        const durationValues = upgrade.values.filter(value => value.valueType === EffectValueValueType.Duration);
        for (const durationValue of durationValues) {
            this.updateDuration(durationValue, upgrade.genres, skillStats);
        }

        if (upgrade.genres.includes(SkillGenre.AreaOfEffect)) {
            const aoeValues = upgrade.values.filter(value => value.valueType === EffectValueValueType.AreaOfEffect);
            for (const value of aoeValues) {
                let base;
                let precision;
                if (isEffectValueVariable(value)) {
                    base = value.upgradedValue;
                    precision = 3;
                } else {
                    base = value.baseValue;
                    precision = 2;
                }
                value.value = base * (100 + skillStats.aoeIncreasedSize.total) / 100;
                value.displayValue = round(value.value, precision);
            }
        }
    }

    private getAmhenostDamageMultiplier(stats: SkillStatsBuildResult, slot: number | null): number[] {
        let multipliers: number[] = [];

        if (slot !== null) {
            const thirdSlotIncreasedDamage = stats.extractedStats['thirst_slot_increased_damage'];
            const nonThirdSlotIncreasedDamage = stats.stats.find(stat => stat.stat === 'non_thirst_slot_increased_damage');
            if (thirdSlotIncreasedDamage && slot === 3) {
                multipliers.push(...thirdSlotIncreasedDamage.map(flat => flat.value));
            } else if (nonThirdSlotIncreasedDamage && slot !== 3) {
                multipliers.push(...nonThirdSlotIncreasedDamage.values.flat.map(flat => <number>flat.value));
            }
        }

        return multipliers;
    }
}