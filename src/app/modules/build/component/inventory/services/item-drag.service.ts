import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EquipableItemBase } from '../../../../slormancer/model/content/enum/equipable-item-base';
import { EquipableItem } from '../../../../slormancer/model/content/equipable-item';

export declare type DragCallback = (cancelled: boolean, item: EquipableItem | null) => void;

@Injectable()
export class ItemDragService {

    public readonly holdingItem = new BehaviorSubject<boolean>(false);

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
        console.log('hold', item);
        this.holdingItem.next(true);
    }

    public isCompatibleItem(item: EquipableItem | null, requiredBase: EquipableItemBase | null): boolean {
        const sourceIsCompatible = item === null || this.requiredBase === null || item.base === this.requiredBase;
        const targetIsCompatible = this.item === null || requiredBase === null || this.item.base === requiredBase;
        return sourceIsCompatible && targetIsCompatible;
    }

    public swap(item: EquipableItem | null, requiredBase: EquipableItemBase | null, callback: DragCallback) {
        if (this.callback !== null && item !== this.item) {
            if (this.isCompatibleItem(item, requiredBase)) {
                this.callback(true, item);
                callback(true, this.item);
            } else {
                this.callback(false, null);
                callback(false, null);
            }
        }

        this.item = null;
        this.requiredBase = null;
        this.callback = null;
        this.holdingItem.next(false);
    } 
}