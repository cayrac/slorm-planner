import { Component } from '@angular/core';

import { GAME_DATA } from '../../../slormancer/constants/game-data';

interface MinMax {
  min: number;
  max: number;
}

interface Line {
  level: number;
  data: { [key: string]: { [key: string]: MinMax }; }
};

@Component({
  selector: 'app-stat-data',
  templateUrl: './stat-data.component.html',
  styleUrls: ['./stat-data.component.scss']
})
export class StatDataComponent {

    public readonly LEVELS = [10, 20, 40];
    public readonly RARITIES = ['M'];
    public readonly STATS = [
        // Normal
        'cooldown_reduction_global_mult',
        'crit_chance_percent',
        'brut_chance_percent',
        'res_phy_percent',
        'res_mag_percent',
        'dodge_percent',
        'brut_damage_percent',
        'crit_damage_percent',
        'aoe_increased_size_percent',
        'retaliate_percent',
        // Magic
    ];
    
    public readonly STAT_DATA: Array<Line> = [
        { level: 10, data: { 
            cooldown_reduction_global_mult: { N: { min: 2, max: 3 },            M: { min: 1.5, max: 2 } },
            crit_chance_percent: { N: { min: 1.5, max: 2 } },
            brut_chance_percent: { N: { min: 1.5, max: 2 } },
            res_phy_percent: { N: { min: 0, max: 0 } },
            res_mag_percent: { N: { min: 0, max: 0 } },
            dodge_percent: { N: { min: 1.5, max: 2 } },
            brut_damage_percent: { N: { min: 0, max: 0 } },
            crit_damage_percent: { N: { min: 4, max: 6 },                       M: { min: 2.5, max: 4 } },
            aoe_increased_size_percent: { N: { min: 0, max: 0 } },
            retaliate_percent: { N: { min: 8.5, max: 12 } },
            increased_proj_speed_percent: {                                     M: { min: 0, max: 0 } },
            increased_damage_on_elite_percent: {                                M: { min: 0, max: 0 } },
            basic_damage_percent: {                                             M: { min: 1, max: 1.5 } },
            mana_leech_percent: {                                               M: { min: 0.5, max: 0.5 } },
        } },
        { level: 20, data: {
            cooldown_reduction_global_mult: { N: { min: 4, max: 6 },            M: { min: 2.5, max: 4 } },
            crit_chance_percent: { N: { min: 3, max: 4 } },
            brut_chance_percent: { N: { min: 3, max: 4 },                       M: { min: 2, max: 2.5 } },
            res_phy_percent: { N: { min: 4, max: 6 } },
            res_mag_percent: { N: { min: 4, max: 6 } },
            dodge_percent: { N: { min: 3, max: 4 } },
            brut_damage_percent: { N: { min: 0, max: 0 } },
            crit_damage_percent: { N: { min: 8.5, max: 12 },                    M: { min: 5.5, max: 8 } },
            aoe_increased_size_percent: { N: { min: 0, max: 0 } },
            retaliate_percent: { N: { min: 17, max: 24 } },
            increased_proj_speed_percent: {                                     M: { min: 0, max: 0 } },
            increased_damage_on_elite_percent: {                                M: { min: 4.5, max: 6.5 } },
            mana_leech_percent: {                                               M: { min: 1, max: 1.5 } },
        } },
        { level: 40, data: {
            cooldown_reduction_global_mult: {   N: { min: 6.5, max: 9 } },
            crit_chance_percent: {              N: { min: 4, max: 6 } },
            brut_chance_percent: {              N: { min: 4, max: 6 },          M: { min: 2.5, max: 4 } },
            res_phy_percent: {                  N: { min: 6.5, max: 9 } },
            res_mag_percent: {                  N: { min: 6.5, max: 9 } },
            dodge_percent: {                    N: { min: 4, max: 6 } },
            brut_damage_percent: {              N: { min: 21, max: 30 },        M: { min: 13.5, max: 19.5 } },
            crit_damage_percent: {              N: { min: 12.5, max: 18 },      M: { min: 8, max: 11.5 } },
            aoe_increased_size_percent: {       N: { min: 8.5, max: 12 } },
            retaliate_percent: {                N: { min: 25, max: 36 } },
            increased_proj_speed_percent: {                                     M: { min: 7, max: 10 } },
            mana_leech_percent: {                                               M: { min: 1.5, max: 2 } },
            basic_damage_percent: {                                             M: { min: 2.5, max: 4 } },
            chance_to_pierce_percent: {                                         M: { min: 5.5, max: 8 } },
            recast_chance_percent: {                                            M: { min: 4, max: 6 } },
            increased_damage_on_elite_percent: {                                M: { min: 0, max: 0 } },
        } },
    ];

