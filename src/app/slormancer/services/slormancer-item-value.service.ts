import { Injectable } from '@angular/core';

import { ComputedEffectValue } from '../model/computed-effect-value';
import { EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { GameRarity } from '../model/game/game-rarity';
import { MinMax } from '../model/minmax';
import { bankerRound, list, round } from '../util/math.util';
import { valueOrDefault } from '../util/utils';

@Injectable()
export class SlormancerItemValueService {

    private readonly AFFIX_MIN_MAX: { [key: string]: { [key: string]: { [key: number]: MinMax }}} = {
        'N': {
            '': {
                1: { min: 70, max: 100 },
                2: { min: 70, max: 100 },
                3: { min: 70, max: 100 }
            },
            '%': {
                1: { min: 14, max: 20 },
                2: { min: 28, max: 40 },
                3: { min: 42, max: 60 }
            }
        },
        'M': {
            '': {
                1: { min: 45, max: 65 },
                2: { min: 45, max: 65 },
                3: { min: 45, max: 65 }
            },
            '%': {
                1: { min: 9,  max: 13 },
                2: { min: 18, max: 26 },
                3: { min: 27, max: 39 }
            }
        },
        'R': {
            '': {
                1: { min: 45, max: 65 },
                2: { min: 45, max: 65 },
                3: { min: 45, max: 65 }
            },
            '%': {
                1: { min: 9,  max: 13 },
                2: { min: 18, max: 26 },
                3: { min: 27, max: 39 }
            }
        },
        'E': {
            '': {
                1: { min: 20, max: 40 },
                2: { min: 20, max: 40 },
                3: { min: 20, max: 40 }
            },
            '%': {
                1: { min: 4,  max: 8 },
                2: { min: 8,  max: 16 },
                3: { min: 12, max: 24 }
            }
        },
        'L': {
            '': {
                1: { min: 75, max: 100 },
                2: { min: 75, max: 100 },
                3: { min: 75, max: 100 },
            },
            '%': {
                1: { min: 75, max: 100 },
                2: { min: 75, max: 100 },
                3: { min: 75, max: 100 },
            }
        }
    }

    constructor() { }

    private getLevelPercentScore(level: number): number {
        return Math.max(1, Math.floor((level + 10) / 15));
    }

    private getComputedBaseValue(level: number, score: number, percent: boolean): number {
        return percent
            ? this.getLevelPercentScore(level) * score * 20
            : score * (100 + (level * 30)) / 100;
    }

    private roundValue(value: number, precisionValue: boolean, percent: boolean): number {
        let result = value;

        if (percent) {
            if (precisionValue) {
                result = bankerRound(value * 10) / 1000;
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
        return 100 + Array.from(new Array(reinforcment).keys()).map(i => Math.max(1, 15 - i)).reduce((current, sum) => current + sum, 0);
    }

    private computeAffixValue(level: number, reinforcment: number, score: number, value: number, percent: boolean, pure: number | null): number {
        const baseValue = this.getComputedBaseValue(level, score, percent);
        const reinforcmentRatio = this.getReinforcmentratio(reinforcment);
        const valueRatio = this.getValueRatio(level, value, percent);
        const pureRatio = pure === null || pure === 0 ? 100 : pure;

        return this.roundValue(baseValue * reinforcmentRatio * valueRatio * pureRatio / (100 * 100 * 100), score < 5, percent);
    }

    private getAffixMinMax(rarity: GameRarity, percent: boolean, levelScore: number): MinMax | null {
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

    public getAffixValues(level: number, reinforcment: number, score: number, percent: boolean, rarity: GameRarity, pure: number | null): { [ key: number]: number } {
        let values: { [key: number]: number } = { };
        const levelScore = this.getLevelPercentScore(level);

        const range = this.getAffixMinMax(rarity, percent, levelScore);

        if (range !== null) {
            values = {};
            for (let value of list(range.min, range.max)) {
                values[value] = this.computeAffixValue(level, reinforcment, score, value, percent, pure);
            }
        }

        return values;
    }

    private computeEffectRange(value: number, upgrade: number): { [ key: number]: number } {
        const values: { [ key: number]: number } = {};
        for (let ratio of list(75, 100)) {
            values[ratio] = this.roundValue(value * ratio / 100 + upgrade, false, false);
        }

        return values;
    }

    public computeEffectVariableDetails(effect: EffectValueVariable, itemValue: number, reinforcment: number): ComputedEffectValue {

        const upgradeMultiplier = effect.upgradeType === EffectValueUpgradeType.Every3 ? Math.floor(reinforcment / 3) : reinforcment;

        const result: ComputedEffectValue = {
            value: 0,
            baseValue: effect.value,
            range: effect.range ? this.computeEffectRange(effect.value, effect.upgrade * upgradeMultiplier) : null,
            baseRange: effect.range ? this.computeEffectRange(effect.value, 0) : null,
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

        const upgradeMultiplier = effect.upgradeType === EffectValueUpgradeType.Every3 ? Math.floor(reinforcment / 3) : reinforcment;

        const result: ComputedEffectValue = {
            value: 0,
            baseValue: effect.ratio,
            range: effect.range ? this.computeEffectRange(effect.ratio, effect.upgrade * upgradeMultiplier) : null,
            baseRange: effect.range ? this.computeEffectRange(effect.ratio, 0) : null,
            upgrade: effect.upgrade,
            baseFormulaUpgrade: 0,
            upgradeType: effect.upgradeType,
            percent: true,
            synergy: null,
        }

        result.value = result.range ? valueOrDefault(result.range[itemValue], 0) : round(effect.ratio + effect.upgrade * upgradeMultiplier, 2);
        result.baseFormulaUpgrade = result.range ? valueOrDefault(result.range[itemValue], 0) : round(effect.ratio + effect.upgrade, 2);

        result.synergy = (effect.stat !== 'res_mag_add' && (effect.source === 'physical_damage' || effect.source === 'weapon_damage' || effect.source === 'elemental_damage')) ? {min: 0, max: 0} : 0;

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