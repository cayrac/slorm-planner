import { Injectable } from '@angular/core';

import { CharacterSkillAndUpgrades } from '../../model/character';
import { Activable } from '../../model/content/activable';
import { AncestralLegacy } from '../../model/content/ancestral-legacy';
import { MergedStat } from '../../model/content/character-stats';
import { EffectValueSynergy } from '../../model/content/effect-value';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { HeroClass } from '../../model/content/enum/hero-class';
import { SkillCostType } from '../../model/content/enum/skill-cost-type';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { Skill } from '../../model/content/skill';
import { SkillUpgrade } from '../../model/content/skill-upgrade';
import { MinMax } from '../../model/minmax';
import { add, round } from '../../util/math.util';
import { isDamageType, isEffectValueSynergy, isEffectValueVariable, valueOrDefault } from '../../util/utils';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SkillStatsBuildResult } from './slormancer-stats.service';

interface SkillStats {
    mana: MergedStat<number>;
    cooldown: MergedStat<number>;
    attackSpeed: MergedStat<number>;
    increasedDamage: MergedStat<number>;
    totemIncreasedEffect: MergedStat<number>;
    auraIncreasedEffect: MergedStat<number>;
    aoeIncreasedEffect: MergedStat<number>;
    aoeIncreasedSize: MergedStat<number>;
    minionIncreasedDamage: MergedStat<number>;
    additionalDamages: MergedStat;
    additionalDuration: MergedStat<number>;
    additionalProjectiles: MergedStat<number>;
}

@Injectable()
export class SlormancerValueUpdater {

    constructor(
        private slormancerEffectValueService: SlormancerEffectValueService
        ) { }

    private getStatValueOrDefault(stats: Array<MergedStat>, stat: string): MergedStat {
        let result = stats.find(s => s.stat === stat);

        if (result === undefined) {
            result = {
                allowMinMax: false,
                precision: 0,
                stat,
                total: 0,
                values: { flat: [], maxPercent: [], max: [], multiplier: [], percent: [] }
            };
        }
        return result
    }

