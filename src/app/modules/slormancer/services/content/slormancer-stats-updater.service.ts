import { Injectable } from '@angular/core';

import { CharacterStat } from '../../model/content/character-stats';
import { MinMax } from '../../model/minmax';
import { round } from '../../util/math.util';

@Injectable()
export class SlormancerStatUpdaterService {
    
    public addValues(values: Array<number | MinMax>, forceMinMax: boolean): number | MinMax {
        let result: number | MinMax = forceMinMax ? { min: 0, max: 0 } : 0;
        let resultIsMinMax = forceMinMax;

        for (const value of values) {
            if (typeof value !== 'number' && !resultIsMinMax) {
                resultIsMinMax = true;
                result = { min: <number>result, max: <number>result };
            }

            if (resultIsMinMax && typeof result) {
                (<MinMax>result).min += typeof value == 'number' ? value : value.min;
                (<MinMax>result).max += typeof value == 'number' ? value : value.max;
            } else {
                (<number>result) += <number>value;
            }
        }

        return result;
    }

    public addNumberValues(values: Array<number | MinMax>): number {
        let result: number = 0;

        for (const value of values) {
            result += typeof value === 'number' ? value : round((value.min + value.max) / 2);
        }

        return result;
    }

    public updateStatTotal(stat: CharacterStat) {
        let total = stat.allowMinMax ? this.addValues(stat.sources.flat, stat.sources.max.length > 0) : this.addNumberValues(stat.sources.flat);

        const percent = (100 + stat.sources.percent.reduce((total, value) => total + value, 0));

        if (typeof total === 'number') {
            total = total * percent / 100;
    
            if (stat.stat === 'attack_speed') {
                total = 100 - stat.sources.multiplier.map(mult => Math.max(0, 100 - mult) / 100).reduce((total, value) => total * value, 1 - (<number>total / 100)) * 100;
            } else {
                for (const multiplier of stat.sources.multiplier) {
                    const mult = (100 + multiplier);
                    total = total * mult / 100;
                }
            }

            total = round(total, stat.precision);
        } else {
            for (const max of stat.sources.max) {
                total.max += max;
            }

            total = { min: total.min * percent / 100, max: total.max * percent / 100 };
    
            for (const multiplier of stat.sources.multiplier) {
                const mult = (100 + multiplier);
                total = { min: total.min * mult / 100, max: total.max * mult / 100 };
            }

            total = { min: round(total.min, stat.precision), max: round(total.max, stat.precision) };
        }

        stat.total = total;
    }
}