    public reinforcment = 0;

    public minFormula = 'base * (1.0 + ((level) * 0.30)) * 0.65';
    public maxFormula = 'base * (1.0 + ((level) * 0.30)) * 0.65';

    public maxPercentFormula = '(1 + Math.floor(level / 10)) * base * 10';

    public maxLowPercentFormula = '(1 + Math.floor(level / 10)) * base * 10';
    
    public COMPUTED_STAT_DATA: Array<Line> = [];

    constructor() { this.computeStats(); }

    public getLine(i: number): Line {
        return <Line>this.STAT_DATA.find(l => l.level === i);
    }

    public getComputedLine(i: number): Line {
        return <Line>this.COMPUTED_STAT_DATA.find(l => l.level === i);
    }

    private compute(level: number, base: number): MinMax {
        const reinforcment = this.reinforcment;
        const min = eval(this.minFormula) * ( 1 + 0.15 * this.reinforcment) ;
        const max = eval(this.maxFormula) * ( 1 + 0.15 * this.reinforcment) ;
        return { min: Math.round(min), max: Math.round(max) };
    }

    private roundPercent(value: number, base: number): number {
        if (base < 5) {
            return Math.round(value ) / 100;
        } else {
            return Math.round(value / 50) / 2;
        }
    }

    public getBaseValue(key: string): number {
        const stat = GAME_DATA.STAT.find(stat => stat.REF === key)
        return stat ? stat.SCORE : 0;
    }

    private computePercent(level: number, base: number): MinMax {
        let max;

        if (base <= 5) {
            max = eval(this.maxLowPercentFormula) * ( 1 + 0.15 * this.reinforcment);
        } else {
            max = eval(this.maxPercentFormula) * ( 1 + 0.15 * this.reinforcment);
        }

        return { min: this.roundPercent(0.45 * max, base), max: this.roundPercent(0.65 * max, base) };
    }

    private getMinMax(level: number, stat: string, rarity: string): MinMax {
         return this.getLine(level).data[stat][rarity];
    }

    private getComputedMinMax(level: number, stat: string, rarity: string): MinMax {
         return this.getComputedLine(level).data[stat][rarity];
    }

    public hasDiff(level: number) {
        return this.LEVELS.indexOf(level - 1) !== -1;
    }

    public getDiff(level: number, stat: string, rarity: string, v: string): number {
        const now = <number>(<any>this.getMinMax(level, stat, rarity))[v];
        const before = <number>(<any>this.getMinMax(level - 1, stat, rarity))[v];

        return now - before;
    }

    public getPercentDiff(level: number, stat: string, rarity: string, v: string): number {
        const now = <number>(<any>this.getMinMax(level, stat, rarity))[v];
        const before = <number>(<any>this.getMinMax(level - 1, stat, rarity))[v];

        return Math.round((now - before) * 100) / 100;
    }

    public getComputedDiff(level: number, stat: string, rarity: string, v: string): number {
        const now = <number>(<any>this.getComputedMinMax(level, stat, rarity))[v];
        const before = <number>(<any>this.getComputedMinMax(level - 1, stat, rarity))[v];

        return now - before;
    }

    public getPercentComputedDiff(level: number, stat: string, rarity: string, v: string): number {
        const now = <number>(<any>this.getComputedMinMax(level, stat, rarity))[v];
        const before = <number>(<any>this.getComputedMinMax(level - 1, stat, rarity))[v];

        return Math.round((now - before) * 100) / 100;
    }

    public computeStats() {
        console.log('computing ...');
        try {
            this.COMPUTED_STAT_DATA = this.LEVELS
                .map(level => ({ 
                        level,
                        data: this.STATS.reduce((data, stat) => {
                            data[stat] = this.RARITIES.reduce((data, rarity) => {
                                data[rarity] = this.computePercent(level, this.getBaseValue(stat));
                                return data;
                            }, <{ [key: string]: MinMax; }>{});
                            return data;
                        }, <{ [key: string]: { [key: string]: MinMax; } }>{})
                    }));
            console.log('computing OK', this.COMPUTED_STAT_DATA);
        } catch (e) {
            console.error(e);
        }
    }

    public hide(level: number, stat: string, rarity: string): boolean {
        const minMax = this.getMinMax(level, stat, rarity);
        return !this.hasData(level, stat, rarity)  || minMax.min === 0 && minMax.max === 0;
    }

    public hasData(level: number, stat: string, rarity: string): boolean {
        let result = false;
        const line = this.STAT_DATA.find(l => l.level === level);

        if (line) {
            const lineStat = line.data[stat];

            if (lineStat) {
                result = lineStat[rarity] !== undefined;
            }
        }

        return result;
    }
}
