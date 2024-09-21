import { Activable } from './activable';
import { AbstractEffectValue, EffectValueVariable } from './effect-value';
import { HeroClass } from './enum/hero-class';
import { ReaperSmith } from './enum/reaper-smith';
import { RuneType } from './rune-type';

export interface ActivationRune extends Rune {
    type: RuneType.Activation;
    baseConstraint: null;
    constraint: null;
}

export interface EffectRune extends Rune {
    type: RuneType.Effect;
    baseConstraint: number;
    constraint: number;
}

export interface EnhancementRune extends Rune {
    type: RuneType.Enhancement;
    baseConstraint: null;
    constraint: null;
}

export interface Rune {
    name: string;
    id: number;
    heroClass: HeroClass,
    level: number;
    reapersmith: ReaperSmith;
    reaper: number | null;
    enabled: boolean;
    type: RuneType;
    baseConstraint: null | number;
    constraint: null | number;

    template: string;
    values: Array<AbstractEffectValue>;
    duration: EffectValueVariable | null;

    activable: Activable | null;

    runeIcon: string;
    levelIcon: string;
    levelBorder: string;
    typeLabel: string;
    smithLabel: string;
    constraintLabel: string | null;
    description: string;
    flavor: string | null;
}