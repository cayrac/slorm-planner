import { Component, Input } from '@angular/core';

import { Character } from '../../../../../slormancer/model/character';

@Component({
  selector: 'app-defense-calc',
  templateUrl: './defense-calc.component.html',
  styleUrls: ['./defense-calc.component.scss']
})
export class DefenseCalcComponent {

    @Input()
    public readonly character: Character | null = null;

    constructor() {
    }
}
