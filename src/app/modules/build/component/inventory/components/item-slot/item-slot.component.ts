import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
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
import {
    RemoveConfirmModalComponent,
} from '../../../../../shared/components/remove-confirm-modal/remove-confirm-modal.component';
import { MAX_ITEM_LEVEL } from '../../../../../slormancer/constants/common';
import { EquipableItemBase } from '../../../../../slormancer/model/content/enum/equipable-item-base';
import { HeroClass } from '../../../../../slormancer/model/content/enum/hero-class';
import { EquipableItem } from '../../../../../slormancer/model/content/equipable-item';
import { SlormancerItemService } from '../../../../../slormancer/services/content/slormancer-item.service';
import { itemMoveService } from '../../services/item-move.service';


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
    
    @ViewChild(MatMenuTrigger, { static: true })
    private menu: MatMenuTrigger | null = null; 
            
    public isDragging: boolean = false;

    public isMouseOver: boolean = false;

    public isItemCompatible: boolean = false;

    public isDraggedItem: boolean = false;

    @HostListener('mouseenter')
    public onMouseOver() {
        this.isMouseOver = true;
    }

    @HostListener('mouseleave')
    public onMouseLeave() {
        this.isMouseOver = false;
    }

    @HostListener('mousedown', ['$event'])
    public onMouseDown(event: MouseEvent) {
        if (event.button === 0) {
            this.take();
        }
        return false;
    }

    @HostListener('mouseup', ['$event'])
    public onMouseUp(event: MouseEvent) {
        if (event.button === 0) {
            if (this.isDragging) {
                this.itemMoveService.swap(this.item, this.base, (success, item) => this.moveCallback(success, item));
            } else {
                this.edit();
            }
        }
        return false;
    }

    @HostListener('contextmenu')
    public onMouseContextMenu() {
        this.itemMoveService.releaseHoldItem();
        if (this.menu !== null) {
            this.menu.openMenu();
        }
        return false;
    }
    
    constructor(private dialog: MatDialog,
                private itemMoveService: itemMoveService,
                private slormancerItemService: SlormancerItemService) {
        super();
        this.itemMoveService.draggingItem
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(holding => {
                this.isDragging = holding;
                this.isDraggedItem = this.itemMoveService.isHoldItem(this.item);
                this.isItemCompatible = this.itemMoveService.isDragItemCompatible(this.item, this.base);
            });


            // on devrait pouvoir drop n'importe où pour annuler
            // bordure moins transparente sur l'equipement hasMatchingBase
            // renomer en item move et gérer le click droit ?
    }

    public ngOnInit() { }

    private moveCallback(itemReplaced: boolean, item: EquipableItem | null) {
        if (itemReplaced) {
            this.changed.emit(item);
        }
        this.isDraggedItem = false;
        this.isItemCompatible = false;
    }
    
    public edit(item: EquipableItem | null = this.item) {
        if (item === null) {
            if (this.base !== null) {
                this.edit(this.slormancerItemService.getEmptyEquipableItem(this.base, this.heroClass, this.maxLevel));
            } else {
                this.dialog.open(ItemBaseChoiceModalComponent)
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

    public take() {
        if (this.item !== null) {
            this.itemMoveService.hold(this.item, this.base, (success, item) => this.moveCallback(success, item));
        }
    }
    
    public copy() {
        if (this.item !== null) {
            const itemCopy = this.slormancerItemService.getEquipableItemClone(this.item);
            this.itemMoveService.hold(itemCopy, itemCopy.base);
        }
    }

    public remove() {
        this.dialog.open(RemoveConfirmModalComponent)
        .afterClosed().subscribe((choice) => {
            if (choice === true) {
                this.changed.emit(null);
            }
        });
    }

    public equip() {
        if (this.item !== null) {
            this.itemMoveService.equip(this.item, (success, item) => this.moveCallback(success, item));
        }
    }

    public unequip() {
        if (this.item !== null) {
            this.itemMoveService.moveToStash(this.item, (success, item) => this.moveCallback(success, item));
        }
    }
}
