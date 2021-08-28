import { AbstractEffectValue } from './effect-value';
import { Attribute } from './enum/attribute';
import { TraitLevel } from './enum/trait-level';

export interface Trait {
    id: number;
    attribute: Attribute;
    additive: number | null;
    requiredRank: number;
    traitLevel: TraitLevel;
    rank: number;

    attributeName: string;
    description: string;
    rankLabel: string;
    traitLevelLabel: string;
    unlockLabel: string | null;
    
    template: string;
    values: Array<AbstractEffectValue>;
}