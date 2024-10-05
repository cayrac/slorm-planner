import { Injectable } from '@angular/core';
import { Character, EquipableItem, EquipableItemBase, GearSlot } from '@slorm-api';
import { BehaviorSubject } from 'rxjs';

import { BuildStorageService } from './build-storage.service';

export declare type DragCallback = (itemReplaced: boolean, item: EquipableItem | null) => void;

export declare type EquipCallback = (itemReplaced: boolean, item: EquipableItem | null, gearSlot: GearSlot) => void;

@Injectable({ providedIn: 'root' })
export class ItemMoveService {

    public readonly draggingItem = new BehaviorSubject<boolean>(false);

    private dragCount = 0;

    private item: EquipableItem | null = null;

    private requiredBase: EquipableItemBase | null = null;

    private callback: null | DragCallback = null;

    private equipCallback: null | EquipCallback = null;

    constructor(private buildStorageService: BuildStorageService) {
    }

    public hold(item: EquipableItem, requiredBase: EquipableItemBase | null, callback: DragCallback | null = null) {
        this.dragCount = 0;
        this.item = item;
        this.requiredBase = requiredBase;
        this.callback = callback;
    }

    public setEquipCallback(equipCallback: EquipCallback | null) {
        this.equipCallback = equipCallback;
    }

    public startDragging() {
        if (!this.draggingItem.getValue()) {
            this.dragCount++;
            if (this.item !== null && this.dragCount > 5) {
                this.draggingItem.next(true);
            }
        }
    }

    public isDragItemCompatible(item: EquipableItem | null, requiredBase: EquipableItemBase | null): boolean {
        const sourceIsCompatible = item === null || this.requiredBase === null || item.base === this.requiredBase;
        const targetIsCompatible = this.item !== null && (requiredBase === null || this.item.base === requiredBase);
        return sourceIsCompatible && targetIsCompatible;
    }

    public isHoldItem(item: EquipableItem | null): boolean {
        return item === this.item && item !== null;
    }

    public getHoldItem(): EquipableItem | null {
        return this.item;
    }

    public releaseHoldItem() {
        this.item = null;
        this.requiredBase = null;
        this.callback = null;
        this.draggingItem.next(false);
    }

    public swap(item: EquipableItem | null, requiredBase: EquipableItemBase | null, callbackTarget: DragCallback | null) {
        const sourceItem = this.item;
        const callableSource = this.callback;

        const compatible = this.isDragItemCompatible(item, requiredBase);
        this.releaseHoldItem();
        if (item !== sourceItem) {
            if (compatible) {
                if (callableSource) {
                    callableSource(true, item);
                }
                if (callbackTarget) {
                    callbackTarget(true, sourceItem);
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
        const holdItem = this.item;
        const sourceCallback = this.callback;
        const firstEmptyPosition = itemGroup.indexOf(null);
        const itemPosition = itemGroup.indexOf(holdItem);
        this.releaseHoldItem();
        if (firstEmptyPosition !== -1 || itemPosition !== -1) {
            if (sourceCallback) {
                sourceCallback(true, null);
            }
            const newPosition = Math.min(...[firstEmptyPosition, itemPosition].filter(v => v !== -1));
            itemGroup.splice(newPosition, 1, holdItem);
        } else {
            if (sourceCallback) {
                sourceCallback(false, null);
            }
        }
    }

    public equip(item: EquipableItem, callbackTarget: DragCallback | null) {
        const layer = this.buildStorageService.getLayer();
        if (layer !== null && layer.character !== null) {
            const requiredBase = item.base;
            const compatibleGearSlot = this.getCompatibleGearSlot(layer.character, item);
            this.hold(item, requiredBase, callbackTarget);

            this.swap(layer.character.gear[compatibleGearSlot], requiredBase, (itemReplaced: boolean, swapedItem: EquipableItem | null) => {
                if (this.equipCallback !== null) {
                    this.equipCallback(itemReplaced, swapedItem, compatibleGearSlot)
                }
            });
        }
    }

    public moveToStash(item: EquipableItem, callbackTarget: DragCallback | null) {
        const layer = this.buildStorageService.getLayer();
        if (layer !== null && layer.character !== null) {
            const firstValidItemGroup = [
                layer.character.inventory,
                ...layer.character.sharedInventory
            ].filter(group => group.find(item => item === null) !== undefined)[0];

            if (firstValidItemGroup) {
                this.hold(item, null, callbackTarget);
                this.moveDraggedItemToItemGroup(firstValidItemGroup);
            }
        }
    }

    private getCompatibleGearSlot(character: Character, item: EquipableItem): GearSlot {
        let result: GearSlot;
        switch(item.base) {
            case EquipableItemBase.Amulet :
                result = GearSlot.Amulet;
                break;
            case EquipableItemBase.Belt :
                result = GearSlot.Belt;
                break;
            case EquipableItemBase.Body :
                result = GearSlot.Body;
                break;
            case EquipableItemBase.Boot :
                result = GearSlot.Boot;
                break;
            case EquipableItemBase.Bracer :
                result = GearSlot.Bracer;
                break;
            case EquipableItemBase.Cape :
                result = GearSlot.Cape;
                break;
            case EquipableItemBase.Glove :
                result = GearSlot.Glove;
                break;
            case EquipableItemBase.Helm :
                result = GearSlot.Helm;
                break;
            case EquipableItemBase.Shoulder :
                result = GearSlot.Shoulder;
                break;
            case EquipableItemBase.Ring :
                if (character.gear.ring_r === null) {
                    result = GearSlot.RightRing;
                } else {
                    result = GearSlot.LeftRing;
                }
                break;
        }

        return result;
    }
}