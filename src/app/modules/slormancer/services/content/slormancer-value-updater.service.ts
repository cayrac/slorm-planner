import { Injectable } from '@angular/core';

import { COST_MAPPING } from '../../constants/content/data/data-character-stats-mapping';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { Activable } from '../../model/content/activable';
import { AncestralLegacy } from '../../model/content/ancestral-legacy';
import { SkillElement } from '../../model/content/ancestral-legacy-element';
import { MergedStat } from '../../model/content/character-stats';
import { ClassMechanic } from '../../model/content/class-mechanic';
import { AbstractEffectValue, EffectValueSynergy } from '../../model/content/effect-value';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { HeroClass } from '../../model/content/enum/hero-class';
import { ALL_SKILL_COST_TYPES } from '../../model/content/enum/skill-cost-type';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { SkillUpgrade } from '../../model/content/skill-upgrade';
import { Entity } from '../../model/entity';
import { EntityValue } from '../../model/entity-value';
import { MinMax } from '../../model/minmax';
import { add, round } from '../../util/math.util';
import {
    isDamageType,
    isEffectValueConstant,
    isEffectValueSynergy,
    isEffectValueVariable,
    valueOrDefault,
} from '../../util/utils';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerMergedStatUpdaterService } from './slormancer-merged-stat-updater.service';
import { SlormancerStatMappingService } from './slormancer-stat-mapping.service';
import { ExtractedStatMap } from './slormancer-stats-extractor.service';
import { SkillStatsBuildResult } from './slormancer-stats.service';

interface SkillStats {
    mana: MergedStat<number>;
    cooldown: MergedStat<number>;
    attackSpeed: MergedStat<number>;
    increasedDamage: MergedStat<number>;
    skillIncreasedDamage: MergedStat<number>;
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
export class SlormancerValueUpdater {

    constructor(private slormancerEffectValueService: SlormancerEffectValueService,
                private slormancerStatMappingService: SlormancerStatMappingService,
                private slormancerMergedStatUpdaterService: SlormancerMergedStatUpdaterService,
        ) { }

    private getStatValueOrDefault(stats: Array<MergedStat>, stat: string): MergedStat {
        let result: MergedStat | undefined = stats.find(s => s.stat === stat);

        if (result === undefined) {
            result = {
                allowMinMax: false,
                readonly: false,
                suffix: '',
                precision: 0,
                stat,
                total: 0,
                values: { flat: [], maxPercent: [], max: [], multiplier: [], percent: [], maxMultiplier: [] }
            };
        }
        return result
    }

