import { Injectable } from '@angular/core';

import { GAME_DATA } from '../constants/game-data';
import { GameDataStat } from '../model/game/stat';
import { Affixe, EquippableItem, Item, RessourceItem } from '../model/item';

@Injectable()
export class SlormancerItemService {

    // Cheatengine : chercher des doubles (valeur exacte, déplacer marche, dépiler garde la valeur)

    // pas bon : 

    // retaliate_percent N +2
    // peut être les stats S et P ?

    // thorns_percent M => comme si valeur non réduite par M

    // PEUT ÊTRE qu'il faut round puis reinforcment ?

    private readonly RARITY_RATIO = {
        '': {
            'N': { min: 70, max: 100 },
            'M': { min: 45, max: 65 },
            'R': { min: 45, max: 65 },
            'E': { min: 45, max: 65 },
            'L': { min: 45, max: 65 }
        },
        '%': {
            'N': { min: 70, max: 100 },
            'M': { min: 70, max: 100 },
            'R': { min: 70, max: 100 },
            'E': { min: 45, max: 65 },
            'L': { min: 45, max: 65 }
        },
        'X': {
            'N': { min: 70, max: 100 },
            'M': { min: 45, max: 65 },
            'R': { min: 45, max: 65 },
            'E': { min: 45, max: 65 },
            'L': { min: 45, max: 65 }
        }
    }

    public getEquipableItemSlot(item: EquippableItem): string {
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

    public getAffixeSlotRatio(item: EquippableItem, affixe: Affixe): string {
        const stat = this.getAffixeGameData(affixe);
        let ratio = '';

        if (item !== null) {
            switch (item.slot) {
                case 0: ratio = stat.HELM; break;
                case 1: ratio = stat.ARMOR; break;
                case 2: ratio = stat.SHOULDER; break;
                case 3: ratio = stat.BRACER; break;
                case 4: ratio = stat.GLOVE; break;
                case 5: ratio = stat.BOOT; break;
                case 6: ratio = stat.RING; break;
                case 7: ratio = stat.AMULET; break;
                case 8: ratio = stat.BELT; break;
                case 9: ratio = stat.CAPE; break;
                default: ratio = ''; break;
            }
        }
        return ratio;
    }

    public isEquipableItem(item: Item | null): item is EquippableItem {
        return item !== null && item.hasOwnProperty('slot');
    }

    public isRessourceItem(item: Item | null): item is RessourceItem {
        return item !== null && item.hasOwnProperty('quantity');
    }

    public getAffixeGameData(affixe: Affixe): GameDataStat {
        const stat = GAME_DATA.STAT.find(stat => stat.REF_NB === affixe.type);

        if (stat === undefined) {
            throw new Error('No affixe found for affixe type ' + affixe.type);
        }

        return stat;
    }

    private getComputedBaseValue(item: EquippableItem, affixe: Affixe): number {
        const stat = this.getAffixeGameData(affixe);
        let result = stat.SCORE;

        if (stat.PERCENT === '%') {
            result = (1 + Math.floor(item.level / 20)) * stat.SCORE * 20;
        } else if (stat.PERCENT === '') {
            result = stat.SCORE * (1 + (item.level * 3 / 10));
        }

        result = result * (1 + (item.reinforcment * 15 / 100));


        if (stat.REF === 'thorns_percent') {
            console.log('computing value for thorns_percent : ', result);
            console.log(stat.SCORE, item.level, item.reinforcment);
            if (stat.PERCENT === '%') {
                console.log(stat.SCORE * 20, (1 + Math.floor(item.level / 20)));
            } else if (stat.PERCENT === '') {
                console.log(1 + (item.level * 3 / 10));
            }
        }

        return result;
    }

    private roundValue(value: number, affixe: Affixe): number {
        const stat = this.getAffixeGameData(affixe);
        let result = value;

        if (stat.PERCENT === '%') {
            if (stat.SCORE < 5) {
                result = Math.round(value) / 100;
            } else {
                result = Math.round(value / 50) / 2;
            }
        } else if (stat.PERCENT === '') {
            result = Math.round(value);
        }

        return result;
    }

    private getRarityRatio(affixe: Affixe): { min: number, max: number } {
        const stat = this.getAffixeGameData(affixe);
        
        return this.RARITY_RATIO[stat.PERCENT][affixe.rarity];
    }

    public computeAffixeValueRange(item: EquippableItem, affixe: Affixe): { min: number, max: number } {
        const value = this.getComputedBaseValue(item, affixe);
        const ratio = this.getRarityRatio(affixe);

        return {
            min: this.roundValue(value * ratio.min / 100, affixe),
            max: this.roundValue(value * ratio.max / 100, affixe)
        }
    }
}