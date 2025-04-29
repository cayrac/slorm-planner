import { Component, Input } from '@angular/core';
import { Activable } from '@slorm-api';

@Component({
  selector: 'app-activable-view',
  templateUrl: './activable-view.component.html',
  styleUrls: ['./activable-view.component.scss']
})
export class ActivableViewComponent {

    @Input()
    public readonly activable: Activable | null = null;

    constructor() { }

}
