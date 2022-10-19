import { Component, Input } from '@angular/core';
import { CharacterStatDifference, MinMax } from 'slormancer-api';


@Component({
  selector: 'app-compare-view',
  templateUrl: './compare-view.component.html',
  styleUrls: ['./compare-view.component.scss']
})
export class CompareViewComponent {

    @Input()
    public differences: Array<CharacterStatDifference> = [];

    constructor() {}

    public valueToString(value: number | MinMax, noReduction: boolean = false): string {
        let result = '';

        if (typeof value === 'number') {
            if (value > 10000 && !noReduction) {
                result += Math.floor(value / 1000) + 'k';
            } else {
                result += value;
            }
        } else {
            if (value.min > 10000 && value.max > 10000 && !noReduction) {
                result += Math.floor(value.min / 1000) + 'k - ' + Math.floor(value.max / 1000) + 'k';
            } else {
                result += value.min + ' - ' + value.max;
            }
        }

        return result;
    }

    public changeToString(change: number): string {
        let result = '';

        if (Number.isFinite(change)) {
            if (change > 0) {
                result = '+';
            }
            result += change + '%';
        }

        return result;
    }
}
