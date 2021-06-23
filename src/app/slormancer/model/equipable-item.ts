import { Affix } from './affix';
import { AttributeEnchantment } from './attribute-enchantment';
import { EquipableItemType } from './enum/equipable-item-type';
import { Rarity } from './enum/rarity';
import { LegendaryEffect } from './legendary-effect';
import { ReaperEnchantment } from './reaper-enchantment';
import { SkillEnchantment } from './skill-enchantment';

export interface EquipableItem {
    type: EquipableItemType;
    name: string;
    rarity: Rarity;
    base: string;
    level: number;
    reinforcment: number;
    affixes: Array<Affix>;
    legendaryEffect: LegendaryEffect | null;
    reaperEnchantment: ReaperEnchantment | null;
    skillEnchantment: SkillEnchantment | null;
    attributeEnchantment: AttributeEnchantment | null;
}