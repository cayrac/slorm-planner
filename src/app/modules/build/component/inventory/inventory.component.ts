import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { ItemMoveService as ItemMoveService } from '../../../shared/services/item-move.service';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character } from '../../../slormancer/model/character';
import { EquipableItem } from '../../../slormancer/model/content/equipable-item';
import { Reaper } from '../../../slormancer/model/content/reaper';
import { SlormancerCharacterUpdaterService } from '../../../slormancer/services/slormancer-character.updater.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent extends AbstractUnsubscribeComponent implements OnInit {

    public character: Character | null = null;

    public isDragging: boolean = false;

    public itemGroupBeingDraggedOn: Array<EquipableItem | null> | null = null;

    public itemGroupDragDropPossible: boolean = false;

    constructor(private plannerService: PlannerService,
                private itemMoveService: ItemMoveService,
                private slormancerCharacterService: SlormancerCharacterUpdaterService) {
        super();
        this.itemMoveService.draggingItem
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(dragging => this.isDragging = dragging);
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }
    
    public updateCharacter() { }

    public dragInItemsGroup(itemGroup: Array<EquipableItem | null>) {
        if (this.isDragging) {
            this.itemGroupDragDropPossible = itemGroup.find(item => item === null) !== undefined;
            this.itemGroupBeingDraggedOn = itemGroup;
        }
    }

    public dragOutItemsGroup() {
        this.itemGroupBeingDraggedOn = null;
    }

    public dragDrop(itemGroups: Array<EquipableItem | null>) {
        this.itemMoveService.moveDraggedItemToItemGroup(itemGroups);
    }

    public gearChanged() {
        this.plannerService.updateCurrentCharacter();
    }

    public updateReaper(reaper: Reaper) {
        if (this.character !== null) {
            this.character.reaper = reaper;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }

    public updateIventoryItem(index: number, item: EquipableItem | null) {
        if (this.character !== null) {
            this.character.inventory[index] = item;
        }
    }

    public updateSharedInventoryItem(stashIndex: number, index: number, item: EquipableItem | null) {
        if (this.character !== null) {
            const stash = this.character.sharedInventory[stashIndex];
            if (stash) {
                stash[index] = item;
            }
        }
    }
}
