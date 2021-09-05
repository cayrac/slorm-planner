import { Component, HostListener, Input, OnInit } from '@angular/core';

import { Activable } from '../../../../../slormancer/model/content/activable';
import { AncestralLegacy } from '../../../../../slormancer/model/content/ancestral-legacy';


@Component({
  selector: 'app-activable-slot',
  templateUrl: './activable-slot.component.html',
  styleUrls: ['./activable-slot.component.scss']
})
export class ActivableSlotComponent implements OnInit {

    @Input()
    public readonly activable: Activable | AncestralLegacy | null = null;

    public showOverlay = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }
    
    constructor() { }

    public ngOnInit() { }

    public isAncestralLegacy(activable: Activable | AncestralLegacy): activable is AncestralLegacy {
        return (<AncestralLegacy>activable).element !== undefined;
    } 

    public isActivable(activable: Activable | AncestralLegacy): activable is Activable {
        return (<AncestralLegacy>activable).element === undefined;
    }
    
}
