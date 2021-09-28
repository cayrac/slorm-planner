import { Activable } from './content/activable';
import { AncestralLegacy } from './content/ancestral-legacy';
import { AttributeTraits } from './content/attribut-traits';
import { CharacterStats } from './content/character-stats';
import { Attribute } from './content/enum/attribute';
import { GearSlot } from './content/enum/gear-slot';
import { HeroClass } from './content/enum/hero-class';
import { EquipableItem } from './content/equipable-item';
import { Reaper } from './content/reaper';
import { Skill } from './content/skill';
import { SkillUpgrade } from './content/skill-upgrade';

export interface CharacterSkillAndUpgrades {
    skill: Skill;
    upgrades: Array<SkillUpgrade>;
    selectedUpgrades: Array<number>;
}

export interface CharacterAncestralLegacies {
    ancestralLegacies: Array<AncestralLegacy>;
    activeNodes: Array<number>;
    activeAncestralLegacies: Array<number>;
    maxAncestralLegacy: number;
}

export interface CharacterGear {
    [GearSlot.Helm]: EquipableItem | null;
    [GearSlot.Body]: EquipableItem | null;
    [GearSlot.Shoulder]: EquipableItem | null;
    [GearSlot.Bracer]: EquipableItem | null;
    [GearSlot.Glove]: EquipableItem | null;
    [GearSlot.Boot]: EquipableItem | null;
    [GearSlot.LeftRing]: EquipableItem | null;
    [GearSlot.RightRing]: EquipableItem | null;
    [GearSlot.Amulet]: EquipableItem | null;
    [GearSlot.Belt]: EquipableItem | null;
    [GearSlot.Cape]: EquipableItem | null;
}

export interface CharacterAttributes {
    remainingPoints: number;
    maxPoints: number;
    allocated: {
        [Attribute.Toughness]: AttributeTraits;
        [Attribute.Savagery]: AttributeTraits;
        [Attribute.Fury]: AttributeTraits;
        [Attribute.Determination]: AttributeTraits;
        [Attribute.Zeal]: AttributeTraits;
        [Attribute.Willpower]: AttributeTraits;
        [Attribute.Dexterity]: AttributeTraits;
        [Attribute.Bravery]: AttributeTraits;
    }
}

export interface Character {
    heroClass: HeroClass;
    level: number;
    version: string;

    name: string;
    fullName: string;

    reaper: Reaper;

    ancestralLegacies: CharacterAncestralLegacies;
    skills: Array<CharacterSkillAndUpgrades>;

    gear: CharacterGear;
    inventory: Array<EquipableItem | null>;
    sharedInventory: Array<Array<EquipableItem | null>>;

    attributes: CharacterAttributes;

    primarySkill: Skill | null;
    secondarySkill: Skill | null;
    supportSkill: Skill | null;
    activable1: Activable | AncestralLegacy | null;
    activable2: Activable | AncestralLegacy | null;
    activable3: Activable | AncestralLegacy | null;
    activable4: Activable | AncestralLegacy | null;

    baseStats: Array<{ stat: string, values: Array<number>}>;

    stats: CharacterStats | null;
}