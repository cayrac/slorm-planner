import { Component, HostListener, Input, OnInit } from '@angular/core';

import { EquipableItemBase } from '../../../../../slormancer/model/content/enum/equipable-item-base';
import { EquipableItem } from '../../../../../slormancer/model/content/equipable-item';


@Component({
  selector: 'app-item-slot',
  templateUrl: './item-slot.component.html',
  styleUrls: ['./item-slot.component.scss']
})
export class ItemSlotComponent implements OnInit {

    @Input()
    public readonly item: EquipableItem | null = null;

    @Input()
    public readonly base: EquipableItemBase | null = null;

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
    
}
