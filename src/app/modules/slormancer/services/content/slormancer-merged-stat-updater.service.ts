import { Injectable } from '@angular/core';

import { MergedStat } from '../../model/content/character-stats';
import { MinMax } from '../../model/minmax';
import { bankerRound, round } from '../../util/math.util';

@Injectable()
export class SlormancerMergedStatUpdaterService {
    
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

    public getTotalFlat(stat: MergedStat): number | MinMax {
        const minMax = stat.values.max.length > 0 || stat.values.maxPercent.length > 0 || stat.values.maxMultiplier.length > 0;
        const flat = this.addValues(stat.values.flat.map(v => v.value), minMax);

        if (minMax) {
            (<MinMax>flat).max += this.addNumberValues(stat.values.max.map(v => v.value));
        }
        
        return flat;
    }

    public getTotalPercent(stat: MergedStat): MinMax | number {
        const minMax = stat.values.max.length > 0 || stat.values.maxPercent.length > 0 || stat.values.maxMultiplier.length > 0;
        const percent = this.addValues(stat.values.percent.map(v => v.value), minMax);
        
        if (minMax) {
            (<MinMax>percent).max += this.addNumberValues(stat.values.maxPercent.map(v => v.value));   
        }

        return percent;
    }

    public getTotalFlatAndPercent(mergedStat: MergedStat): number | MinMax {
        const percent = this.getTotalPercent(mergedStat);
        let total = this.getTotalFlat(mergedStat);

        if (typeof total === 'number') {
            total = total * (100 + <number>percent) / 100;
        } else {            
            if (typeof percent === 'number') {
                total.min = total.min * (100 + percent) / 100;
                total.max = total.max * (100 + percent) / 100;
            } else {
                total.min = total.min * (100 + percent.min) / 100;
                total.max = total.max * (100 + percent.max) / 100;
            }
        }

        return total; 
    }

    public hasDiminishingResult(stat: string): boolean {
        return stat === 'attack_speed' || stat === 'enemy_attack_speed';
    }

    public getTotal(mergedStat: MergedStat): number | MinMax {
        let total = this.getTotalFlatAndPercent(mergedStat);

        if (typeof total === 'number') {    
            if (this.hasDiminishingResult(mergedStat.stat)) {
                total = 100 - mergedStat.values.multiplier.map(mult => Math.max(0, 100 - mult.value) / 100).reduce((total, value) => total * value, 1 - (<number>total / 100)) * 100;
            } else {
                for (const multiplier of mergedStat.values.multiplier) {
                    total = total * (100 + multiplier.value) / 100;
                }
            }
        } else {
            for (const multiplier of mergedStat.values.multiplier) {
                const mult = (100 + multiplier.value);
                total.min = total.min * mult / 100;
                total.max = total.max * mult / 100;
            }

            for (const multiplier of mergedStat.values.maxMultiplier) {
                total.max = total.max * (100 + multiplier.value) / 100;
            }
        }

        return total; 
    }

    public updateStatTotal(stat: MergedStat) {
        stat.total = this.getTotal(stat);

        if (typeof stat.total === 'number') {
            stat.total = bankerRound(stat.total, stat.precision);
        } else {
            stat.total.min = bankerRound(stat.total.min, stat.precision);
            stat.total.max = bankerRound(stat.total.max, stat.precision);
        }
    }

    public setStatTotal(stat: MergedStat) {
        stat.total = this.getTotal(stat);

        if (typeof stat.total === 'number') {
            stat.total = round(stat.total, stat.precision);
        } else {
            stat.total.min = round(stat.total.min, stat.precision);
            stat.total.max = round(stat.total.max, stat.precision);
        }
    }
}