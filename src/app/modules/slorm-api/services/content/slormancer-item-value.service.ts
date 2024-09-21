import { Injectable } from '@angular/core';

import { ComputedEffectValue } from '../../model/content/computed-effect-value';
import { EffectValueSynergy, EffectValueVariable } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { Rarity } from '../../model/content/enum/rarity';
import { MinMax } from '../../model/minmax';
import { bankerRound, list, round } from '../../util/math.util';
import { valueOrDefault } from '../../util/utils';

@Injectable()
export class SlormancerItemValueService {

    private readonly DAMAGE_STATS: string[] = [
        'min_basic_damage_add',
        'min_elemental_damage_add',
    ]

    private readonly DEFENSE_STATS: string[] = [
        'res_phy_add',
        'res_mag_add',
        'dodge_add',
    ]

    private readonly REINFORCMENT_CACHE: { [key: number]: number } = {}; 

    private readonly AFFIX_MIN_MAX: { [key: string]: { [key: string]: { [key: number]: MinMax }}} = {
        'normal': {
            '': {
                1: { min: 70, max: 100 },
                2: { min: 70, max: 100 },
                3: { min: 70, max: 100 },
                4: { min: 70, max: 100 },
                5: { min: 70, max: 100 },
            },
            '%': {
                1: { min: 14, max: 20 },
                2: { min: 28, max: 40 },
                3: { min: 42, max: 60 },
                4: { min: 56, max: 80 },
                5: { min: 70, max: 100 },
            }
        },
        'magic': {
            '': {
                1: { min: 45, max: 65 },
                2: { min: 45, max: 65 },
                3: { min: 45, max: 65 },
                4: { min: 45, max: 65 },
                5: { min: 45, max: 65 },
            },
            '%': {
                1: { min: 9,  max: 13 },
                2: { min: 18, max: 26 },
                3: { min: 27, max: 39 },
                4: { min: 36, max: 52 },
                5: { min: 45, max: 65 },
            }
        },
        'rare': {
            '': {
                1: { min: 45, max: 65 },
                2: { min: 45, max: 65 },
                3: { min: 45, max: 65 },
                4: { min: 45, max: 65 },
                5: { min: 45, max: 65 },
            },
            '%': {
                1: { min: 9,  max: 13 },
                2: { min: 18, max: 26 },
                3: { min: 27, max: 39 },
                4: { min: 36, max: 52 },
                5: { min: 45, max: 65 },
            }
        },
        'epic': {
            '': {
                1: { min: 20, max: 40 },
                2: { min: 20, max: 40 },
                3: { min: 20, max: 40 },
                4: { min: 20, max: 40 },
                5: { min: 20, max: 40 },
            },
            '%': {
                1: { min: 4,  max: 8 },
                2: { min: 8,  max: 16 },
                3: { min: 12, max: 24 },
                4: { min: 16, max: 32 },
                5: { min: 20, max: 40 },
            }
        },
        'legendary': {
            '': {
                1: { min: 75, max: 100 },
                2: { min: 75, max: 100 },
                3: { min: 75, max: 100 },
                4: { min: 75, max: 100 },
                5: { min: 75, max: 100 },
            },
            '%': {
                1: { min: 75, max: 100 },
                2: { min: 75, max: 100 },
                3: { min: 75, max: 100 },
                4: { min: 75, max: 100 },
                5: { min: 75, max: 100 },
            }
        }
    }

    constructor() { }

    private getLevelPercentScore(level: number): number {
        let result = 1;

        if (level >= 52) {
            result = 5;
        } else if (level >= 45) {
            result = 4;
        } else if (level >= 35) {
            result = 3;
        } else if (level >= 20) {
            result = 2;
        }
        
        return result;
    }

    private getComputedBaseValue(level: number, stat: string, score: number, percent: boolean): number {
        let damageStatMultiplier = 0;
        if (this.DAMAGE_STATS.includes(stat)) {
            damageStatMultiplier = level * level * 1.2;
        } else if (this.DEFENSE_STATS.includes(stat)) {
            damageStatMultiplier = level * level * 0.9;
        }

        return percent
            ? this.getLevelPercentScore(level) * score * 20
            : score * (100 + (level * 30 + damageStatMultiplier)) / 100;
    }

    private roundValue(value: number, precisionValue: boolean, percent: boolean): number {
        let result = value;

        if (percent) {
            if (precisionValue) {
                result = round(value / 100, 6);
            } else {
                result = bankerRound(value / 50) / 2;
            }
        } else {
            result = Math.max(1, bankerRound(value));
        }

        return result;
    }

    private getValueRatio(level: number, value: number, percent: boolean): number {
        const levelScore = this.getLevelPercentScore(level);
        let ratio = value;

        if (percent) {
            ratio = ratio * 5 / levelScore;
        }

        return ratio;
    }

    private getReinforcmentratio(reinforcment: number): number {
        let ratio = this.REINFORCMENT_CACHE[reinforcment];

        if (ratio === undefined) {
            ratio = 100 + Math.max(reinforcment - 14, 0) + Array.from(new Array(Math.min(14, reinforcment)).keys()).map(i => Math.max(1, 15 - i)).reduce((current, sum) => current + sum, 0);
            this.REINFORCMENT_CACHE[reinforcment] = ratio;
        }

        return ratio;
    }

