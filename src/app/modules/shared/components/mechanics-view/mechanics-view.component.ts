import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Buff, ClassMechanic, Mechanic } from '@slorm-api';
import { ViewData, ViewModalComponent } from '../view-modal/view-modalcomponent';

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

    constructor(private dialog: MatDialog) { }

    public showOverlay(trigger: CdkOverlayOrigin, mechanic: Mechanic | ClassMechanic | Buff) {
        this.overlayMechanic = mechanic;
        this.overlayTrigger = trigger;
    }

    public hideOverlay() {
        this.overlayTrigger = null;
        this.overlayMechanic = null;
    }
                
    public showModalTooltip(event: MouseEvent, mechanic: Mechanic) {
        let skip = false;

        if (event.ctrlKey) {
            skip = true;
            event.stopPropagation();
            event.stopImmediatePropagation();
            const data: ViewData = { entity: { mechanic } };
            this.dialog.open(ViewModalComponent, { data });
        }

        return skip;
    }
}
