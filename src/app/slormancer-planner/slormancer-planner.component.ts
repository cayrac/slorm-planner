import { Component, OnInit } from '@angular/core';

import { GAME_DATA, GameSave, SlormancerSaveService } from '../slormancer';
import { AFFIX_TEXT } from '../slormancer/constants/affix-text';
import { HeroClass } from '../slormancer/constants/hero-class';
import { AffixData } from '../slormancer/model/affix-data';
import { GameAffixe, GameEquippableItem } from '../slormancer/model/game/game-item';
import { SlormancerGameDataService } from '../slormancer/services/slormancer-game-data.service';
import { SlormancerItemValueService } from '../slormancer/services/slormancer-item-value.service';
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

    public selectedItem: number | null = 32;

    constructor(private slormancerSaveService: SlormancerSaveService,   
                private slormancerGameDataService: SlormancerGameDataService,
                private slormancerItemService: SlormancerItemService,
                private slormancerItemValueService: SlormancerItemValueService) {
        
        console.log(GAME_DATA.STAT.filter(stat => stat.PERCENT !== 'X').map(stat => stat.REF).filter(ref => Object.keys(AFFIX_TEXT).indexOf(ref) === -1));

        console.log(Object.keys(AFFIX_TEXT).length + ' sur ' + GAME_DATA.STAT.length);
    }

    public ngOnInit() {
        this.loadSave(SAVE);
    }
    
    public getSave(): GameSave | null {
        return this.save;
    }
    
    public getSelectedItem(): GameEquippableItem | null {
        return this.selectedItem === null || this.getItemOptions()[this.selectedItem] === undefined ? null : this.getItemOptions()[this.selectedItem].value;
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
            if (files !== null && files.length > 0) {
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

    public getLevel(item: GameEquippableItem | null): number | null {
        return item !== null ? item.level : null;
    }

    public getReinforcmentLevel(item: GameEquippableItem | null): number | null {
        return item !== null ? item.reinforcment : null;
    }

    public getItemAffixes(): Array<AffixData> {
        const item = this.getSelectedItem();
        
        return item === null ? [] : item.affixes.map(affixe => this.slormancerItemService.getAffixedata(item, affixe));
    }

    public affixeToStat(affixe: GameAffixe): string | null {
        const stat = GAME_DATA.STAT.find(stat => stat.REF_NB === affixe.type);
        return stat ? stat.REF + ' (' +affixe.type+ ')' : null;
    }

    public getItemOptions(): Array<{ label: string, value: GameEquippableItem }> {
        const options: Array<{ label: string, value: GameEquippableItem }> = [];

        if (this.save !== null) {
            const inventory = this.save.inventory[this.selectedClass];

            if (this.slormancerItemService.isEquipableItem(inventory.amulet)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.amulet) + ' (E)', value: inventory.amulet });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.belt)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.belt) + ' (E)', value: inventory.belt });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.boots)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.boots) + ' (E)', value: inventory.boots });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.bracers)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.bracers) + ' (E)', value: inventory.bracers });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.cape)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.cape) + ' (E)', value: inventory.cape });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.chest)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.chest) + ' (E)', value: inventory.chest });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.gloves)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.gloves) + ' (E)', value: inventory.gloves });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.hemlet)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.hemlet) + ' (E)', value: inventory.hemlet });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.ring_l)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.ring_l) + ' (E)', value: inventory.ring_l });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.ring_r)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.ring_r) + ' (E)', value: inventory.ring_r });
            }
            if (this.slormancerItemService.isEquipableItem(inventory.spaulder)) {
                options.push({ label: this.slormancerItemService.getEquipableItemSlot(inventory.spaulder) + ' (E)', value: inventory.spaulder });
            }

            options.push(...inventory.bag
                .filter(this.slormancerItemService.isEquipableItem)
                .map((item, i) => ({ label: this.slormancerItemService.getEquipableItemSlot(item) + '(' + i + ')', value: item })));
        }

        return options;
    }

    public getEquipableItemSlot(item: GameEquippableItem | null): string {
        return item === null ? '' : this.slormancerItemService.getEquipableItemSlot(item);
    }

    public getMinMaxbaseValues(affixe: AffixData): string {
        const values = Object.keys(affixe.values).map(v => parseInt(v));
        const min = values.filter(k => affixe.values[k] === affixe.values[affixe.min]).join(',');
        const max = values.filter(k => affixe.values[k] === affixe.values[affixe.max]).join(',');

        return min + ' - ' + max;
    }
}
