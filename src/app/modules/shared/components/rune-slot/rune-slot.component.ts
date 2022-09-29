import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Rune } from '@slormancer/model/content/rune';

@Component({
  selector: 'app-rune-slot',
  templateUrl: './rune-slot.component.html',
  styleUrls: ['./rune-slot.component.scss']
})
export class RuneSlotComponent implements OnInit {

    @Input()
    public readonly rune: Rune | null = null;

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
