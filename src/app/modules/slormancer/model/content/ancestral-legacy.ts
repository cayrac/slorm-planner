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
    nextRankCost: number | null;
    maxRankCost: number | null;
    baseCost: number | null;
    costPerRank: number | null;
    costType: SkillCostType;
    hasLifeCost: boolean;
    hasManaCost: boolean;
    hasNoCost: boolean;
    rank: number;
    nextRank: number;
    baseRank: number;
    bonusRank: number;
    baseMaxRank: number;
    maxRank: number;
    realm: number;
    isActivable: boolean;

    relatedBuffs: Array<Buff>;
    relatedMechanics: Array<Mechanic>;

    nextRankDescription: Array<string>;
    maxRankDescription: Array<string>;

    typeLabel: string;
    genresLabel: string | null;
    costLabel: string | null;
    cooldownLabel: string | null;
    rankLabel: string;

    template: string;
    values: Array<AbstractEffectValue>;
    nextRankValues: Array<AbstractEffectValue>;
    maxRankValues: Array<AbstractEffectValue>;
}