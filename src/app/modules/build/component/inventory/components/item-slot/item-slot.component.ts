import { Component, HostListener, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
    ItemEditModalComponent,
    ItemEditModalData,
} from '../../../../../shared/components/item-edit-modal/item-edit-modal.component';
import { MAX_ITEM_LEVEL } from '../../../../../slormancer/constants/common';
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

    @Input()
    public readonly maxLevel: number = MAX_ITEM_LEVEL;

    public showOverlay = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }
    
    constructor(private dialog: MatDialog) { }

    public ngOnInit() {
        if (this.base === EquipableItemBase.Amulet) {
            this.edit();
        }
    }
    
    public edit() {
        if (this.item !== null) {
            const data: ItemEditModalData = {
                item: this.item,
                baseLocked: this.base !== null,
                maxLevel: this.maxLevel
            };
            this.dialog.open(ItemEditModalComponent, { data })
            .afterClosed().subscribe(data => {
                console.log(data);
            })
        }
    }
}
