import { EquipableItemType as EquipableItemType } from '../constants/equipable-item-type';
import { ItemRarity } from '../constants/item-rarity';
import { ExtendedAffix } from './extended-affix';
import { ExtendedLegendaryEffect } from './extended-legendary-effect';

export interface ExtendedEquipableItem {
    type: EquipableItemType;
    name: string;
    rarity: ItemRarity;
    base: string;
    level: number;
    reinforcment: number;
    affixes: Array<ExtendedAffix>
    legendaryEffect: ExtendedLegendaryEffect | null
}