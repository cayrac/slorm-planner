import { Affix } from './affix';
import { AttributeEnchantment } from './attribute-enchantment';
import { EquippableItemBase } from './enum/equippable-item-base';
import { HeroClass } from './enum/hero-class';
import { Rarity } from './enum/rarity';
import { LegendaryEffect } from './legendary-effect';
import { ReaperEnchantment } from './reaper-enchantment';
import { SkillEnchantment } from './skill-enchantment';

export interface EquipableItem {
    base: EquippableItemBase;
    rarity: Rarity;
    level: number;
    reinforcment: number;
    affixes: Array<Affix>;
    legendaryEffect: LegendaryEffect | null;
    reaperEnchantment: ReaperEnchantment | null;
    skillEnchantment: SkillEnchantment | null;
    attributeEnchantment: AttributeEnchantment | null;
    heroClass: HeroClass;

    name: string;
    baseLabel: string;
    rarityLabel: string;
    levelLabel: string;
    icon: string;
    itemIconBackground: string
}