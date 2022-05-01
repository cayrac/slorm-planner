import { Component, Input } from '@angular/core';
import { Character } from '@slormancer/model/character';

@Component({
  selector: 'app-turret-syndrome-calc',
  templateUrl: './turret-syndrome-calc.component.html',
  styleUrls: ['./turret-syndrome-calc.component.scss']
})
export class TurretSyndromeCalcComponent {

    @Input()
    public readonly character: Character | null = null;

    constructor() {
    }
}
