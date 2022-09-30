import { Component, HostListener, Input } from '@angular/core';
import { Rune } from '@slormancer/model/content/rune';
import { RuneType } from '@slormancer/model/content/rune-type';

@Component({
  selector: 'app-rune-slot',
  templateUrl: './rune-slot.component.html',
  styleUrls: ['./rune-slot.component.scss']
})
export class RuneSlotComponent {

    @Input()
    public readonly rune: Rune | null = null;

    @Input()
    public readonly showLevel: boolean = true;

    @Input()
    public readonly selected: boolean = false;

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

    public hasAura(rune: Rune) {
        return rune.type === RuneType.Effect;
    }
    
}
