import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character } from '../../../slormancer/model/character';
import { EquipableItemBase } from '../../../slormancer/model/content/enum/equipable-item-base';
import { EquipableItem } from '../../../slormancer/model/content/equipable-item';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent extends AbstractUnsubscribeComponent implements OnInit {

    public bases = EquipableItemBase;

    public character: Character | null = null;

    constructor(private plannerService: PlannerService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }
    
    public updateCharacter() {
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

    public updateIventoryItem(index: number, item: EquipableItem | null) {
        if (this.character !== null) {
            this.character.inventory[index] = item;
        }
    }
}
