import { AncestralLegacyElement } from './ancestral-legacy-element';
import { AncestralLegacyType } from './ancestral-legacy-type';
import { Buff } from './buff';
import { AbstractEffectValue } from './effect-value';
import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';
import { Mechanic } from './mechanic';

export interface AncestralLegacy {
    id: number;
    name: string;
    icon: string;
    description: string;
    types: Array<AncestralLegacyType>;
    element: AncestralLegacyElement;
    damageTypes: Array<string>;
    sealMerge: number | null;
    cooldown: number | null;
    baseCooldown: number | null;
    auraBuff: Buff | null;
    genres: Array<SkillGenre>;
    cost: number | null;
    baseCost: number | null;
    costPerRank: number | null;
    costType: SkillCostType;
    hasLifeCost: boolean;
    hasManaCost: boolean;
    hasNoCost: boolean;
    rank: number;
    baseRank: number;
    bonusRank: number;
    maxRank: number;
    realm: number;

    relatedBuffs: Array<Buff>;
    relatedMechanics: Array<Mechanic>;

    nextRankDescription: Array<string>;
    maxRankDescription: Array<string>;

    template: string;
    values: Array<AbstractEffectValue>;
}