import { Injectable } from '@angular/core';

import { MergedStat } from '../../model/content/character-stats';
import { MinMax } from '../../model/minmax';
import { add, bankerRound, round } from '../../util/math.util';

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
        const flat = this.addValues(stat.values.flat.filter(v => v.extra === false && v.synergy === false).map(v => v.value), minMax);

        if (minMax) { // TODO FIX le raw max synergy
            (<MinMax>flat).max += this.addNumberValues(stat.values.max.filter(v => !v.extra && v.synergy === false).map(v => v.value));
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

    public getTotalFlatSynergy(mergedStat: MergedStat): MinMax | number {
        const minMax = mergedStat.values.max.length > 0 || mergedStat.values.maxPercent.length > 0 || mergedStat.values.maxMultiplier.length > 0;
        const totalSynergyFlatValues = mergedStat.values.flat.filter(v => v.synergy === true).map(v => v.value);
        const totalSynergyMaxValues = mergedStat.values.max.filter(v => v.synergy === true).map(v => ({ min: 0, max: v.value }));
        return this.addValues([...totalSynergyFlatValues, ...totalSynergyMaxValues], minMax);
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
        return stat === 'attack_speed' || stat === 'enemy_attack_speed' || stat === 'cooldown_reduction';
    }

    public getTotalWithoutExtraAndSynergy(mergedStat: MergedStat): number | MinMax {
        let total = this.getTotalFlatAndPercent(mergedStat);
        const nonExtraMultiplier = mergedStat.values.multiplier.filter(m => !m.extra);
        const nonExtraMaxMultiplier = mergedStat.values.maxMultiplier.filter(m => !m.extra);
        if (typeof total === 'number') {    
            if (this.hasDiminishingResult(mergedStat.stat)) {
                total = 100 - nonExtraMultiplier.map(mult => Math.max(0, 100 - mult.value) / 100).reduce((total, value) => total * value, 1 - (<number>total / 100)) * 100;
            } else {
                for (const multiplier of nonExtraMultiplier) {
                    total = total * (100 + multiplier.value) / 100;
                }
            }
        } else {
            for (const multiplier of nonExtraMultiplier) {
                const mult = (100 + multiplier.value);
                total.min = total.min * mult / 100;
                total.max = total.max * mult / 100;
            }

            for (const multiplier of nonExtraMaxMultiplier) {
                total.max = total.max * (100 + multiplier.value) / 100;
            }
        }

        return total; 
    }

    public applyExtraToTotal(total: number | MinMax, stat: MergedStat): number | MinMax {
        let extra = this.getTotalFlatExtra(stat);

        if (typeof total === 'number' && stat.allowMinMax && typeof extra !== 'number') {
            total = { min: total, max: total };
        }

        if (typeof total === 'number') {
            total = total + <number>extra;
        } else {
            total.min = total.min + (typeof extra === 'number' ? extra : extra.min);
            total.max = total.max + (typeof extra === 'number' ? extra : extra.max);
        }

        const extraMultiplier = stat.values.multiplier.filter(m => m.extra);
        const extraMaxMultiplier = stat.values.maxMultiplier.filter(m => m.extra);
        if (typeof total === 'number') {    
            if (this.hasDiminishingResult(stat.stat)) {
                total = 100 - extraMultiplier.map(mult => Math.max(0, 100 - mult.value) / 100).reduce((total, value) => total * value, 1 - (<number>total / 100)) * 100;
            } else {
                for (const multiplier of extraMultiplier) {
                    total = total * (100 + multiplier.value) / 100;
                }
            }
        } else {
            for (const multiplier of extraMultiplier) {
                const mult = (100 + multiplier.value);
                total.min = total.min * mult / 100;
                total.max = total.max * mult / 100;
            }

            for (const multiplier of extraMaxMultiplier) {
                total.max = total.max * (100 + multiplier.value) / 100;
            }
        }

        return total;
    }

    public applySynergyToTotal(total: number | MinMax, stat: MergedStat): number | MinMax {
        let synergy = this.getTotalFlatSynergy(stat);
        return add(total, synergy, stat.allowMinMax);
    }

    public getTotal(stat: MergedStat, synergy: boolean): number | MinMax {
        let total = this.getTotalWithoutExtraAndSynergy(stat);
        total = this.applyExtraToTotal(total, stat);

        if (synergy) {
            total = this.applySynergyToTotal(total, stat);
        }

        return bankerRound(total, stat.precision);  
    }

    public updateStatTotal(stat: MergedStat, roundTotal: boolean = true) {
        stat.total = this.getTotal(stat, true);
        stat.totalWithoutSynergy = this.hasSynergy(stat) ? this.getTotal(stat, false) : stat.total;       

        if (typeof stat.maximum === 'number') {
            if (typeof stat.total === 'number') {
                stat.total = Math.min(stat.maximum, stat.total);
            }
            if (typeof stat.totalWithoutSynergy === 'number') {
                stat.totalWithoutSynergy = Math.min(stat.maximum, stat.totalWithoutSynergy);
            }
        }

        stat.totalDisplayed = stat.total;
        if (stat.displayPrecision !== undefined && roundTotal) {
            stat.totalDisplayed = bankerRound(stat.totalDisplayed, stat.displayPrecision);
        }
    }

    public applyMergedStatToValue(value: number | MinMax, stat: MergedStat) {
        const newStat = {
            ...stat,
            values: {
                ...stat.values,
                flat: [
                    ...stat.values.flat,
                    { value, extra: false, source: { synergy: 'custom' }, synergy: false }
                ]
            }
        }

        this.updateStatTotal(newStat, false);

        return newStat.total;
    }

    public hasSynergy(stat: MergedStat): boolean {
        return stat.values.flat.some(value => value.synergy === true);
    }
}