    private getValidDamageMultipliers(genres: Array<SkillGenre>, skillStats: SkillStats, stats: SkillStatsBuildResult): Array<number> {
        const multipliers: Array<number> = [];

        multipliers.push(skillStats.increasedDamage.values.percent.reduce((t, v) => t + v, 0));
        multipliers.push(...skillStats.increasedDamage.values.multiplier);
        
        if (genres.includes(SkillGenre.Aoe)) {
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

        if (genres.includes(SkillGenre.Projectile)) {
            multipliers.push(-Math.min(skillStats.additionalProjectiles.total, 9) * 10);
        }

        if (stats.extractedStats['increased_damage_mult_per_potential_projectile'] !== undefined) {
            const increasedDamage = <number>stats.extractedStats['increased_damage_mult_per_potential_projectile'][0];
            const projectilesMultiplier = Math.floor(skillStats.additionalProjectiles.total);
            multipliers.push(increasedDamage * projectilesMultiplier);
        }

        return multipliers.filter(v => v !== 0);
    }

    private getValidStatMultipliers(genres: Array<SkillGenre>, skillStats: SkillStats, stats: SkillStatsBuildResult): Array<number> {
        const multipliers: Array<number> = [];
        
        if (genres.includes(SkillGenre.Aoe)) {
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

        return multipliers.filter(v => v !== 0);
    }

    private getSkillStats(stats: SkillStatsBuildResult): SkillStats {
        return {
            mana: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'mana_cost'),
            cooldown: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'cooldown_time'),
            attackSpeed: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'attack_speed'),
            increasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'increased_damages'),
            totemIncreasedEffect: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'totem_increased_effect'),
            auraIncreasedEffect: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'aura_increased_effect'),
            aoeIncreasedEffect: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'aoe_increased_effect'),
            aoeIncreasedSize: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'aoe_increased_size'),
            minionIncreasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'minion_increased_damage'),
            additionalDamages: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'additional_damage'),
            additionalDuration: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'skill_additional_duration'),
            additionalProjectiles: <MergedStat<number>>this.getStatValueOrDefault(stats.stats, 'additional_projectile'),
        }
    }

    public updateActivable(activable: Activable, statsResult: SkillStatsBuildResult) {
        const skillStats = this.getSkillStats(statsResult);

        activable.cost = skillStats.mana.values.multiplier.reduce((t, v) => t * (100 + v) / 100 , activable.baseCost);
        activable.cooldown = round(activable.baseCooldown * (100 - skillStats.attackSpeed.total) / 100, 2);
        
        for (const value of activable.values) {
            if (isEffectValueSynergy(value)) {
                if (isDamageType(value.stat)) {
                    const damageMultipliers = this.getValidDamageMultipliers(activable.genres, skillStats, statsResult);
                    this.updateDamages([value], 0, damageMultipliers);
                }
            } else if (value.valueType === EffectValueValueType.AreaOfEffect) {
                value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;
                value.displayValue = round(value.value, 2);
            } else if (value.valueType !== EffectValueValueType.Static)  {
                const statMultipliers = this.getValidStatMultipliers(activable.genres, skillStats, statsResult);
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

    public updateAncestralLegacyActivable(ancestralLegacy: AncestralLegacy, statsResult: SkillStatsBuildResult) {
        const skillStats = this.getSkillStats(statsResult);

        if (ancestralLegacy.currentRankCost !== null && ancestralLegacy.hasManaCost && ancestralLegacy.costType !== SkillCostType.ManaLock) {
            ancestralLegacy.cost = skillStats.mana.values.multiplier.reduce((t, v) => t * (100 + v) / 100 , ancestralLegacy.currentRankCost);
        }
        if (ancestralLegacy.baseCooldown !== null) {
            ancestralLegacy.cooldown = round(ancestralLegacy.baseCooldown * (100 - skillStats.attackSpeed.total) / 100, 2);
        }
        
        for (const value of ancestralLegacy.values) {
            if (isEffectValueSynergy(value)) {
                if (isDamageType(value.stat)) {
                    const damageMultipliers = this.getValidDamageMultipliers(ancestralLegacy.genres, skillStats, statsResult);
                    this.updateDamages([value], 0, damageMultipliers);
                }
            } else if (value.valueType === EffectValueValueType.AreaOfEffect) {
                value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;
                value.displayValue = round(value.value, 2);
            } else if (value.valueType !== EffectValueValueType.Static) {
                const statMultipliers = this.getValidStatMultipliers(ancestralLegacy.genres, skillStats, statsResult);
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

    public updateSkillAndUpgradeValues(skillAndUpgrades: CharacterSkillAndUpgrades, stats: SkillStatsBuildResult): Array<SkillUpgrade> {
        const skillStats = this.getSkillStats(stats);

        this.updateSkillValues(skillAndUpgrades.skill, skillStats, stats);

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

    private updateDamages(damages: Array<EffectValueSynergy>, additional: number | MinMax, multipliers: Array<number>) {
        if (typeof additional === 'number' && additional > 0 || typeof additional !== 'number' && (additional.min > 0 || additional.max > 0)) {
            const averageDamages = damages.map(v => typeof v.synergy === 'number' ? v.synergy : ((v.synergy.min + v.synergy.max) / 2));
            const totalDamages = averageDamages.reduce((t, v) => t + v, 0);
            
            damages.forEach((synergy, index) => {
                const ratio = <number>averageDamages[index] / totalDamages;
                const additionalDamages = typeof additional === 'number' ? additional * ratio : { min: additional.min * ratio, max: additional.max * ratio };
                synergy.synergy = add(synergy.synergy, additionalDamages);
            });
        }

        if (multipliers.length > 0) {
            for (const damage of damages) {
                if (typeof damage.synergy === 'number') {
                    for (const multiplier of multipliers) {
                        damage.synergy = damage.synergy * (100 + multiplier) / 100;
                    }
                } else {
                    for (const multiplier of multipliers) {
                        damage.synergy.min = damage.synergy.min * (100 + multiplier) / 100;
                        damage.synergy.max = damage.synergy.max * (100 + multiplier) / 100;
                    }
                }
            }
        }

        for (const damage of damages) {
            if (typeof damage.synergy === 'number') {
                damage.displaySynergy = round(damage.synergy, 0);
            } else {
                damage.displaySynergy = {
                    min: round(damage.synergy.min, 0),
                    max: round(damage.synergy.max, 0),
                };
            }
        }
    }

    private updateSkillValues(skill: Skill, skillStats: SkillStats, statsResult: SkillStatsBuildResult) {
                
        skill.cost = skillStats.mana.total;
        skill.cooldown = round(skillStats.cooldown.total * (100 - skillStats.attackSpeed.total) / 100, 2);

        const damageValues = skill.values.filter(isEffectValueSynergy).filter(value => isDamageType(value.stat));
        if (damageValues.length > 0) {
            const damageMultipliers = this.getValidDamageMultipliers(skill.genres, skillStats, statsResult);
            this.updateDamages(damageValues, skillStats.additionalDamages.total, damageMultipliers);
        }
    
        const durationValues = skill.values.filter(value => value.valueType === EffectValueValueType.Duration);
        if (durationValues.length > 0) {
            const durationMultipliers = this.getValidurationMultipliers(skill.genres, skillStats);
            for (const value of durationValues) {
                value.value = value.baseValue;
                if (value.stat === 'skill_duration') {
                    value.value += skillStats.additionalDuration.total;
                }
                for (const multiplier of durationMultipliers) {
                    value.value = value.value * (100 + multiplier) / 100;
                }
                value.value = Math.max(0, value.value);
                value.displayValue = round(value.value, 2);
            }
        }

        if (skill.genres.includes(SkillGenre.Aoe)) {
            const aoeValues = skill.values.filter(value => value.valueType === EffectValueValueType.AreaOfEffect);
            if (aoeValues.length > 0) {
                const aoeMultipliers = valueOrDefault(statsResult.extractedStats['aoe_increased_size_percent_mult'], []);
                for (const value of aoeValues) {
                    value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;
                    value.value  = aoeMultipliers.reduce((t, v) => t * (100 + v) / 100, value.value);
                    value.displayValue = round(value.value, 2);
                }
            }
        }

        const maxChargeValue = skill.values.find(value => value.stat === 'displayed_max_charge');
        if (maxChargeValue) {
            const maxCharge = Math.max(0, ...valueOrDefault(statsResult.extractedStats['max_charge'], []));
            maxChargeValue.value = maxCharge;
            maxChargeValue.displayValue = round(maxChargeValue.value, 2);
        }

        const climaxValue = skill.values.find(value => value.stat === 'climax_increased_damage');
        if (climaxValue) {
            const climaxAdd = valueOrDefault(statsResult.extractedStats['climax_increased_damage_add'], [])
            climaxValue.value = climaxAdd.reduce((t, v) => t + v, climaxValue.baseValue);
            climaxValue.displayValue = round(climaxValue.value, 2);
        }

        const instructionsValue = skill.values.find(value => value.stat === 'instructions');
        if (instructionsValue && isEffectValueVariable(instructionsValue)) {
            this.slormancerEffectValueService.updateEffectValue(instructionsValue, skill.level);
            const instructionsTotal = <number>valueOrDefault(statsResult.stats.find(stat => stat.stat === 'additional_instructions')?.total, 0);
            instructionsValue.value += instructionsTotal;
            instructionsValue.displayValue = round(instructionsValue.value, 2);
        }
    }

    private updateUpgradeValues(upgrade: SkillUpgrade, skillStats: SkillStats, stats: SkillStatsBuildResult) {  
        const damageValues = upgrade.values.filter(isEffectValueSynergy).filter(value => isDamageType(value.stat));
        if (damageValues.length > 0) {
            const damageMultipliers = this.getValidDamageMultipliers(upgrade.genres, skillStats, stats);
            this.updateDamages(damageValues, 0, damageMultipliers);
        }

        if (upgrade.genres.includes(SkillGenre.Aoe)) {
            const aoeValues = upgrade.values.filter(value => value.valueType === EffectValueValueType.AreaOfEffect);
            for (const value of aoeValues) {
                value.value = value.baseValue * (100 + skillStats.aoeIncreasedSize.total) / 100;
                value.displayValue = round(value.value, 2);
            }
        }
    }
}