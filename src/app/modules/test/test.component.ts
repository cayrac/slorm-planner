import { Component } from '@angular/core';

import { round } from '../slormancer/util/math.util';

interface Data {
    resist: number;
    expected: number;
}

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class TestComponent {

    public readonly DATA: Array<Data> = [
        { resist: 0, expected: 0 },
        { resist: 20, expected: 1.63 },
        { resist: 40, expected: 3.27 },
        { resist: 60, expected: 4.93 },
        { resist: 80, expected: 6.59 },
        { resist: 100, expected: 8.26 },
        { resist: 120, expected: 9.93 },
        { resist: 140, expected: 11.6 },
        { resist: 160, expected: 13.26 },
        { resist: 180, expected: 14.92 },
        { resist: 200, expected: 16.56 },
        { resist: 220, expected: 18.18 },
        { resist: 240, expected: 19.79 },
        { resist: 260, expected: 21.39 },
        { resist: 280, expected: 22.96 },
        { resist: 300, expected: 24.51 },
        { resist: 320, expected: 26.04 },
        { resist: 340, expected: 27.54 },
        { resist: 360, expected: 29.03 },
        { resist: 380, expected: 30.48 },
        { resist: 400, expected: 31.92 },
        { resist: 420, expected: 33.32 },
        { resist: 440, expected: 34.71 },
        { resist: 460, expected: 36.06 },
        { resist: 480, expected: 37.39 },
        { resist: 500, expected: 38.69 },
        { resist: 520, expected: 39.97 },
        { resist: 540, expected: 41.22 },
        { resist: 560, expected: 42.45 },
        { resist: 580, expected: 43.65 },
        { resist: 600, expected: 44.82 },
        { resist: 620, expected: 45.97 },
        { resist: 640, expected: 47.10 },
        { resist: 660, expected: 48.20 },
        { resist: 680, expected: 49.27 },
        { resist: 700, expected: 50.33 },
        { resist: 720, expected: 51.35 },
        { resist: 740, expected: 52.36 },
        { resist: 760, expected: 53.34 },
        { resist: 780, expected: 54.30 },
        { resist: 800, expected: 55.24 },
    ];

    public formula: string = 'resist';

    public base: number = 1210;
    // public ratio: number = 1;

    constructor() {}

    public compute(resist: number): number {
        let result = 0;

        try {
            result = round(100 - (this.base / (this.base + eval(this.formula))) * 100, 2);
        } catch (e) { }

        return result;
    }

    public reverse(line: Data): number {
        let result = 0;

        // X / (X + R) = Y
        // X = Y * (X + R)
        // X = Y*X + Y*R
        // 1*X - Y*X = Y*R
        // X = Y*R / (1 - Y)
        //

        // const X = 1 - line.expected / 100;

        try {
            const Y = 1 - line.expected / 100;
            let resist = line.resist;
            resist;
            const R = eval(this.formula);
            result = round((Y * R) / (1 - Y), 2);
        } catch (e) { }

        return result;
    }

    public getClass(expected: number, computed: number): string {
        let result = 'far';
        const distance = Math.abs(expected - computed);

        console.log('distance : ', distance);

        if (distance === 0) {
            result = 'exact';
        } else if (distance <= 0.01) {
            result = 'almost';
        } else if (distance <= 0.1) {
            result = 'close';
        }

        return result;
    }
}
