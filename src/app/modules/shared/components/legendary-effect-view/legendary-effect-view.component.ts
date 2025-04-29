import { Component, Input } from '@angular/core';
import { LegendaryEffect } from '@slorm-api';

@Component({
  selector: 'app-legendary-effect-view',
  templateUrl: './legendary-effect-view.component.html',
  styleUrls: ['./legendary-effect-view.component.scss']
})
export class LegendaryEffectViewComponent {

    @Input()
    public readonly legendaryEffect: LegendaryEffect | null = null;

    @Input()
    public readonly reinforcement: number | null = null;

}
