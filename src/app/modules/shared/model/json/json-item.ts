import { EquipableItemBase } from '@slorm-api';

export interface JsonItem {
    base: EquipableItemBase | null;
    level: number;
    reinforcement: number;
    grafts: number;
    affixes: Array<{ rarity: number; pure: number; stat: number; craftedValue: number; }>;
    legendaryEffect: { id: number; craftedValue: number } | null;
    reaperEnchantment: { reaperSmith: number; craftedValue: number } | null;
    skillEnchantment: { skill: number; craftedValue: number } | null;
    attributeEnchantment: { attribute: number; craftedValue: number } | null;
}
