import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EquipableItemBase } from '../../../../slormancer/model/content/enum/equipable-item-base';
import { EquipableItem } from '../../../../slormancer/model/content/equipable-item';

export declare type DragCallback = (itemReplaced: boolean, item: EquipableItem | null) => void;

@Injectable()
export class itemMoveService {

    public readonly draggingItem = new BehaviorSubject<boolean>(false);

    private item: EquipableItem | null = null;

    private requiredBase: EquipableItemBase | null = null;

    private callback: null | DragCallback = null;

    constructor() {
        console.log('new itemMoveService');
    }

    public hold(item: EquipableItem, requiredBase: EquipableItemBase | null, callback: DragCallback | null) {
        this.item = item;
        this.requiredBase = requiredBase;
        this.callback = callback;
    }

    public startDragging() {
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

    public getDraggedItem(): EquipableItem | null {
        return this.item;
    }

    public releaseHoldItem() {
        this.item = null;
        this.requiredBase = null;
        this.callback = null;
        this.draggingItem.next(false);
    }

    public swap(item: EquipableItem | null, requiredBase: EquipableItemBase | null, callbackTarget: DragCallback | null) {
        const itemSwap = this.item;
        const callableSource = this.callback;

        const compatible = this.isDragItemCompatible(item, requiredBase);
        this.releaseHoldItem();
        if (item !== itemSwap) {
            if (compatible) {
                if (callableSource) {
                    callableSource(true, item);
                }
                if (callbackTarget) {
                    callbackTarget(true, itemSwap);
                }
            } else {
                if (callableSource) {
                    callableSource(false, null);
                }
                if (callbackTarget) {
                    callbackTarget(false, null);
                }
            }
        }
    }

    public moveDraggedItemToItemGroup(itemGroup: Array<EquipableItem | null>) {
        console.log('moveDraggedItemToItemGroup');
        const draggedItem = this.item;
        const sourceCallback = this.callback;
        const firstEmptyPosition = itemGroup.indexOf(null);
        const itemPosition = itemGroup.indexOf(draggedItem);
        this.releaseHoldItem();
        if (firstEmptyPosition !== -1 || itemPosition !== -1) {
            if (sourceCallback) {
                sourceCallback(true, null);
            }
            const newPosition = Math.min(...[firstEmptyPosition, itemPosition].filter(v => v !== -1));
            console.log('adding item at index ' + newPosition, itemGroup);
            itemGroup.splice(newPosition, 1, draggedItem);
        } else {
            if (sourceCallback) {
                sourceCallback(false, null);
            }
        }
    }
}