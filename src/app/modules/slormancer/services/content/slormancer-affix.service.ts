import { Injectable } from '@angular/core';

import { Affix } from '../../model/content/affix';
import { EffectValueType } from '../../model/content/enum/effect-value-type';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { EquipableItemBase } from '../../model/content/enum/equipable-item-base';
import { Rarity } from '../../model/content/enum/rarity';
import { GameDataStat } from '../../model/content/game/data/game-data-stat';
import { GameAffix, GameEquippableItem, GameItem, GameRessourceItem } from '../../model/parser/game/game-item';
import { GameRarity } from '../../model/parser/game/game-rarity';
import { getCraftValue } from '../../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerAffixService {

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService : SlormancerTranslateService,
                private slormancerItemValueService : SlormancerItemValueService,
                private slormancerDataService: SlormancerDataService) { }

    public getEquipableItemBase(item: GameEquippableItem): EquipableItemBase {
        let slot: EquipableItemBase = EquipableItemBase.Helm;

        if (item !== null) {
            switch (item.slot) {
                case 0: slot = EquipableItemBase.Helm; break;
                case 1: slot = EquipableItemBase.Body; break;
                case 2: slot = EquipableItemBase.Shoulder; break;
                case 3: slot = EquipableItemBase.Bracer; break;
                case 4: slot = EquipableItemBase.Glove; break;
                case 5: slot = EquipableItemBase.Boot; break;
                case 6: slot = EquipableItemBase.Ring; break;
                case 7: slot = EquipableItemBase.Amulet; break;
                case 8: slot = EquipableItemBase.Belt; break;
                case 9: slot = EquipableItemBase.Cape; break;
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

    private buildAffix(stat: GameDataStat, itemLevel: number, reinforcment: number, rarity: Rarity, locked: boolean, pure: number, value: number): Affix {
        return {
            primaryNameType: '',
            rarity: rarity,
            itemLevel,
            reinforcment,
            locked,
            pure,
            isPure: false,

            craftedEffect: {
                score: 0,
                possibleCraftedValues: [],
                minPossibleCraftedValue: value,
                craftedValue: value,
                maxPossibleCraftedValue: value,

                effect: {
                    type: EffectValueType.Constant,
                    value: 0,
                    displayValue: 0,
                    percent: false,
                    valueType: EffectValueValueType.Stat,
                    stat: stat.REF
                },
            },

            valueLabel: '',
            statLabel: '',
        }
    }

    public getAffixFromStat(statName: string, itemLevel: number, reinforcment: number, rarity: Rarity): Affix | null {
        let result: Affix | null = null;

        const stat = this.slormancerDataService.getGameDataStatByRef(statName);
        if (stat !== null) {
            result = this.buildAffix(stat, itemLevel, reinforcment, rarity, false, 100, 1000);
        }

        return result;
    }
    
    public getAffix(affix: GameAffix, itemLevel: number, reinforcment: number): Affix | null {
        let result: Affix | null = null;

        const stat = this.slormancerDataService.getGameDataStat(affix);
        if (stat !== null) {
            result = this.buildAffix(
                stat,
                itemLevel,
                reinforcment,
                this.getRarity(affix.rarity),
                affix.locked, affix.pure === null || affix.pure === 0 ? 100 : affix.pure,
                affix.value
            );
        }

        return result;
    }

    public updateAffix(itemAffix: Affix) {

        const stat = this.slormancerDataService.getGameDataStatByRef(itemAffix.craftedEffect.effect.stat);

        itemAffix.craftedEffect.score = 0;
        itemAffix.craftedEffect.effect.percent = false;
        itemAffix.primaryNameType = '';
        if (stat !== null) {
            itemAffix.primaryNameType = stat.PRIMARY_NAME_TYPE;
            itemAffix.craftedEffect.score = stat.SCORE;
            itemAffix.craftedEffect.effect.percent = stat.PERCENT === '%';
        }

        itemAffix.isPure = itemAffix.pure > 100;

        if (itemAffix.isPure) {
            itemAffix.craftedEffect.craftedValue = itemAffix.craftedEffect.maxPossibleCraftedValue;
        }

        itemAffix.craftedEffect.possibleCraftedValues = this.slormancerItemValueService
            .getAffixValues(itemAffix.itemLevel, itemAffix.reinforcment, itemAffix.craftedEffect.score, itemAffix.craftedEffect.effect.percent, itemAffix.rarity, itemAffix.pure);
       
        const minValue = itemAffix.craftedEffect.possibleCraftedValues[0];
        const maxValue = itemAffix.craftedEffect.possibleCraftedValues[Math.max(0, itemAffix.craftedEffect.possibleCraftedValues.length - 1)];
        itemAffix.craftedEffect.minPossibleCraftedValue = minValue ? minValue.craft : itemAffix.craftedEffect.craftedValue;
        itemAffix.craftedEffect.maxPossibleCraftedValue = maxValue ? maxValue.craft : itemAffix.craftedEffect.craftedValue;

        if (itemAffix.craftedEffect.craftedValue < itemAffix.craftedEffect.minPossibleCraftedValue) {
            itemAffix.craftedEffect.craftedValue = itemAffix.craftedEffect.minPossibleCraftedValue;
        } else if (itemAffix.craftedEffect.craftedValue > itemAffix.craftedEffect.maxPossibleCraftedValue) {
            itemAffix.craftedEffect.craftedValue = itemAffix.craftedEffect.maxPossibleCraftedValue;
        } 

        itemAffix.craftedEffect.effect.value = getCraftValue(itemAffix.craftedEffect, itemAffix.craftedEffect.craftedValue);
        itemAffix.craftedEffect.effect.displayValue = itemAffix.craftedEffect.effect.value;


        itemAffix.valueLabel = this.slormancerTemplateService.formatItemAffixValue(itemAffix);
        itemAffix.statLabel = itemAffix.craftedEffect.effect.stat === null ? '' : this.slormancerTranslateService.translate(itemAffix.craftedEffect.effect.stat);
    }

    public getAffixClone(itemAffix: Affix): Affix {
        return {
            ...itemAffix,
            craftedEffect: {
                ...itemAffix.craftedEffect,
                effect: { ...itemAffix.craftedEffect.effect }
            }
        };
    }

}