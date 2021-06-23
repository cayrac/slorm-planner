import { Component, OnInit } from '@angular/core';

import { GameSave } from '../slormancer';
import { GAME_DATA } from '../slormancer/constants/game/game-data';
import { HeroClass } from '../slormancer/model/enum/hero-class';
import { EquipableItem } from '../slormancer/model/equipable-item';
import { GameDataActivable } from '../slormancer/model/game/data/game-data-activable';
import { GameDataLegendary } from '../slormancer/model/game/data/game-data-legendary';
import { GameAffix, GameEquippableItem } from '../slormancer/model/game/game-item';
import { LegendaryEffect } from '../slormancer/model/legendary-effect';
import { SlormancerDataService } from '../slormancer/services/slormancer-data.service';
import { SlormancerItemService } from '../slormancer/services/slormancer-item.service';
import { SlormancerLegendaryEffectService } from '../slormancer/services/slormancer-legendary-effect.service';
import { SlormancerSaveParserService } from '../slormancer/services/slormancer-save-parser.service';
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

    public selectedExtendedItem: EquipableItem | null = null;

    constructor(private slormancerSaveParserService: SlormancerSaveParserService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerDataService: SlormancerDataService,
                private slormancerItemService: SlormancerItemService) {
        /*GAME_DATA.LEGENDARY
            .filter(legendary => legendary.LOOTABLE)
            .filter(legendary => legendary.SKILL !== null && legendary.SKILL.length > 0 && legendary.HERO === 2)
            .forEach(legendary => console.log(legendary.ITEM + ' - ' + legendary.EN_NAME + ' : ' + legendary.HERO + ' - ' + legendary.SKILL));*/
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

    public getBaseItem(): any {
        return this.selectedItem !== null ? this.getItemOptions()[this.selectedItem]?.value : null;
    }

    public getLegendariesData(): Array<{ game: GameDataLegendary, activable: GameDataActivable | null, effect: LegendaryEffect }> {
        return GAME_DATA.LEGENDARY
            .map(legendary => ({ game: legendary, activable: this.slormancerDataService.getlegendaryGameDataActivableBasedOn(legendary.REF), effect: this.getLegendaryEffect(legendary) }))
            // .filter(data => data.activable !== null)
            ;
    }

    public getLegendaryItem(data: GameDataLegendary): EquipableItem | null {
        let legendary: EquipableItem | null = null;

        if (this.selectedItem !== null) {
            const option = this.getItemOptions()[this.selectedItem];

            if (option) {
                const item: GameEquippableItem = { ...option.value };
                switch (data.ITEM) {
                    case 'helm': item.slot = 0; break;
                    case 'body': item.slot = 1; break;
                    case 'shoulder': item.slot = 2; break;
                    case 'bracer': item.slot = 3; break;
                    case 'glove': item.slot = 4; break;
                    case 'boot': item.slot = 5; break;
                    case 'ring': item.slot = 6; break;
                    case 'amulet': item.slot = 7; break;
                    case 'belt': item.slot = 8; break;
                    case 'cape': item.slot = 9; break;
                    default: 
                        console.error('Unexpected item slot ' + item.slot);
                        break;
                }

                item.reinforcment = 0;
                item.affixes = item.affixes.filter(affix => affix.rarity !== 'L');
                item.affixes.push({
                    rarity: 'L',
                    type: data.REF,
                    value: 100,
                    locked: false,
                })
                legendary = this.slormancerItemService.getExtendedEquipableItem(item);
            }
        }

        return legendary;
    }

    private getLegendaryEffect(data: GameDataLegendary): LegendaryEffect {
        const affix: GameAffix = {
            rarity: 'L',
            type: data.REF,
            value: 100,
            locked: false,
        }
        return <LegendaryEffect>this.slormancerLegendaryEffectService.getExtendedLegendaryEffect(affix);
    }

    public showData(data: any) {
        console.log(data);
    }

    public hasSave(): boolean {
        return this.save !== null;
    }

    public clearSave() {
        this.save = null;
    }

    public loadSave(file: string) {
        this.save = this.slormancerSaveParserService.parseSaveFile(file);
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