    private getValidDamageMultipliers(genres: Array<SkillGenre>, skillStats: SkillStats, stats: SkillStatsBuildResult, stat: string, isSkill: boolean, element: SkillElement = SkillElement.Neutral): Array<number> {
        const multipliers: Array<number> = [];
        const isDot = stat === 'bleed_damage';

        multipliers.push(skillStats.increasedDamage.values.percent.reduce((t, v) => t + v.value, 0));
        multipliers.push(...skillStats.increasedDamage.values.multiplier.map(v => v.value));

        if (isSkill) {
            multipliers.push(...skillStats.skillIncreasedDamage.values.multiplier.map(v => v.value))
        }
        
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

        if (genres.includes(SkillGenre.Projectile) && !isDot) {
            multipliers.push(-Math.min(skillStats.characterAdditionalProjectiles.total, 9) * 10);
        }

        if (isDot || genres.includes(SkillGenre.DamageOverTime)) {
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
            console.log('Lighning damage multipliers : ', lightning.values.multiplier.map(v => v.value));
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

    private getValidurationMultipliers(genres: Array<SkillGenre>, stats: SkillStats): Array<number> {
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
            mana: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'mana_cost'),
            cooldown: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'cooldown_time'),
            attackSpeed: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'attack_speed'),
            skillIncreasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'skill_increased_damages'),
            dotIncreasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'dot_increased_damage'),
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

    private getActivableCost(stats: ExtractedStatMap, config: CharacterConfig, source: Activable | AncestralLegacy): number {
        const manaCostAdd: Array<EntityValue<number>> = [];
        const entity: Entity = 'level' in source ? { activable: source } : { ancestralLegacy: source }
        
        if (stats['mana_cost_add']) {
            manaCostAdd.push(...stats['mana_cost_add']);
        }
        if (source.baseCost !== null) {
            if ('activable' in entity) {
                manaCostAdd.push({ value: source.baseCost, source: entity });
            } else if (entity.ancestralLegacy.currentRankCost !== null) {
                manaCostAdd.push({ value: entity.ancestralLegacy.currentRankCost, source: entity });
            }
        }

        const skillCostStats = {
            ...stats,
            mana_cost_add: manaCostAdd,
            cost_type: [{ value: ALL_SKILL_COST_TYPES.indexOf(source.costType), source: entity }]
        }

        const mergedStat = <MergedStat<number>>this.slormancerStatMappingService.buildMergedStat(skillCostStats, COST_MAPPING, config);
        this.slormancerMergedStatUpdaterService.updateStatTotal(mergedStat);

        return <number>mergedStat.total;
    }

    public updateActivable(character: Character, activable: Activable, statsResult: SkillStatsBuildResult, config: CharacterConfig) {
        const skillStats = this.getSkillStats(statsResult, character);

        activable.cost = this.getActivableCost(statsResult.extractedStats, config, activable);
        activable.cooldown = Math.max(0, round(activable.baseCooldown * (100 - skillStats.attackSpeed.total) / 100, 2));
        
        for (const value of activable.values) {
            if (isEffectValueSynergy(value)) {
                if (isDamageType(value.stat)) {
                    this.updateDamage(value, activable.genres, skillStats, statsResult, SkillElement.Neutral);
                }
            } else if (value.valueType === EffectValueValueType.AreaOfEffect) {
                value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;
                value.displayValue = round(value.value, 3);
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
    
    public updateAncestralLegacyActivable(character: Character, config: CharacterConfig, ancestralLegacy: AncestralLegacy, statsResult: SkillStatsBuildResult) {
        const skillStats = this.getSkillStats(statsResult, character);

        if (ancestralLegacy.currentRankCost !== null) {
            ancestralLegacy.cost = this.getActivableCost(statsResult.extractedStats, config, ancestralLegacy);
        }
        if (ancestralLegacy.baseCooldown !== null) {
            ancestralLegacy.cooldown = Math.max(0, round(ancestralLegacy.baseCooldown * (100 - skillStats.attackSpeed.total) / 100, 2));
        }

        for (const value of ancestralLegacy.values) {
            if (isEffectValueSynergy(value)) {
                if (isDamageType(value.stat)) {
                    this.updateDamage(value, ancestralLegacy.genres, skillStats, statsResult, ancestralLegacy.element);
                }
            } else if (value.valueType === EffectValueValueType.AreaOfEffect) {
                value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;
                value.displayValue = round(value.value, 3);
            } else if (value.valueType !== EffectValueValueType.Static) {
                const statMultipliers = this.getValidStatMultipliers(ancestralLegacy.genres, skillStats);
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

    public updateSkillAndUpgradeValues(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, stats: SkillStatsBuildResult): Array<SkillUpgrade> {
        const skillStats = this.getSkillStats(stats, character);

        this.updateSkillValues(skillAndUpgrades, skillStats, stats);

        // hack to add multiply and conquer bug
        if (skillAndUpgrades.skill.heroClass === HeroClass.Huntress && skillAndUpgrades.skill.id === 5 && skillAndUpgrades.selectedUpgrades.includes(45) && skillAndUpgrades.selectedUpgrades.includes(52)) {
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

    private updateDamage(damage: EffectValueSynergy, genres: Array<SkillGenre>, skillStats: SkillStats, statsResult: SkillStatsBuildResult, element: SkillElement, isSkill: boolean = false, addntionalMultipliers: Array<number> = []) {
        const multipliers = this.getValidDamageMultipliers(genres, skillStats, statsResult, damage.stat, isSkill, element);
        if (typeof damage.synergy === 'number') {
            for (const multiplier of multipliers) {
                damage.synergy = damage.synergy * (100 + multiplier) / 100;
            }            
            for (const multiplier of addntionalMultipliers) {
                damage.synergy = damage.synergy * (100 + multiplier) / 100;
            }
            damage.displaySynergy = round(damage.synergy, 0);
        } else {
            for (const multiplier of multipliers) {
                damage.synergy.min = damage.synergy.min * (100 + multiplier) / 100;
                damage.synergy.max = damage.synergy.max * (100 + multiplier) / 100;
            }         
            for (const multiplier of addntionalMultipliers) {
                damage.synergy.min = damage.synergy.min * (100 + multiplier) / 100;
                damage.synergy.max = damage.synergy.max * (100 + multiplier) / 100;
            }
            if (isSkill) {
                for (const maxMultiplier of skillStats.skillIncreasedDamage.values.maxMultiplier) {
                    damage.synergy.max = damage.synergy.max * (100 + maxMultiplier.value) / 100;
                }
            }

            if (element === SkillElement.Lightning) {
                damage.synergy.min = 1;
            }
            damage.displaySynergy = {
                min: round(damage.synergy.min, 0),
                max: round(damage.synergy.max, 0),
            };
        }
    }

    private updateDuration(duration: AbstractEffectValue, genres: Array<SkillGenre>, skillStats: SkillStats) {
        const durationMultipliers = this.getValidurationMultipliers(genres, skillStats);
        duration.value = duration.baseValue;
        if (duration.stat === 'skill_duration') {
            duration.value += skillStats.additionalDuration.total;
        }
        for (const multiplier of durationMultipliers) {
            duration.value = duration.value * (100 + multiplier) / 100;
        }
        duration.value = Math.max(0, duration.value);
        duration.displayValue = round(duration.value, 2);
    }

    private updateSkillValues(skillAndUpgrades: CharacterSkillAndUpgrades, skillStats: SkillStats, statsResult: SkillStatsBuildResult) {

        skillAndUpgrades.skill.cost = Math.max(0, skillStats.mana.total);
        skillAndUpgrades.skill.cooldown = Math.max(0, round(skillStats.cooldown.total * (100 - skillStats.attackSpeed.total) / 100, 2));

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
                    if (statsResult.extractedStats['add_twice_elder_lance_to_training_lance'] !== undefined && elderLanceDamage && skillAndUpgrades.selectedUpgrades.includes(123)) {
                        trainingLanceAdditionalDamage.total = add(trainingLanceAdditionalDamage.total, add(elderLanceDamage.synergy, elderLanceDamage.synergy));
                    }

                    this.spreadAdditionalDamages([trainingLanceDamage], trainingLanceAdditionalDamage.total);
                }
                if (elderLanceAdditionalDamage && elderLanceDamage) {
                    this.spreadAdditionalDamages([elderLanceDamage], elderLanceAdditionalDamage.total);
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
                this.updateDamage(damageValue, skillAndUpgrades.skill.genres, skillStats, statsResult, SkillElement.Neutral, true, additionamMultipliers);
            }
        }
    
        const durationValues = skillAndUpgrades.skill.values.filter(value => value.valueType === EffectValueValueType.Duration);
        for (const durationValue of durationValues) {
            this.updateDuration(durationValue, skillAndUpgrades.skill.genres, skillStats);
        }

        if (skillAndUpgrades.skill.genres.includes(SkillGenre.AreaOfEffect)) {
            const aoeValues = skillAndUpgrades.skill.values.filter(value => value.valueType === EffectValueValueType.AreaOfEffect);
            if (aoeValues.length > 0) {
                const aoeMultipliers = valueOrDefault(statsResult.extractedStats['aoe_increased_size_percent_mult'], []);
                for (const value of aoeValues) {
                    value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;
                    value.value  = aoeMultipliers.reduce((t, v) => t * (100 + v.value) / 100, value.value);
                    value.displayValue = round(value.value, 3);
                }
            }
        }

        const maxChargeValue = skillAndUpgrades.skill.values.find(value => value.stat === 'displayed_max_charge');
        if (maxChargeValue) {
            const maxCharge = Math.max(0, ...valueOrDefault(statsResult.extractedStats['max_charge'], []).map(v => v.value));
            maxChargeValue.value = maxCharge;
            maxChargeValue.displayValue = round(maxChargeValue.value, 3);
        }

        const climaxValue = skillAndUpgrades.skill.values.find(value => value.stat === 'climax_increased_damage');
        if (climaxValue) {
            const climaxAdd = valueOrDefault(statsResult.extractedStats['climax_increased_damage_add'], [])
            climaxValue.value = climaxAdd.reduce((t, v) => t + v.value, climaxValue.baseValue);
            climaxValue.displayValue = round(climaxValue.value, 3);
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
                value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;
                value.displayValue = round(value.value, 3);
            }
        }
    }
}