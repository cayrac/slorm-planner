import { Component, Input } from '@angular/core';
import { Activable } from 'slormancer-api';

@Component({
  selector: 'app-activable-view',
  templateUrl: './activable-view.component.html',
  styleUrls: ['./activable-view.component.scss']
})
export class ActivableViewComponent {

    @Input()
    public readonly activable: Activable | null = null;

    @Input()
    public readonly reinforcment: number = 0;

    constructor() { }

}
