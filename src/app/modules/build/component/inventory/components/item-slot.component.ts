import { Component, HostListener, Input, OnInit } from '@angular/core';

import { EquipableItemBase } from '../../../../slormancer/model/content/enum/equipable-item-base';
import { EquipableItem } from '../../../../slormancer/model/content/equipable-item';

@Component({
  selector: 'app-item-slot',
  templateUrl: './item-slot.component.html',
  styleUrls: ['./item-slot.component.scss']
})
export class ItemSlotComponent implements OnInit {

    @Input()
    public readonly item: EquipableItem | null = null;

    @Input()
    public readonly background: EquipableItemBase | null = null;

    public showTooltip = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showTooltip = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showTooltip = false;
    }
    
    constructor() {} // TODO positionner overlay à droite

    public ngOnInit() { }
    
}
