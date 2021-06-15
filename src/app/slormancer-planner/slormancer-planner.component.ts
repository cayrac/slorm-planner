import { Component, OnInit } from '@angular/core';

import { GameSave, SlormancerSaveService } from '../slormancer';
import { HeroClass } from '../slormancer/constants/hero-class';
import { ExtendedEquipableItem } from '../slormancer/model/extended-equipable-item';
import { GameEquippableItem } from '../slormancer/model/game/game-item';
import { SlormancerItemService } from '../slormancer/services/slormancer-item.service';
import { SAVE } from './save';

@Component({
  selector: 'app-slormancer-planner',
  templateUrl: './slormancer-planner.component.html',
  styleUrls: ['./slormancer-planner.component.scss']
})
export class SlormancerPlannerComponent implements OnInit {

    public readonly CLASS_OPTIONS = [
        { value: HeroClass.Huntress, label: HeroClass.Huntress.toString() },
        { value: HeroClass.Mage, label: HeroClass.Mage.toString() },
        { value: HeroClass.Warrior, label: HeroClass.Warrior.toString() },
    ];
    
    private save: GameSave | null = null;

    public selectedClass: HeroClass = HeroClass.Huntress;

    public selectedItem: number | null = 0;

    public selectedExtendedItem: ExtendedEquipableItem | null = null;

    constructor(private slormancerSaveService: SlormancerSaveService,   
                private slormancerItemService: SlormancerItemService) {
    }

    public ngOnInit() {
        this.loadSave(SAVE);
        this.updateExtendedItem();
    }
    
    public getSave(): GameSave | null {
        return this.save;
    }

    public itemChanged() {
        this.updateExtendedItem();
    }

    private updateExtendedItem() {
        this.selectedExtendedItem = null;

        if (this.selectedItem !== null) {
            const option = this.getItemOptions()[this.selectedItem];

            if (option) {
                this.selectedExtendedItem = this.slormancerItemService.getExtendedEquipableItem(option.value);
            }
        }
    }

    public hasSave(): boolean {
        return this.save !== null;
    }

    public clearSave() {
        this.save = null;
    }

    public loadSave(file: string) {
        this.save = this.slormancerSaveService.parseSaveFile(file);
    }

    public uploadSave(file: Event) {
        if (file.target !== null) {
            const files = (<HTMLInputElement>file.target).files;
            if (files !== null && files[0]) {
                this.upload(files[0]);
            }
        }
    }

    public upload(file: File) {
        var reader: FileReader | null = new FileReader();
 
		reader.onerror = () => {
			reader = null;
            alert('Failed to upload file');
 		};
		reader.onloadend = () => {
            if (reader !== null && reader.result !== null) {
                this.loadSave(reader.result.toString());
                reader = null;
            }
		};
 
		reader.readAsText(file);
    }

    public getItemOptions(): Array<{ label: string, value: GameEquippableItem }> {
        const options: Array<{ label: string, value: GameEquippableItem }> = [];

        if (this.save !== null) {
            const inventory = this.save.inventory[this.selectedClass];

            if (this.slormancerItemService.isEquipableItem(inventory.amulet)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.amulet) + ' (E)', value: inventory.amulet });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.belt)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.belt) + ' (E)', value: inventory.belt });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.boots)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.boots) + ' (E)', value: inventory.boots });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.bracers)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.bracers) + ' (E)', value: inventory.bracers });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.cape)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.cape) + ' (E)', value: inventory.cape });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.chest)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.chest) + ' (E)', value: inventory.chest });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.gloves)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.gloves) + ' (E)', value: inventory.gloves });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.hemlet)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.hemlet) + ' (E)', value: inventory.hemlet });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.ring_l)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.ring_l) + ' (E)', value: inventory.ring_l });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.ring_r)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.ring_r) + ' (E)', value: inventory.ring_r });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.spaulder)) {
                options.push({ label: this.slormancerItemService.getEquipableItemType(inventory.spaulder) + ' (E)', value: inventory.spaulder });
            }

            options.push(...inventory.bag
                .filter(this.slormancerItemService.isEquipableItem)
                .map((item, i) => ({ label: this.slormancerItemService.getEquipableItemType(item) + '(' + i + ')', value: item })));
        }

        return options;
    }
}
