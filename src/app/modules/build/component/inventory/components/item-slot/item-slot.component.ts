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

    @HostListener('mousedown')
    public onMouseDown() {
        if (this.item !== null) {
            this.itemMoveService.hold(this.item, this.base, (success, item) => this.dragCallback(success, item));
        }
        return false;
    }

    @HostListener('mouseup', ['$event'])
    public onMouseUp(event: MouseEvent) {
        if (this.isDragging) {
            this.itemMoveService.swap(this.item, this.base, (success, item) => this.dragCallback(success, item));
            console.log(event);
            event.stopPropagation();
            event.stopImmediatePropagation();
            event.preventDefault();
        } else {
            this.edit();
        }
    }
    
    constructor(private dialog: MatDialog,
                private itemMoveService: itemMoveService,
                private slormancerItemService: SlormancerItemService) {
        super();
        this.itemMoveService.draggingItem
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(holding => {
                this.isDragging = holding;
                this.isDraggedItem = this.itemMoveService.isDraggedItem(this.item);
                this.isItemCompatible = this.itemMoveService.isDragItemCompatible(this.item, this.base);
            });


            // on devrait pouvoir drop n'importe où pour annuler
            // bordure moins transparente sur l'equipement hasMatchingBase
            // renomer en item move et gérer le click droit ?
    }

    public ngOnInit() { }

    private dragCallback(itemReplaced: boolean, item: EquipableItem | null) {
        if (itemReplaced) {
            this.changed.emit(item);
        }
        this.isDraggedItem = false;
        this.isItemCompatible = false;
    }
    
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
