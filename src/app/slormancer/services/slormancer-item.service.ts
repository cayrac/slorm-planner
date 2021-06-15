import { Injectable } from '@angular/core';

import { EquipableItemType } from '../constants/equipable-item-type';
import { GameRarity } from '../constants/game/game-rarity';
import { ItemRarity as Rarity } from '../constants/item-rarity';
import { EquipableItemTypeData } from '../model/equipable-item-type-data';
import { ExtendedAffix } from '../model/extended-affix';
import { ExtendedEquipableItem } from '../model/extended-equipable-item';
import { GameAffix, GameEquippableItem, GameItem, GameRessourceItem } from '../model/game/game-item';
import { compare, compareRarities, isNotNullOrUndefined } from '../util/utils';
import { SlormancerGameDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';

@Injectable()
export class SlormancerItemService {

    constructor(private slormancerItemValueService : SlormancerItemValueService,
                private slormancerDataService: SlormancerGameDataService) { }

    public getEquipableItemType(item: GameEquippableItem): EquipableItemType {
        let slot: EquipableItemType = EquipableItemType.Helm;

        if (item !== null) {
            switch (item.slot) {
                case 0: slot = EquipableItemType.Helm; break;
                case 1: slot = EquipableItemType.Armor; break;
                case 2: slot = EquipableItemType.Shoulder; break;
                case 3: slot = EquipableItemType.Bracer; break;
                case 4: slot = EquipableItemType.Glove; break;
                case 5: slot = EquipableItemType.Boot; break;
                case 6: slot = EquipableItemType.Ring; break;
                case 7: slot = EquipableItemType.Amulet; break;
                case 8: slot = EquipableItemType.Belt; break;
                case 9: slot = EquipableItemType.Cape; break;
                default: 
                    console.error('Unexpected item slot ' + item.slot);
                    break;
            }
        }
        return slot;
    }

    private getRarity(rarity: GameRarity): Rarity {
        let result: Rarity;

        if (rarity === 'N') {
            result = Rarity.Normal;
        } else if (rarity === 'M') {
            result = Rarity.Magic;
        } else if (rarity === 'R') {
            result = Rarity.Rare;
        } else if (rarity === 'E') {
            result = Rarity.Epic;
        } else {
            result = Rarity.Legendary;
        }

        return result;
    }

    public isEquipableItem(item: GameItem | null): item is GameEquippableItem {
        return item !== null && item.hasOwnProperty('slot');
    }

    public isRessourceItem(item: GameItem | null): item is GameRessourceItem {
        return item !== null && item.hasOwnProperty('quantity');
    }

    public getExtendedAffix(item: GameEquippableItem, affix: GameAffix): ExtendedAffix | null {
        const stat = this.slormancerDataService.getGameStatData(affix);
        const values = this.slormancerItemValueService.getAffixValues(item, affix);
        const keys = Object.keys(values).map(k => parseInt(k));
        const minValue = keys[0];
        const maxValue = keys[keys.length - 1];
        const result: ExtendedAffix | null = {
            rarity: this.getRarity(affix.rarity),
            name: '??',
            values,
            min: minValue ? minValue : 0,
            value: affix.value,
            max: maxValue ? maxValue : 0,
            percent: false,
            suffix: '??'
        };

        if (stat !== null) {
            const affixData = this.slormancerDataService.getAffixData(affix);

            result.percent = stat.PERCENT === '%';

            if (affixData) {
                result.name = affixData.name;
                result.suffix = affixData.suffix;
            } else {
                result.name = stat.REF;
                console.error('No affix data found for ', stat.REF)
            }
        }

        return result;
    }

    private getItemName(type: EquipableItemType, base: string, rarity: Rarity, item: GameEquippableItem): string {
        let baseName = base;
        let rarityPrefix: string | null = null;
        let suffix: string | null = null;
        let reinforcment: string | null = item.reinforcment > 0 ? '+' + item.reinforcment : null;
        let data: EquipableItemTypeData | null = null;

        if (rarity === Rarity.Epic) {
            rarityPrefix = 'epic';
        } else if (rarity === Rarity.Legendary) {
            rarityPrefix = 'legendary';
        }

        data = this.slormancerDataService.getEquipableItemData(type, base);

        if (data !== null) {
            baseName = data.name;
        }

        const magicAffixes = item.affixes.filter(affix => affix.rarity === 'M');
        if (magicAffixes[0]) {
            const affixData = this.slormancerDataService.getAffixData(magicAffixes[0]);
            
            if (affixData !== null) {
                suffix = affixData.suffix;
            }
        }

        return [rarityPrefix, baseName, suffix, reinforcment].filter(isNotNullOrUndefined).join(' ');
    }

    private getItemRarity(item: GameEquippableItem): Rarity {
        const rarities = item.affixes.map(affix => affix.rarity);
        let rarity = Rarity.Normal;

        if (rarities.indexOf('L') !== -1) {
            rarity = Rarity.Legendary;
        } else if (rarities.indexOf('E') !== -1) {
            rarity = Rarity.Epic;
        } else if (rarities.indexOf('R') !== -1) {
            rarity = Rarity.Rare;
        } else if (rarities.indexOf('M') !== -1) {
            rarity = Rarity.Magic;
        }

        return rarity;
    }

    private getItembase(item: GameEquippableItem): string {
        return item.affixes
            .filter(affix => affix.rarity === 'N')
            .map(affix => this.slormancerDataService.getGameStatData(affix))
            .filter(isNotNullOrUndefined)
            .map(stat => stat.PRIMARY_NAME_TYPE)
            .sort()
            .join('-')
    }

    public getExtendedEquipableItem(item: GameEquippableItem): ExtendedEquipableItem {
        const type = this.getEquipableItemType(item);
        const base = this.getItembase(item);
        const rarity = this.getItemRarity(item);
        const name = this.getItemName(type, base, rarity, item);
        const affixes = item.affixes.map(affix => this.getExtendedAffix(item, affix))
            .filter(isNotNullOrUndefined)
            .sort((a, b) => {
                const rarity = compareRarities(a.rarity, b.rarity);
                return rarity === 0 ? compare(a.name, b.name) : rarity;
            });

        return {
            type,
            name,
            base,
            rarity,
            affixes,
            level: item.level,
            reinforcment: item.reinforcment
        };
    }
}