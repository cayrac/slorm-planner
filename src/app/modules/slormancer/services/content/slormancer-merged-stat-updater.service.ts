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
        const flat = this.addValues(stat.values.flat.filter(v => !v.extra).map(v => v.value), minMax);

        if (minMax) {
            (<MinMax>flat).max += this.addNumberValues(stat.values.max.filter(v => !v.extra).map(v => v.value));
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

    public getTotalFlatExtra(mergedStat: MergedStat): MinMax | number {
        const minMax = mergedStat.values.max.length > 0 || mergedStat.values.maxPercent.length > 0 || mergedStat.values.maxMultiplier.length > 0;

        let total = this.addValues(mergedStat.values.flat.filter(v => v.extra).map(v => v.value), minMax);
        const max = <number>this.addValues(mergedStat.values.max.filter(v => v.extra).map(v => v.value), false);

        if (typeof total !== 'number') {
            total.max += max;   
        }

        return total;
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

    public getTotalWithoutExtra(mergedStat: MergedStat): number | MinMax {
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

    public getTotal(stat: MergedStat): number | MinMax {
        let total = this.getTotalWithoutExtra(stat);
        let extra = this.getTotalFlatExtra(stat);

        if (typeof total === 'number' && stat.allowMinMax && typeof extra !== 'number') {
            total = { min: total, max: total };
        }

        if (typeof total === 'number') {
            total = bankerRound(total + <number>extra, stat.precision);
        } else {
            total.min = bankerRound(total.min + (typeof extra === 'number' ? extra : extra.min), stat.precision);
            total.max = bankerRound(total.max + (typeof extra === 'number' ? extra : extra.max), stat.precision);
        }

        return total;  
    }

    public updateStatTotal(stat: MergedStat) {
        stat.total = this.getTotal(stat);

        if (typeof stat.total === 'number') {
            stat.total = stat.total;
        } else {
            stat.total.min = stat.total.min;
            stat.total.max = stat.total.max;
        }
    }
}