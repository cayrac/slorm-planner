import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EquipableItemBase } from '../../../../slormancer/model/content/enum/equipable-item-base';
import { EquipableItem } from '../../../../slormancer/model/content/equipable-item';

export declare type DragCallback = (cancelled: boolean, item: EquipableItem | null) => void;

@Injectable()
export class ItemDragService {

    public readonly draggingItem = new BehaviorSubject<boolean>(false);

    private item: EquipableItem | null = null;

    private requiredBase: EquipableItemBase | null = null;

    private callback: null | DragCallback = null;

    constructor() {
        console.log('new ItemDragService');
    }

    public hold(item: EquipableItem, requiredBase: EquipableItemBase | null, callback: DragCallback) {
        this.item = item;
        this.requiredBase = requiredBase;
        this.callback = callback;
    }

    public cursorIsMoving() {
        if (!this.draggingItem.getValue() && this.item !== null) {
            this.draggingItem.next(true);
        }
    }

    public isDragItemCompatible(item: EquipableItem | null, requiredBase: EquipableItemBase | null): boolean {
        const sourceIsCompatible = item === null || this.requiredBase === null || item.base === this.requiredBase;
        const targetIsCompatible = this.item !== null && (requiredBase === null || this.item.base === requiredBase);
        return sourceIsCompatible && targetIsCompatible;
    }

    public isDraggedItem(item: EquipableItem | null): boolean {
        return item === this.item && item !== null;
    }

    private releaseHoldItem() {
        this.item = null;
        this.requiredBase = null;
        this.callback = null;
        this.draggingItem.next(false);
    }

    public swap(item: EquipableItem | null, requiredBase: EquipableItemBase | null, callback: DragCallback) {
        const itemSwap = this.item;
        const callbaclSwap = this.callback;
        if (callbaclSwap !== null) {
            const compatible = this.isDragItemCompatible(item, requiredBase);
            this.releaseHoldItem();
            if (item !== itemSwap) {
                if (compatible) {
                    callbaclSwap(true, item);
                    callback(true, itemSwap);
                } else {
                    callbaclSwap(false, null);
                    callback(false, null);
                }
            }
        }
    } 
}