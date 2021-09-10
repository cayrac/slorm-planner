import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character } from '../../../slormancer/model/character';
import { EquipableItemBase } from '../../../slormancer/model/content/enum/equipable-item-base';
import { EquipableItem } from '../../../slormancer/model/content/equipable-item';
import { Reaper } from '../../../slormancer/model/content/reaper';
import { itemMoveService as ItemMoveService } from './services/item-move.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent extends AbstractUnsubscribeComponent implements OnInit {

    public bases = EquipableItemBase;

    public character: Character | null = null;

    public isDragging: boolean = false;

    public itemGroupBeingDraggedOn: Array<EquipableItem | null> | null = null;

    public itemGroupDragDropPossible: boolean = false;

    constructor(private plannerService: PlannerService,
                private itemMoveService: ItemMoveService) {
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
        
    public updateHelm(helm: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.helm = helm;
        }
    }
        
    public updateAmulet(amulet: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.amulet = amulet;
        }
    }
        
    public updateShoulder(shoulder: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.shoulder = shoulder;
        }
    }
        
    public updateBracer(bracer: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.bracer = bracer;
        }
    }
        
    public updateGlove(glove: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.glove = glove;
        }
    }
        
    public updateBody(body: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.body = body;
        }
    }
        
    public updateCape(cape: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.cape = cape;
        }
    }
        
    public updateBelt(belt: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.belt = belt;
        }
    }
        
    public updateLeftRing(ring: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.ring_l = ring;
        }
    }
        
    public updateBoot(boot: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.boot = boot;
        }
    }
        
    public updateRightRing(ring: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.ring_r = ring;
        }
    }

    public updateReaper(reaper: Reaper) {
        if (this.character !== null) {
            this.character.reaper = reaper;
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
