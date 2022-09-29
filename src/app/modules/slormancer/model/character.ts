import { Activable } from './content/activable';
import { AncestralLegacy } from './content/ancestral-legacy';
import { AttributeTraits } from './content/attribut-traits';
import { MergedStat } from './content/character-stats';
import { ClassMechanic } from './content/class-mechanic';
import { Attribute } from './content/enum/attribute';
import { GearSlot } from './content/enum/gear-slot';
import { HeroClass } from './content/enum/hero-class';
import { UltimatumType } from './content/enum/ultimatum-type';
import { EquipableItem } from './content/equipable-item';
import { Mechanic } from './content/mechanic';
import { Reaper } from './content/reaper';
import { Skill } from './content/skill';
import { SkillUpgrade } from './content/skill-upgrade';
import { Ultimatum } from './content/ultimatum';
import { RunesCombination } from './runes-combination';

export interface CharacterSkillAndUpgrades {
    skill: Skill;
    upgrades: Array<SkillUpgrade>;
    selectedUpgrades: Array<number>;

    stats: Array<MergedStat>;
}

export interface CharacterAncestralLegacies {
    ancestralLegacies: Array<AncestralLegacy>;
    activeNodes: Array<number>;
    activeAncestralLegacies: Array<number>;
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

export interface CharacterUltimatum {
    level: number;
    activeUltimatum: UltimatumType;
}

export interface Character {
    heroClass: HeroClass;
    level: number;
    version: string;
    originalVersion: string;
    importVersion: string | null;

    name: string;
    fullName: string;

    reaper: Reaper;

    runes: RunesCombination;

    ancestralLegacies: CharacterAncestralLegacies;
    skills: Array<CharacterSkillAndUpgrades>;

    gear: CharacterGear;
    inventory: Array<EquipableItem | null>;
    sharedInventory: Array<Array<EquipableItem | null>>;

    ultimatum: Ultimatum | null;

    attributes: CharacterAttributes;

    primarySkill: Skill | null;
    secondarySkill: Skill | null;
    supportSkill: Skill | null;
    activable1: Activable | AncestralLegacy | null;
    activable2: Activable | AncestralLegacy | null;
    activable3: Activable | AncestralLegacy | null;
    activable4: Activable | AncestralLegacy | null;

    baseStats: Array<{ stat: string, values: Array<number>}>;

    mechanics: Array<Mechanic>;
    classMechanics: Array<ClassMechanic>;

    stats: Array<MergedStat>;
}