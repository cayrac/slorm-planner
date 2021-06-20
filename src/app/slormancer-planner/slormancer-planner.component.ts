import { Component, OnInit } from '@angular/core';

import { GameSave } from '../slormancer';
import { GAME_DATA } from '../slormancer/constants/game/game-data';
import { HeroClass } from '../slormancer/model/enum/hero-class';
import { EquipableItem } from '../slormancer/model/equipable-item';
import { GameDataLegendary } from '../slormancer/model/game/data/game-data-legendary';
import { GameAffix, GameEquippableItem } from '../slormancer/model/game/game-item';
import { LegendaryEffect } from '../slormancer/model/legendary-effect';
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

    public readonly LEGENDARY_EXPECTED_DATA: { [key: number]: Array<{ min: number, max: number, percent: boolean, range: boolean }>} = {
        25: [{ min: 22, max: 30, percent: true, range: true}],
        12: [{ min: 1, max: 1, percent: false, range: false}],
        20: [{ min: 8, max: 10, percent: true, range: true}],
        9: [{ min: 15, max: 20, percent: true, range: true}],
        56: [{ min: 1, max: 1, percent: false, range: false}],
        47: [],
        80: [{ min: 2, max: 3, percent: true, range: true}],
        29: [{ min: 14, max: 18, percent: true, range: true}, { min: 9, max: 12, percent: true, range: true}, { min: 10, max: 10, percent: false, range: false}],
        17: [{ min: 11, max: 15, percent: true, range: true}, { min: 5, max: 5, percent: false, range: false}],
        36: [],
        51: [{ min: 24, max: 32, percent: false, range: true}],
        64: [{ min: 2, max: 2, percent: false, range: true}],
        79: [],
        13: [{ min: 5, max: 5, percent: false, range: false}, { min: 5, max: 5, percent: true, range: false}],
        28: [{ min: 6, max: 8, percent: true, range: false}, { min: 10, max: 10, percent: false, range: false}],
        27: [],
        62: [{ min: 5, max: 5, percent: false, range: false}],
        42: [{ min: 22, max: 30, percent: true, range: true}],
        73: [{ min: 22, max: 30, percent: true, range: true}],
        76: [{ min: 1, max: 1, percent: false, range: false}, { min: 2, max: 2, percent: false, range: false}, { min: 1, max: 1, percent: false, range: false}],
        16: [{ min: 4, max: 5, percent: false, range: true}, { min: 2, max: 2, percent: true, range: false}],
        40: [],
        41: [{ min: 2, max: 2, percent: false, range: false}, { min: 11, max: 15, percent: true, range: true},{ min: 15, max: 20, percent: true, range: true}],
        24: [{ min: 38, max: 50, percent: true, range: true}, { min: 90, max: 90, percent: true, range: false}],
        74: [{ min: 2, max: 3, percent: true, range: true}, { min: 11, max: 15, percent: true, range: true}, { min: 6, max: 6, percent: false, range: false}],
        60: [],
        33: [{ min: 100, max: 100, percent: true, range: false }],
        55: [{ min: 2, max: 2, percent: true, range: false }],
        10: [{ min: 38, max: 50, percent: true, range: true }],
        30: [{ min: 1, max: 1, percent: true, range: false }],
        14: [{ min: 4, max: 5, percent: true, range: true }],
        43: [{ min: 4, max: 5, percent: true, range: true }],
        57: [{ min: 4, max: 4, percent: false, range: false }, { min: 2, max: 2, percent: false, range: false }],
        77: [],
        4: [{ min: 22, max: 30, percent: true, range: true }],
        5: [{ min: 20, max: 27, percent: true, range: true }],
        23: [{ min: 15, max: 20, percent: true, range: true }, { min: 100, max: 100, percent: true, range: false }, { min: 50, max: 50, percent: true, range: false }, { min: 4, max: 4, percent: false, range: false }],
        75: [{ min: 225, max: 300, percent: false, range: true }, { min: 1, max: 1, percent: false, range: false }],
        19: [{ min: 11, max: 15, percent: true, range: true }, { min: 8, max: 8, percent: false, range: false }],
        3: [{ min: 19, max: 25, percent: true, range: true }],
        18: [{ min: 8, max: 10, percent: true, range: true }],
        32: [{ min: 38, max: 50, percent: true, range: true }],
        11: [{ min: 27, max: 36, percent: true, range: true }],
        61: [{ min: 75, max: 100, percent: true, range: true }],
        54: [{ min: 15, max: 20, percent: true, range: true }, { min: 5, max: 5, percent: false, range: false }],
        38: [{ min: 15, max: 20, percent: true, range: true }, { min: 75, max: 100, percent: true, range: true }],
        15: [{ min: 7, max: 7, percent: false, range: false }, { min: 5, max: 5, percent: true, range: false }],
        6: [{ min: 1, max: 1, percent: true, range: false }],
        59: [],
        35: [{ min: 75, max: 100, percent: true, range: true }],
        31: [{ min: 2, max: 2, percent: false, range: false }],
        7: [{ min: 19, max: 25, percent: true, range: true }],
        34: [{ min: 38, max: 50, percent: true, range: true }, { min: 3, max: 3, percent: false, range: false }],
        37: [{ min: 2, max: 2, percent: false, range: false }],
        8: [{ min: 14, max: 18, percent: true, range: true }],
        22: [],
        78: [{ min: 1, max: 1, percent: false, range: false }],
        58: [{ min: 5, max: 5, percent: true, range: false }],
        2: [{ min: 3, max: 3, percent: false, range: false }, { min: 16, max: 21, percent: true, range: true }, { min: 16, max: 21, percent: true, range: true }],
        1: [{ min: 10, max: 10, percent: false, range: false }, { min: 20, max: 26, percent: true, range: true }, { min: 20, max: 26, percent: true, range: true }],
        26: [{ min: 1, max: 1, percent: false, range: false }, { min: 5, max: 5, percent: false, range: false }, { min: 4, max: 5, percent: false, range: true }],
        53: [],
        21: [],
        45: [{ min: 3, max: 3, percent: false, range: false }, { min: 60, max: 80, percent: true, range: true }],
        50: [{ min: 0.1, max: 0.1, percent: false, range: false }],
        52: [{ min: 5, max: 5, percent: true, range: false }, { min: 5, max: 5, percent: true, range: false }, { min: 5, max: 5, percent: false, range: false }],
        39: [{ min: 75, max: 100, percent: true, range: true }],
        48: [],
        46: [{ min: 8, max: 10, percent: true, range: true }],
        44: [{ min: 38, max: 50, percent: true, range: true }],
        49: [{ min: 38, max: 50, percent: true, range: true }],
        72: [{ min: 1, max: 1, percent: false, range: false }],
        71: [],
        69: [{ min: 8, max: 10, percent: true, range: true }, { min: 2.60, max: 2.60, percent: false, range: false }],
        67: [],
        65: [{ min: 15, max: 20, percent: true, range: true }, { min: 3, max: 3, percent: false, range: false }],
        70: [{ min: 50, max: 50, percent: true, range: false }, { min: 60, max: 80, percent: true, range: true }],
        68: [],
        66: [{ min: 9, max: 12, percent: true, range: true }],
        63: [{ min: 11, max: 15, percent: true, range: true }, { min: 5, max: 5, percent: true, range: false }, { min: 8, max: 8, percent: false, range: false }, { min: 12, max: 12, percent: false, range: false }],

    };
    
    private save: GameSave | null = null;

    public selectedClass: HeroClass = HeroClass.Huntress;

    public selectedItem: number | null = 14;

    public selectedExtendedItem: EquipableItem | null = null;

    constructor(private slormancerSaveParserService: SlormancerSaveParserService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerItemService: SlormancerItemService) {
        GAME_DATA.LEGENDARY
            .filter(legendary => legendary.LOOTABLE)
            .filter(legendary => legendary.SKILL !== null && legendary.SKILL.length > 0 && legendary.HERO === 2)
            .forEach(legendary => console.log(legendary.ITEM + ' - ' + legendary.EN_NAME + ' : ' + legendary.HERO + ' - ' + legendary.SKILL));
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

    public getLegendariesData(): Array<{ game: GameDataLegendary, expected: Array<{ min: number, max: number, percent: boolean, range: boolean }>, effect: LegendaryEffect }> {
        return GAME_DATA.LEGENDARY
            .map(legendary => ({ game: legendary, expected: <Array<{ min: number, max: number, percent: boolean, range: boolean }>>this.LEGENDARY_EXPECTED_DATA[legendary.REF], effect: this.getLegendaryEffect(legendary) }));
    }

    public getLegendaryItem(data: GameDataLegendary): EquipableItem | null {
        let legendary: EquipableItem | null = null;

        if (this.selectedItem !== null) {
            const option = this.getItemOptions()[this.selectedItem];

            if (option) {
                const item: GameEquippableItem = { ...option.value };
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
        return <LegendaryEffect>this.slormancerLegendaryEffectService.getExtendedLegendaryEffect(affix, 0);
    }

    public formatForHTML(desc: string): string {
        return desc.replace(/#/g, '<br/>');
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
