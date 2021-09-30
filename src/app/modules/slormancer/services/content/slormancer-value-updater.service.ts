import { Injectable } from '@angular/core';

import { CharacterSkillAndUpgrades } from '../../model/character';
import { MergedStat } from '../../model/content/character-stats';
import { EffectValueSynergy } from '../../model/content/effect-value';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { Skill } from '../../model/content/skill';
import { MinMax } from '../../model/minmax';
import { add, round } from '../../util/math.util';
import { isEffectValueSynergy } from '../../util/utils';

interface SkillStats {
    mana: MergedStat<number>;
    attackSpeed: MergedStat<number>;
    increasedDamage: MergedStat<number>;
    totemIncreasedEffect: MergedStat<number>;
    auraIncreasedEffect: MergedStat<number>;
    aoeIncreasedEffect: MergedStat<number>;
    minionIncreasedDamage: MergedStat<number>;
    additionalDamages: MergedStat;
}

@Injectable()
export class SlormancerValueUpdater {

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

    private getValidDamageMultipliers(genres: Array<SkillGenre>, stats: SkillStats): Array<number> {
        const multipliers: Array<number> = [];

        multipliers.push(stats.increasedDamage.values.percent.reduce((t, v) => t + v, 0));
        multipliers.push(...stats.increasedDamage.values.multiplier);
        
        if (genres.includes(SkillGenre.Aoe)) {
            multipliers.push(stats.aoeIncreasedEffect.total);
        }

        if (genres.includes(SkillGenre.Totem)) {
            multipliers.push(stats.totemIncreasedEffect.total);
        }

        if (genres.includes(SkillGenre.Aura)) {
            multipliers.push(stats.auraIncreasedEffect.total);
        }

        if (genres.includes(SkillGenre.Minion)) {
            multipliers.push(stats.minionIncreasedDamage.total);
        }

        return multipliers.filter(v => v !== 0);
    }

    public updateSkillAndUpgradeValues(skillAndUpgrades: CharacterSkillAndUpgrades, stats: Array<MergedStat>) {
        const foundStats: SkillStats = {
            mana: <MergedStat<number>>this.getStatValueOrDefault(stats, 'mana_cost'),
            attackSpeed: <MergedStat<number>>this.getStatValueOrDefault(stats, 'attack_speed'),
            increasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats, 'increased_damages'),
            totemIncreasedEffect: <MergedStat<number>>this.getStatValueOrDefault(stats, 'totem_increased_effect'),
            auraIncreasedEffect: <MergedStat<number>>this.getStatValueOrDefault(stats, 'aura_increased_effect'),
            aoeIncreasedEffect: <MergedStat<number>>this.getStatValueOrDefault(stats, 'aoe_increased_effect'),
            minionIncreasedDamage: <MergedStat<number>>this.getStatValueOrDefault(stats, 'minion_increased_damage'),
            additionalDamages: <MergedStat<number>>this.getStatValueOrDefault(stats, 'additional_damage'),
        }

        console.log('update skill and upgrade values ', skillAndUpgrades, stats);

        this.updateSkillValues(skillAndUpgrades.skill, foundStats);
    }

    private updateDamages(damages: Array<EffectValueSynergy>, additional: number | MinMax, multipliers: Array<number>) {
        console.log('update damages : ', damages, additional, multipliers);

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

    private updateSkillValues(skill: Skill, stats: SkillStats) {
                
        skill.cost = stats.mana.total;

        skill.cooldown = round(skill.baseCooldown * (100 - stats.attackSpeed.total) / 100, 2);

        const damageMultipliers = this.getValidDamageMultipliers(skill.genres, stats);

        this.updateDamages(skill.values.filter(isEffectValueSynergy).filter(value => value.stat === 'damage'), stats.additionalDamages.total, damageMultipliers);
    }
}