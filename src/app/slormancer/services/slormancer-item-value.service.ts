import { Injectable } from '@angular/core';

import { GameRarity } from '../constants/game/game-rarity';
import { GameAffix as GameAffix, GameEquippableItem } from '../model/game/game-item';
import { bankerRound, list } from '../util/math.util';
import { SlormancerGameDataService } from './slormancer-data.service';

interface MinMax {
    min: number;
    max: number;
}

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

    private getLevelPercentScore(level: number): number {
        return Math.max(1, Math.floor((level + 10) / 15));
    }

    private getComputedBaseValue(level: number, score: number, percent: boolean): number {
        return percent
            ? this.getLevelPercentScore(level) * score * 20
            : score * (100 + (level * 30)) / 100;
    }

    private roundValue(value: number, score: number, percent: boolean): number {
        let result = value;

        if (percent) {
            if (score < 5) {
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
        return 100 + (15 * reinforcment);
    }

    private computeAffixValue(level: number, reinforcment: number, score: number, value: number, percent: boolean): number {
        const baseValue = this.getComputedBaseValue(level, score, percent);
        const reinforcmentRatio = this.getReinforcmentratio(reinforcment);
        const valueRatio = this.getValueRatio(level, value, percent);

        return this.roundValue(baseValue * reinforcmentRatio * valueRatio / (100 * 100), score, percent);
    }

    private getAffixMinMax(rarity: GameRarity, percent: string, levelScore: number): MinMax | null {
        let minMax: MinMax | null = null;
        
        const rarityMinmax = this.AFFIX_MIN_MAX[rarity];
        if (rarityMinmax) {
            const percentMinMax = rarityMinmax[percent];
            if (percentMinMax) {
                const levelMinMax = percentMinMax[levelScore];
                minMax = levelMinMax ? levelMinMax : null;
            }
        }

        return minMax;
    }

    public getAffixValues(item: GameEquippableItem, affix: GameAffix): { [ key: number]: number } {
        const stat = this.slormancerGameDataService.getGameStatData(affix);
        let values: { [key: number]: number } = { [affix.value] : 0 };
        const levelScore = this.getLevelPercentScore(item.level);

        if (stat !== null) {
            const range = this.getAffixMinMax(affix.rarity, stat.PERCENT, levelScore);

            if (range !== null) {
                values = {};
                for (let value of list(range.min, range.max)) {
                    values[value] = this.computeAffixValue(item.level, item.reinforcment, stat.SCORE, value, stat.PERCENT === '%');
                }
            }
        }

        return values;
    }
}