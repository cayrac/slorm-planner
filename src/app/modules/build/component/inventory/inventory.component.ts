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
import { SlormancerCharacterService } from '../../../slormancer/services/slormancer-character.service';
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
                private itemMoveService: ItemMoveService,
                private slormancerCharacterService: SlormancerCharacterService) {
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
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
        
    public updateAmulet(amulet: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.amulet = amulet;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
        
    public updateShoulder(shoulder: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.shoulder = shoulder;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
        
    public updateBracer(bracer: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.bracer = bracer;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
        
    public updateGlove(glove: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.glove = glove;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
        
    public updateBody(body: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.body = body;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
        
    public updateCape(cape: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.cape = cape;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
        
    public updateBelt(belt: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.belt = belt;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
        
    public updateLeftRing(ring: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.ring_l = ring;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
        
    public updateBoot(boot: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.boot = boot;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
        
    public updateRightRing(ring: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear.ring_r = ring;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
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
