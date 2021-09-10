import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import {
    CharacterLevelEditModalComponent,
} from '../../../shared/components/character-level-edit-modal/character-level-edit-modal.component';
import { MessageService } from '../../../shared/services/message.service';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character } from '../../../slormancer/model/character';
import { EquipableItemBase } from '../../../slormancer/model/content/enum/equipable-item-base';
import { EquipableItem } from '../../../slormancer/model/content/equipable-item';
import { Reaper } from '../../../slormancer/model/content/reaper';
import { SlormancerItemService } from '../../../slormancer/services/content/slormancer-item.service';
import { isNotNullOrUndefined } from '../../../slormancer/util/utils';
import { itemMoveService as ItemMoveService } from './services/item-move.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent extends AbstractUnsubscribeComponent implements OnInit {

    @ViewChild(MatMenuTrigger)
    private menu: MatMenuTrigger | null = null; 

    public bases = EquipableItemBase;

    public character: Character | null = null;

    public isDragging: boolean = false;

    public itemGroupBeingDraggedOn: Array<EquipableItem | null> | null = null;

    public itemGroupDragDropPossible: boolean = false;

    constructor(private dialog: MatDialog,
                private messageService: MessageService,
                private plannerService: PlannerService,
                private itemMoveService: ItemMoveService,
                private slormancerItemService: SlormancerItemService) {
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

    public openCharacterSettings() {
        if (this.menu) {
            this.menu.toggleMenu();
        }
    }

    public editCharacterLevel() {
        if (this.character !== null) {
            this.dialog.open(CharacterLevelEditModalComponent, { data: { level: this.character.level } })
            .afterClosed().subscribe(level => {
                if (level && this.character !== null) {
                    this.character.level = level;
                }
            });
        }
    }
    
    public optimizeReaperEnchantments() {
        if (this.character !== null && this.character.reaper !== null) {
            const reaperEnchantment = this.slormancerItemService.getReaperEnchantment(this.character.reaper.smith.id, 5);

            [
                this.character.gear.amulet,
                this.character.gear.belt,
                this.character.gear.body,
                this.character.gear.boot,
                this.character.gear.bracer,
                this.character.gear.cape,
                this.character.gear.glove,
                this.character.gear.helm,
                this.character.gear.ring_l,
                this.character.gear.ring_r,
                this.character.gear.shoulder,
            ].filter(isNotNullOrUndefined)
            .forEach(item => {
                item.reaperEnchantment = this.slormancerItemService.getReaperEnchantmentClone(reaperEnchantment);
                this.slormancerItemService.updateEquippableItem(item);
            });

            this.messageService.message('All equipped items reaper buff optimized for ' + this.character.reaper.smith.name);
            
        }
    }
}
