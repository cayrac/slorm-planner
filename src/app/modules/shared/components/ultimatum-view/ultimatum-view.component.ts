import { Component, Input } from '@angular/core';
import { Ultimatum } from '@slorm-api';

@Component({
  selector: 'app-ultimatum-view',
  templateUrl: './ultimatum-view.component.html',
  styleUrls: ['./ultimatum-view.component.scss']
})
export class UltimatumViewComponent {

    @Input()
    public readonly ultimatum: Ultimatum | null = null;

    constructor() { }
}
