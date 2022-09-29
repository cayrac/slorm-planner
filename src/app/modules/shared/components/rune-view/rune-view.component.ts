import { Component, Input } from '@angular/core';
import { Rune } from '@slormancer/model/content/rune';

@Component({
  selector: 'app-rune-view',
  templateUrl: './rune-view.component.html',
  styleUrls: ['./rune-view.component.scss']
})
export class RuneViewComponent {

    @Input()
    public readonly rune: Rune | null = null;

    constructor() { }
}
