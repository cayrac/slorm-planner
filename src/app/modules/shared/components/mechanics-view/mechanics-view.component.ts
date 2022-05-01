import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, Input } from '@angular/core';
import { Buff } from '@slormancer/model/content/buff';
import { ClassMechanic } from '@slormancer/model/content/class-mechanic';
import { Mechanic } from '@slormancer/model/content/mechanic';

@Component({
  selector: 'app-mechanics-view',
  templateUrl: './mechanics-view.component.html',
  styleUrls: ['./mechanics-view.component.scss']
})
export class MechanicsViewComponent {

    @Input()
    public readonly classMechanics: Array<ClassMechanic> = [];

    @Input()
    public readonly mechanics: Array<Mechanic> = [];

    @Input()
    public readonly buffs: Array<Buff> = [];

    public overlayTrigger: CdkOverlayOrigin | null = null;

    public overlayMechanic: Mechanic | ClassMechanic | Buff | null = null;

    constructor() { }

    public showOverlay(trigger: CdkOverlayOrigin, mechanic: Mechanic | ClassMechanic | Buff) {
        this.overlayMechanic = mechanic;
        this.overlayTrigger = trigger;
    }

    public hideOverlay() {
        this.overlayTrigger = null;
        this.overlayMechanic = null;
    }
}
