import { Component, Input } from '@angular/core';
import { Trait } from '@slormancer/model/content/trait';

@Component({
  selector: 'app-trait-view',
  templateUrl: './trait-view.component.html',
  styleUrls: ['./trait-view.component.scss']
})
export class TraitViewComponent {

    @Input()
    public readonly trait: Trait | null = null;

    constructor() { }
}
