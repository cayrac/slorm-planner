import { AbstractEffectValue, EffectValueVariable } from './effect-value';
import { Attribute } from './enum/attribute';
import { TraitLevel } from './enum/trait-level';

export interface Trait {
    attribute: Attribute;
    requiredRank: number;
    traitLevel: TraitLevel;
    rank: number;
    unlocked: boolean;

    attributeName: string;
    cumulativeStats: string | null;
    description: string | null;
    rankLabel: string;
    traitLevelLabel: string;
    unlockLabel: string | null;
    
    template: string | null;
    values: Array<AbstractEffectValue>;
    cumulativeValues: Array<EffectValueVariable>;
}