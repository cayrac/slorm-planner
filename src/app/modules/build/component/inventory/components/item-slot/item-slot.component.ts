import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import {
    ItemBaseChoiceModalComponent,
} from '../../../../../shared/components/item-base-choice-modal/item-base-choice-modal.component';
import {
    ItemEditModalComponent,
    ItemEditModalData,
} from '../../../../../shared/components/item-edit-modal/item-edit-modal.component';
import { MAX_ITEM_LEVEL } from '../../../../../slormancer/constants/common';
import { EquipableItemBase } from '../../../../../slormancer/model/content/enum/equipable-item-base';
import { HeroClass } from '../../../../../slormancer/model/content/enum/hero-class';
import { EquipableItem } from '../../../../../slormancer/model/content/equipable-item';
import { SlormancerItemService } from '../../../../../slormancer/services/content/slormancer-item.service';
import { ItemDragService } from '../../services/item-drag.service';


@Component({
  selector: 'app-item-slot',
  templateUrl: './item-slot.component.html',
  styleUrls: ['./item-slot.component.scss']
})
export class ItemSlotComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public readonly item: EquipableItem | null = null;

    @Input()
    public readonly base: EquipableItemBase | null = null;

    @Input()
    public readonly heroClass: HeroClass = HeroClass.Warrior;

    @Input()
    public readonly maxLevel: number = MAX_ITEM_LEVEL;

    @Output()
    public readonly changed = new EventEmitter<EquipableItem | null>();
            
    public isDragging: boolean = false;

    public showOverlay = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }

    @HostListener('mousedown')
    public onMouseDown() {
        console.log('down');
        if (this.item !== null) {
            this.itemDragService.hold(this.item, this.base, (success, item) => success ? this.changed.emit(item) : null);
        }
        return false;
    }

    @HostListener('mouseup')
    public onMouseUp() {
        console.log('up');
        return false;
    }
    
    constructor(private dialog: MatDialog,
                private itemDragService: ItemDragService,
                private slormancerItemService: SlormancerItemService) {
        super();
        this.itemDragService.holdingItem
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(holding => console.log('dragging : ', this.isDragging = holding));
    }

    public ngOnInit() { }
    
    public edit(item: EquipableItem | null = this.item) {
        console.log('edit : ', item);
        if (item === null) {
            if (this.base !== null) {
                this.edit(this.slormancerItemService.getEmptyEquipableItem(this.base, this.heroClass, this.maxLevel));
            } else {
                this.dialog.open(ItemBaseChoiceModalComponent, { width: '80vw', maxWidth: '1000px' })
                .afterClosed().subscribe((base: EquipableItemBase | undefined) => {
                    if (base !== undefined && base !== null) {
                        this.edit(this.slormancerItemService.getEmptyEquipableItem(base, this.heroClass, this.maxLevel));
                    }
                });
            }
        } else {
            const data: ItemEditModalData = { item, maxLevel: this.maxLevel };
            this.dialog.open(ItemEditModalComponent, { data, width: '80vw', maxWidth: '1000px' })
            .afterClosed().subscribe((data: EquipableItem | null | undefined) => {
                if (data !== undefined) {
                    this.changed.emit(data);
                }
            });
        }
    }
}
