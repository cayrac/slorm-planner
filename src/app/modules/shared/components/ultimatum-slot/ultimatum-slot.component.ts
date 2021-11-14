import { Component, HostListener, Input } from '@angular/core';

import { Ultimatum } from '../../../slormancer/model/content/ultimatum';

@Component({
  selector: 'app-ultimatum-slot',
  templateUrl: './ultimatum-slot.component.html',
  styleUrls: ['./ultimatum-slot.component.scss']
})
export class UltimatumSlotComponent {

    @Input()
    public readonly ultimatum: Ultimatum | null = null;

    @Input()
    public readonly overlay: boolean = true;

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
}
