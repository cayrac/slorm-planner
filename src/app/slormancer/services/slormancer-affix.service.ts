import { Injectable } from '@angular/core';

import { Affix } from '../model/affix';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { EquippableItemBase } from '../model/enum/equippable-item-base';
import { Rarity } from '../model/enum/rarity';
import { GameAffix, GameEquippableItem, GameItem, GameRessourceItem } from '../model/game/game-item';
import { GameRarity } from '../model/game/game-rarity';
import { valueOrDefault } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerCraftedValueService {

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerItemValueService : SlormancerItemValueService,
                private slormancerDataService: SlormancerDataService) { }

    public getEquipableItemBase(item: GameEquippableItem): EquippableItemBase {
        let slot: EquippableItemBase = EquippableItemBase.Helm;

        if (item !== null) {
            switch (item.slot) {
                case 0: slot = EquippableItemBase.Helm; break;
                case 1: slot = EquippableItemBase.Armor; break;
                case 2: slot = EquippableItemBase.Shoulder; break;
                case 3: slot = EquippableItemBase.Bracer; break;
                case 4: slot = EquippableItemBase.Glove; break;
                case 5: slot = EquippableItemBase.Boot; break;
                case 6: slot = EquippableItemBase.Ring; break;
                case 7: slot = EquippableItemBase.Amulet; break;
                case 8: slot = EquippableItemBase.Belt; break;
                case 9: slot = EquippableItemBase.Cape; break;
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

    public getAffix(affix: GameAffix, itemLevel: number, reinforcment: number): Affix | null {
        let result: Affix | null = null;

        const stat = this.slormancerDataService.getGameDataStat(affix);
        if (stat !== null) {
            result = {
                primaryNameType: stat.PRIMARY_NAME_TYPE,
                rarity: this.getRarity(affix.rarity),
                itemLevel,
                reinforcment,
                locked: affix.locked,
                pure: affix.pure === null || affix.pure === 0 ? 100 : affix.pure,
                isPure: false,

                craftedEffect: {
                    score: stat.SCORE,
                    possibleCraftedValues: { [affix.value] : 0 },
                    minPossibleCraftedValue: affix.value,
                    craftedValue: affix.value,
                    maxPossibleCraftedValue: affix.value,

                    effect: {
                        type: EffectValueType.Constant,
                        value: 0,
                        percent: stat.PERCENT === '%',
                        valueType: EffectValueValueType.Stat,
                        stat: stat.REF
                    },
                },

                valueLabel: '',
                statLabel: '',
            }
        }

        return result;
    }

    public updateAffix(itemAffix: Affix) {
        itemAffix.isPure = itemAffix.pure > 100;
        itemAffix.craftedEffect.possibleCraftedValues = this.slormancerItemValueService
            .getAffixValues(itemAffix.itemLevel, itemAffix.reinforcment, itemAffix.craftedEffect.score, itemAffix.craftedEffect.effect.percent, itemAffix.rarity, itemAffix.pure);
       
        const keys = Object.keys(itemAffix.craftedEffect.possibleCraftedValues).map(k => parseInt(k));
        const minValue = keys[0];
        const maxValue = keys[keys.length - 1];
        itemAffix.craftedEffect.minPossibleCraftedValue = minValue ? minValue : itemAffix.craftedEffect.craftedValue;
        itemAffix.craftedEffect.maxPossibleCraftedValue = maxValue ? maxValue : itemAffix.craftedEffect.craftedValue;
        itemAffix.craftedEffect.effect.value = valueOrDefault(itemAffix.craftedEffect.possibleCraftedValues[itemAffix.craftedEffect.craftedValue], 0);

        itemAffix.valueLabel = this.slormancerTemplateService.formatItemAffixValue(itemAffix);
        itemAffix.statLabel = itemAffix.craftedEffect.effect.stat === null ? '' : this.slormancerTemplateService.translate(itemAffix.craftedEffect.effect.stat);
    }

}