import { Activable } from './content/activable';
import { AncestralLegacy } from './content/ancestral-legacy';
import { AttributeTraits } from './content/attribut-traits';
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
}

export interface CharacterGear {
    helm: EquipableItem | null;
    body: EquipableItem | null;
    shoulder: EquipableItem | null;
    bracer: EquipableItem | null;
    glove: EquipableItem | null;
    boot: EquipableItem | null;
    ring_l: EquipableItem | null;
    ring_r: EquipableItem | null;
    amulet: EquipableItem | null;
    belt: EquipableItem | null;
    cape: EquipableItem | null;
}

export interface CharacterAttributes {
    0: AttributeTraits;
    1: AttributeTraits;
    2: AttributeTraits;
    3: AttributeTraits;
    4: AttributeTraits;
    5: AttributeTraits;
    6: AttributeTraits;
    7: AttributeTraits;
}

export interface Character {
    heroClass: HeroClass;
    level: number;

    name: string;
    fullName: string;

    reaper: Reaper | null;

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
}