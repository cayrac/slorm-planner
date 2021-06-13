import { Injectable } from '@angular/core';

import { AFFIX_TEXT, AffixText } from '../constants/affix-text';
import { GameRarity } from '../constants/game/game-rarity';
import { ItemRarity as Rarity } from '../constants/item-rarity';
import { AffixData } from '../model/affix-data';
import { GameAffixe, GameEquippableItem, GameItem, GameRessourceItem } from '../model/game/game-item';
import { SlormancerGameDataService } from './slormancer-game-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';

@Injectable()
export class SlormancerItemService {

    constructor(private slormancerItemValueService : SlormancerItemValueService,
                private slormancerGameDataService: SlormancerGameDataService) { }

    public getEquipableItemSlot(item: GameEquippableItem): string {
        let slot = 'unknown';

        if (item !== null) {
            switch (item.slot) {
                case 0: slot = 'HELM'; break;
                case 1: slot = 'ARMOR'; break;
                case 2: slot = 'SHOULDER'; break;
                case 3: slot = 'BRACER'; break;
                case 4: slot = 'GLOVE'; break;
                case 5: slot = 'BOOT'; break;
                case 6: slot = 'RING'; break;
                case 7: slot = 'AMULET'; break;
                case 8: slot = 'BELT'; break;
                case 9: slot = 'CAPE'; break;
                default: slot = 'unknown'; break;
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

    public getAffixedata(item: GameEquippableItem, affix: GameAffixe): AffixData {
        const stat = this.slormancerGameDataService.getGameDataStat(affix);
        const values = this.slormancerItemValueService.getAffixValues(item, affix);
        const text: AffixText = AFFIX_TEXT[stat.REF];

        const keys = Object.keys(values).map(k => parseInt(k));

        if (text === undefined) {
            console.error('No affix text data found for ', stat.REF)
        }

        return {
            rarity: this.getRarity(affix.rarity),
            name: text ? text.name : stat.REF,
            values,
            min: keys[0],
            value: affix.value,
            max: keys[keys.length - 1],
            percent: stat.PERCENT === '%',
            prefix: text ? text.prefix : 'prefix',
            suffix: text ? text.suffix : 'suffix'
        }
    }
}