    private computeAffixValue(level: number, stat: string, reinforcment: number, score: number, value: number, percent: boolean, pure: number | null): number {
        const baseValue = this.getComputedBaseValue(level, stat, score, percent);
        const reinforcmentRatio = this.getReinforcmentratio(reinforcment);
        const valueRatio = this.getValueRatio(level, value, percent);
        const pureRatio = pure === null || pure === 0 ? 100 : pure;

        return this.roundValue(baseValue * reinforcmentRatio * valueRatio * pureRatio / (100 * 100 * 100), score < 2.5, percent);
    }

    private getAffixMinMax(rarity: Rarity, percent: boolean, levelScore: number): MinMax | null {
        let minMax: MinMax | null = null;
        
        const rarityMinmax = this.AFFIX_MIN_MAX[rarity];
        if (rarityMinmax) {
            const percentMinMax = rarityMinmax[percent ? '%' : ''];
            if (percentMinMax) {
                const levelMinMax = percentMinMax[levelScore];
                minMax = levelMinMax ? levelMinMax : null;
            }
        }

        return minMax;
    }

    public getAffixValues(level: number, stat: string, reinforcment: number, score: number, percent: boolean, rarity: Rarity, pure: number | null): Array<{ craft: number, value: number }> {
        let values: Array<{ craft: number, value: number }> = [];
        const levelScore = this.getLevelPercentScore(level);

        const range = this.getAffixMinMax(rarity, percent, levelScore);

        if (range !== null) {
            values = list(range.min, range.max).map(v => ({ craft: v, value: this.computeAffixValue(level, stat, reinforcment, score, v, percent, pure) }));
        }

        return values;
    }

    public getAffixValuesMinMax(level: number, stat: string, reinforcment: number, score: number, percent: boolean, rarity: Rarity, pure: number | null): MinMax {
        let value: MinMax = { min: 0, max: 0 };
        const levelScore = this.getLevelPercentScore(level);
        const range = this.getAffixMinMax(rarity, percent, levelScore);

        if (range !== null) {
            value = {
                min: this.computeAffixValue(level, stat, reinforcment, score, range.min, percent, pure),
                max: this.computeAffixValue(level, stat, reinforcment, score, range.max, percent, pure)
            }
            
        }

        return value;
    }

    public computeEffectRange(value: number, min: number, max: number, upgrade: number): Array<{ craft: number, value: number }> {
        return list(min, max).map(ratio => ({ craft: ratio, value: this.roundValue(value * ratio / 100, false, false) + upgrade }));
    }

    public computeEffectVariableDetails(effect: EffectValueVariable, itemValue: number, reinforcment: number): ComputedEffectValue {


        let upgradeMultiplier = reinforcment;
        if (effect.upgradeType === EffectValueUpgradeType.Every3 || effect.upgradeType === EffectValueUpgradeType.Every3RuneLevel) {
            upgradeMultiplier = Math.floor(upgradeMultiplier / 3);
        } else if (effect.upgradeType === EffectValueUpgradeType.Every5RuneLevel) {
            upgradeMultiplier = Math.floor(upgradeMultiplier / 5);
        }

        const result: ComputedEffectValue = {
            value: 0,
            baseValue: effect.value,
            range: null,
            baseRange: null,
            upgrade: effect.upgrade,
            baseFormulaUpgrade: 0,
            upgradeType: effect.upgradeType,
            percent: effect.percent,
            synergy: null,
        }

        result.value = result.range ? valueOrDefault(result.range[itemValue], 0) : round(effect.value + effect.upgrade * upgradeMultiplier, 2);
        result.baseFormulaUpgrade = result.range ? valueOrDefault(result.range[itemValue], 0) : round(effect.value + effect.upgrade, 2);

        return result;
    }

    public computeEffectSynergyDetails(effect: EffectValueSynergy, itemValue: number, reinforcment: number): ComputedEffectValue {

        const upgradeMultiplier = (effect.upgradeType === EffectValueUpgradeType.Every3 || effect.upgradeType === EffectValueUpgradeType.Every3RuneLevel) ? Math.floor(reinforcment / 3) : reinforcment;

        const result: ComputedEffectValue = {
            value: 0,
            baseValue: effect.value,
            range: null,
            baseRange: null,
            upgrade: effect.upgrade,
            baseFormulaUpgrade: 0,
            upgradeType: effect.upgradeType,
            percent: true,
            synergy: null,
        }

        result.value = result.range ? valueOrDefault(result.range[itemValue], 0) : round(effect.value + effect.upgrade * upgradeMultiplier, 2);
        result.baseFormulaUpgrade = result.range ? valueOrDefault(result.range[itemValue], 0) : round(effect.value + effect.upgrade, 2);

        return result;
    }

    public computeReaperEnchantmentValues(): { [key: number]: number } {
        const values: { [ key: number]: number } = {};

        for (let value of list(1, 5)) {
            values[value] = value;
        }
        
        return values;
    }

    public computeSkillEnchantmentValues(): { [key: number]: number } {
        const values: { [ key: number]: number } = {};

        for (let value of list(1, 2)) {
            values[value] = value;
        }
        
        return values;
    }

    public computeAttributeEnchantmentValues(): { [key: number]: number } {
        const values: { [ key: number]: number } = {};

        for (let value of list(1, 3)) {
            values[value] = value;
        }
        
        return values;
    }
}