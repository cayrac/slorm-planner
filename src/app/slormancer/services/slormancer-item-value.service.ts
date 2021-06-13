import { Injectable } from '@angular/core';

import { GameAffixe as GameAffix, GameEquippableItem } from '../model/game/game-item';
import { bankerRound, list } from '../util/math.util';
import { SlormancerGameDataService } from './slormancer-game-data.service';

interface MinMax {
    min: number;
    max: number;
}

@Injectable()
export class SlormancerItemValueService {

    private readonly RARITY_RATIO = {
        'N': { min: 70, max: 100 },
        'M': { min: 45, max: 65 },
        'R': { min: 45, max: 65 },
        'E': { min: 20, max: 40 },
        'L': { min: 100, max: 100 }
    }

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
                1: { min: 70, max: 100 },
                2: { min: 70, max: 100 },
                3: { min: 70, max: 100 }
            },
            '%': {
                1: { min: 70, max: 100 },
                2: { min: 28, max: 40 },
                3: { min: 42, max: 60 }
            }
        }
    }

    constructor(private slormancerGameDataService : SlormancerGameDataService) { }

    private getLevelPercentScore(item: GameEquippableItem): number {
        return Math.max(1, Math.floor((item.level + 10) / 15));
    }

    private getComputedBaseValue(item: GameEquippableItem, affix: GameAffix): number {
        const stat = this.slormancerGameDataService.getGameDataStat(affix);
        let result = stat.SCORE;

        if (stat.PERCENT === '%') {
            result = this.getLevelPercentScore(item) * stat.SCORE * 20;
        } else if (stat.PERCENT === '') {
            result = stat.SCORE * (100 + (item.level * 30)) / 100;
        }

        return result;
    }

    private roundValue(value: number, affix: GameAffix): number {
        const stat = this.slormancerGameDataService.getGameDataStat(affix);
        let result = value;

        if (stat.PERCENT === '%') {
            if (stat.SCORE < 5) {
                result = bankerRound(value * 10) / 1000;
            } else {
                result = bankerRound(value / 50) / 2;
            }
        } else if (stat.PERCENT === '') {
            result = Math.max(1, bankerRound(value));
        }

        return result;
    }

    private getRarityRatio(affix: GameAffix): MinMax {     
        return this.RARITY_RATIO[affix.rarity];
    }

    private getValueRatio(item: GameEquippableItem, affix: GameAffix): number {
        const stat = this.slormancerGameDataService.getGameDataStat(affix);
        const levelScore = this.getLevelPercentScore(item);
        let ratio = affix.value;

        if (stat.PERCENT === '%') {
            ratio = ratio * 5 / levelScore;
        }

        return ratio;
    }

    private computeAffixValueRange(item: GameEquippableItem, affix: GameAffix): MinMax {
        const value = this.getComputedBaseValue(item, affix);
        const ratio = this.getRarityRatio(affix);
        const reinforcment = 100 + (15 * item.reinforcment);

        return {
            min: this.roundValue(value * reinforcment * ratio.min / (100 * 100), affix),
            max: this.roundValue(value * reinforcment * ratio.max / (100 * 100), affix)
        };
    }

    private computeAffixValue(item: GameEquippableItem, affix: GameAffix): number {
        const value = this.getComputedBaseValue(item, affix);
        const reinforcment = 100 + (15 * item.reinforcment);
        const ratio = this.getValueRatio(item, affix);

        return this.roundValue(value * reinforcment * ratio / (100 * 100), affix);
    }

    public getAffixValues(item: GameEquippableItem, affix: GameAffix): { [ key: number]: number } {
        const stat = this.slormancerGameDataService.getGameDataStat(affix);
        let values: { [key: number]: number } = {};
        const minMax = this.computeAffixValueRange(item, affix);
        const levelScore = this.getLevelPercentScore(item);

        for (let i = 1 ; i <= 100 ; i++) {
            const tmpAffixe = { ...affix, value: i };
            const tmpValue = this.computeAffixValue(item, tmpAffixe);

            if (tmpValue >= minMax.min && tmpValue <= minMax.max) {
                values[i] = tmpValue;
            }
        }
        const keys = Object.keys(values).map(k => parseInt(k));
        const minValues = keys.filter(k => values[k] === values[keys[0]]);
        const maxValues = keys.filter(k => values[k] === values[keys[keys.length - 1]]);

        const range = this.AFFIX_MIN_MAX[affix.rarity][stat.PERCENT][levelScore];

        if (minValues.indexOf(range.min) === -1 || maxValues.indexOf(range.max) === -1) {
            console.error('Invalid range values for ', affix.rarity, '-', stat.PERCENT, '-', levelScore, ' : ', range.min, ' - ', range.max);
            console.log('Possible min-max : ', minValues.join(','), ' - ', maxValues.join(','));
            console.log('Computed values : ', values);
        } else {
            values = {};
            for (let value of list(range.min, range.max)) {
                const tmpAffixe = { ...affix, value };
                values[value] = this.computeAffixValue(item, tmpAffixe);
            }
        }

        return values;
    }
}