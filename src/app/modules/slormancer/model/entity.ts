import { Character } from './character';
import { Activable } from './content/activable';
import { AncestralLegacy } from './content/ancestral-legacy';
import { AttributeTraits } from './content/attribut-traits';
import { ClassMechanic } from './content/class-mechanic';
import { EquipableItem } from './content/equipable-item';
import { Mechanic } from './content/mechanic';
import { Reaper } from './content/reaper';
import { Skill } from './content/skill';
import { SkillUpgrade } from './content/skill-upgrade';

export declare type Entity =
    { synergy: string } |
    { character: Character } |
    { skill: Skill } |
    { upgrade: SkillUpgrade } |
    { item: EquipableItem } |
    { ancestralLegacy: AncestralLegacy } |
    { attribute: AttributeTraits } |
    { reaper: Reaper } |
    { activable: Activable } |
    { mechanic: Mechanic } |
    { classMechanic: ClassMechanic };