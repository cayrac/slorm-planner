import { Affix } from './affix';
import { AttributeEnchantment } from './attribute-enchantment';
import { EquipableItemBase } from './enum/equipable-item-base';
import { HeroClass } from './enum/hero-class';
import { Rarity } from './enum/rarity';
import { LegendaryEffect } from './legendary-effect';
import { ReaperEnchantment } from './reaper-enchantment';
import { SkillEnchantment } from './skill-enchantment';

export interface EquipableItem {
    base: EquipableItemBase;
    rarity: Rarity;
    level: number;
    reinforcement: number;
    grafts: number;
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
    graftLabel: string | null;
    icon: string;
    itemIconBackground: string
}