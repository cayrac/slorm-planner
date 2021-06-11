import { Component } from '@angular/core';

interface MinMax {
  min: number;
  max: number;
}

interface Line {
  level: number;
  data: {
    [key: string]: MinMax;
  }
};

@Component({
  selector: 'app-stat-data',
  templateUrl: './stat-data.component.html',
  styleUrls: ['./stat-data.component.scss']
})
export class StatDataComponent {

    public readonly RAW_BASE = 7;
    public readonly LIFE_BASE = 34;
    public readonly ELEMM_DAMAGE_PERCENT_BASE = 10;
    public readonly GOLDUS_PERCENT_BASE = 15;
    public readonly RETALIATE_PERCENT_BASE = 60;
    public readonly MANA_LEECH_BASE = 5;
    public readonly LIFE_LEECH_BASE = 2;

    public readonly LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    public readonly STAT_DATA: Array<Line> = [
        { level: 1, data: { life: { min: 20, max: 29 }, raw: { min: 4, max: 6 } } },
        { level: 2, data: { life: { min: 24, max: 35 }, raw: { min: 5, max: 7 } } },
        { level: 3, data: { life: { min: 29, max: 42 }, raw: { min: 6, max: 9 } } },
        { level: 4, data: { life: { min: 34, max: 49 }, raw: { min: 7, max: 10 } } },
        { level: 5, data: { life: { min: 38, max: 55 }, raw: { min: 8, max: 11 } } },
        { level: 6, data: { life: { min: 43, max: 62 }, raw: { min: 9, max: 13 } } },
        { level: 7, data: { life: { min: 47, max: 69 }, raw: { min: 10, max: 14 } } },
        { level: 8, data: { life: { min: 52, max: 75 }, raw: { min: 11, max: 15 } } },
        { level: 9, data: { life: { min: 57, max: 82 }, raw: { min: 12, max: 17 } } },
        { level: 10, data: { life: { min: 61, max: 88 }, raw: { min: 13, max: 18 } } }
    ];

    /*public readonly STAT_DATA: Array<Line> = [
        { level: 1, data: { elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 11, data: { elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 12, data: { elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 13, data: { elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 14, data: { elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 16, data: { elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 17, data: { elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 18, data: { elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 19, data: { elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 20, data: { elemp: { min: 3, max: 4 }, gold: { min: 4, max: 6 }, reta: { min: 17, max: 24 } } },
        { level: 29, data: { elemp: { min: 3, max: 4 }, gold: { min: 4, max: 6 }, reta: { min: 17, max: 24 } } },
        { level: 40, data: { elemp: { min: 4, max: 6 }, gold: { min: 6.5, max: 9 }, reta: { min: 25, max: 36 } } }
    ];

    public readonly STAT_DATA: Array<Line> = [
        { level: 1,  data: { manal: { min: 0.5, max: 0.5 }, lifel: { min: 0.18, max: 0.26 }, elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 2,  data: { manal: { min: 0.5, max: 0.5 }, lifel: { min: 0.18, max: 0.26 }, elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 3,  data: { manal: { min: 0.5, max: 0.5 }, lifel: { min: 0.18, max: 0.26 }, elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 4,  data: { manal: { min: 0.5, max: 0.5 }, lifel: { min: 0.18, max: 0.26 }, elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 5,  data: { manal: { min: 0.5, max: 0.5 }, lifel: { min: 0.18, max: 0.26 }, elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 6,  data: { manal: { min: 0.5, max: 0.5 }, lifel: { min: 0.18, max: 0.26 }, elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 7,  data: { manal: { min: 0.5, max: 0.5 }, lifel: { min: 0.18, max: 0.26 }, elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 8,  data: { manal: { min: 0.5, max: 0.5 }, lifel: { min: 0.18, max: 0.26 }, elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 9,  data: { manal: { min: 0.5, max: 0.5 }, lifel: { min: 0.18, max: 0.26 }, elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } },
        { level: 10, data: { manal: { min: 0.5, max: 0.5 }, lifel: { min: 0.18, max: 0.26 }, elemp: { min: 1.5, max: 2 }, gold: { min: 2, max: 3 }, reta: { min: 8.5, max: 12 } } }
    ];*/

    public reinforcment = 0;

    public minFormula = 'base * (1.0 + ((level) * 0.30)) * 0.65';
    public maxFormula = 'base * (1.0 + ((level) * 0.30)) * 0.65';

    public maxPercentFormula = '(1 + Math.floor(level / 20)) * base * 20';

    public maxLowPercentFormula = '(1 + Math.floor(level / 20)) * base * 20';
    
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

    private computePercent(level: number, base: number): MinMax {
        let max;

        if (base <= 5) {
            max = eval(this.maxLowPercentFormula) * ( 1 + 0.15 * this.reinforcment);
        } else {
            max = eval(this.maxPercentFormula) * ( 1 + 0.15 * this.reinforcment);
        }

        return { min: this.roundPercent(0.7 * max, base), max: this.roundPercent(max, base) };
    }

    private getMinMax(level: number, stat: string): MinMax {
         return this.getLine(level).data[stat];
    }

    private getComputedMinMax(level: number, stat: string): MinMax {
         return this.getComputedLine(level).data[stat];
    }

    public hasDiff(level: number) {
        return this.LEVELS.indexOf(level - 1) !== -1;
    }

    public getDiff(level: number, stat: string, v: string): number {
        const now = <number>(<any>this.getMinMax(level, stat))[v];
        const before = <number>(<any>this.getMinMax(level - 1, stat))[v];

        return now - before;
    }

    public getPercentDiff(level: number, stat: string, v: string): number {
        const now = <number>(<any>this.getMinMax(level, stat))[v];
        const before = <number>(<any>this.getMinMax(level - 1, stat))[v];

        return Math.round((now - before) * 100) / 100;
    }

    public getComputedDiff(level: number, stat: string, v: string): number {
        const now = <number>(<any>this.getComputedMinMax(level, stat))[v];
        const before = <number>(<any>this.getComputedMinMax(level - 1, stat))[v];

        return now - before;
    }

    public getPercentComputedDiff(level: number, stat: string, v: string): number {
        const now = <number>(<any>this.getComputedMinMax(level, stat))[v];
        const before = <number>(<any>this.getComputedMinMax(level - 1, stat))[v];

        return Math.round((now - before) * 100) / 100;
    }

    public computeStats() {
        console.log('computing ...');
        try {
            this.COMPUTED_STAT_DATA = this.LEVELS
                .map(level => ({ level, data: {
                    //life: this.compute(level, this.LIFE_BASE),
                    raw: this.compute(level, this.RAW_BASE),
                    // elemp: this.computePercent(level, this.ELEMM_DAMAGE_PERCENT_BASE),
                    // gold: this.computePercent(level, this.GOLDUS_PERCENT_BASE),
                    // reta: this.computePercent(level, this.RETALIATE_PERCENT_BASE),
                    // manal: this.computePercent(level, this.MANA_LEECH_BASE),
                    // lifel: this.computePercent(level, this.LIFE_LEECH_BASE)
                }}));
            console.log('computing OK', this.COMPUTED_STAT_DATA);
        } catch (e) {
            console.error(e);
        }
    }
}
