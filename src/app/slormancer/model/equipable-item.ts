import { Affix } from './affix';
import { EquipableItemType } from './enum/equipable-item-type';
import { Rarity } from './enum/rarity';
import { LegendaryEffect } from './legendary-effect';

export interface EquipableItem {
    type: EquipableItemType;
    name: string;
    rarity: Rarity;
    base: string;
    level: number;
    reinforcment: number;
    affixes: Array<Affix>
    legendaryEffect: LegendaryEffect | null
}