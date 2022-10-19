import { Component, Input } from '@angular/core';
import { Reaper } from 'slormancer-api';

@Component({
  selector: 'app-reaper-view',
  templateUrl: './reaper-view.component.html',
  styleUrls: ['./reaper-view.component.scss']
})
export class ReaperViewComponent {
    
    @Input()
    public readonly reaper: Reaper | null = null;

    constructor() { }
}
