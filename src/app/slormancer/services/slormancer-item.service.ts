import { Injectable } from '@angular/core';

import { GAME_DATA } from '../constants/game-data';
import { GameDataStat } from '../model/game/stat';
import { Affixe, EquippableItem, Item, RessourceItem } from '../model/item';
import { bankerRound } from '../util/math.util';

interface MinMax {
    min: number;
    max: number;
}

@Injectable()
export class SlormancerItemService {
    // Optimise un truc pour recharger en masse (réutilise le file input)

    private readonly RARITY_RATIO = {
        'N': { min: 70, max: 100 },
        'M': { min: 45, max: 65 },
        'R': { min: 45, max: 65 },
        'E': { min: 20, max: 40 },
        'L': { min: 100, max: 100 }
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

    private getLevelPercentScore(item: EquippableItem): number {
        return Math.max(1, Math.floor((item.level + 10) / 15));
    }

    private getComputedBaseValue(item: EquippableItem, affixe: Affixe): number {
        const stat = this.getAffixeGameData(affixe);
        let result = stat.SCORE;

        if (stat.PERCENT === '%') {
            result = this.getLevelPercentScore(item) * stat.SCORE * 20;
        } else if (stat.PERCENT === '') {
            result = stat.SCORE * (100 + (item.level * 30)) / 100;
        }

        return result;
    }

    private roundValue(value: number, affixe: Affixe): number {
        const stat = this.getAffixeGameData(affixe);
        let result = value;

        if (stat.PERCENT === '%') {
            if (stat.SCORE < 5) {
                result = bankerRound(value * 10) / 1000;
            } else {
                result = bankerRound(value / 50) / 2;
            }
        } else if (stat.PERCENT === '') {
            result = Math.max(1, bankerRound(value));
        }

        return result;
    }

    private getRarityRatio(affixe: Affixe): MinMax {     
        return this.RARITY_RATIO[affixe.rarity];
    }

    private getValueRatio(item: EquippableItem, affixe: Affixe): number {
        const stat = this.getAffixeGameData(affixe);
        const levelScore = this.getLevelPercentScore(item);
        let ratio = affixe.value;

        if (stat.PERCENT === '%') {
            ratio = ratio * 5 / levelScore;
        }

        return ratio;
    }

    public computeAffixeValueRange(item: EquippableItem, affixe: Affixe): MinMax {
        const value = this.getComputedBaseValue(item, affixe);
        const ratio = this.getRarityRatio(affixe);
        const reinforcment = 100 + (15 * item.reinforcment);

        return {
            min: this.roundValue(value * reinforcment * ratio.min / (100 * 100), affixe),
            max: this.roundValue(value * reinforcment * ratio.max / (100 * 100), affixe)
        };
    }

    public computeAffixeValue(item: EquippableItem, affixe: Affixe): number {
        const value = this.getComputedBaseValue(item, affixe);
        const reinforcment = 100 + (15 * item.reinforcment);
        const ratio = this.getValueRatio(item, affixe);

        return this.roundValue(value * reinforcment * ratio / (100 * 100), affixe);
    }
}