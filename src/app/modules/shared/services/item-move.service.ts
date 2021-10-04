import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Character } from '../../slormancer/model/character';
import { EquipableItemBase } from '../../slormancer/model/content/enum/equipable-item-base';
import { EquipableItem } from '../../slormancer/model/content/equipable-item';
import { PlannerService } from './planner.service';

export declare type DragCallback = (itemReplaced: boolean, item: EquipableItem | null) => void;

@Injectable()
export class ItemMoveService {

    public readonly draggingItem = new BehaviorSubject<boolean>(false);

    private dragCount = 0;

    private character: Character | null = null;

    private item: EquipableItem | null = null;

    private requiredBase: EquipableItemBase | null = null;

    private callback: null | DragCallback = null;

    constructor(private plannerService: PlannerService) {
        this.plannerService.characterChanged
            .subscribe(character => this.character = character);
    }

    public hold(item: EquipableItem, requiredBase: EquipableItemBase | null, callback: DragCallback | null = null) {
        this.dragCount = 0;
        this.item = item;
        this.requiredBase = requiredBase;
        this.callback = callback;
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
        const character = this.character;
        if (character !== null) {
            const requiredBase = item.base;
            this.hold(item, requiredBase, callbackTarget);
    
            switch(requiredBase) {
                case EquipableItemBase.Amulet :
                    this.swap(character.gear.amulet, requiredBase, (s, item) => s ? character.gear.amulet = item : null);
                    break;
                case EquipableItemBase.Belt :
                    this.swap(character.gear.belt, requiredBase, (s, item) => s ? character.gear.belt = item : null);
                    break;
                case EquipableItemBase.Body :
                    this.swap(character.gear.body, requiredBase, (s, item) => s ? character.gear.body = item : null);
                    break;
                case EquipableItemBase.Boot :
                    this.swap(character.gear.boot, requiredBase, (s, item) => s ? character.gear.boot = item : null);
                    break;
                case EquipableItemBase.Bracer :
                    this.swap(character.gear.bracer, requiredBase, (s, item) => s ? character.gear.bracer = item : null);
                    break;
                case EquipableItemBase.Cape :
                    this.swap(character.gear.cape, requiredBase, (s, item) => s ? character.gear.cape = item : null);
                    break;
                case EquipableItemBase.Glove :
                    this.swap(character.gear.glove, requiredBase, (s, item) => s ? character.gear.glove = item : null);
                    break;
                case EquipableItemBase.Helm :
                    this.swap(character.gear.helm, requiredBase, (s, item) => s ? character.gear.helm = item : null);
                    break;
                case EquipableItemBase.Shoulder :
                    this.swap(character.gear.shoulder, requiredBase, (s, item) => s ? character.gear.shoulder = item : null);
                    break;
                case EquipableItemBase.Ring :
                    if (character.gear.ring_r === null) {
                        this.swap(character.gear.ring_r, requiredBase, (s, item) => s ? character.gear.ring_r = item : null);
                    } else {
                        this.swap(character.gear.ring_l, requiredBase, (s, item) => s ? character.gear.ring_l = item : null);
                    }
                    break;
            }
        }
    }

    public moveToStash(item: EquipableItem, callbackTarget: DragCallback | null) {
        const character = this.character;
        if (character !== null) {
            const firstValidItemGroup = [
                character.inventory,
                ...character.sharedInventory
            ].filter(group => group.find(item => item === null) !== undefined)[0];

            if (firstValidItemGroup) {
                this.hold(item, null, callbackTarget);
                this.moveDraggedItemToItemGroup(firstValidItemGroup);
            }
        }
    }
}