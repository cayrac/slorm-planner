import { AncestralLegacyType } from './ancestral-legacy-type';
import { Buff } from './buff';
import { AbstractEffectValue } from './effect-value';
import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';
import { Mechanic } from './mechanic';
import { SkillElement } from './skill-element';

export interface AncestralLegacy {
    id: number;
    name: string;
    icon: string;
    description: string;
    types: Array<AncestralLegacyType>;
    element: SkillElement;
    damageTypes: Array<string>;
    sealMerge: number | null;
    cooldown: number | null;
    baseCooldown: number | null;
    auraBuff: Buff | null;
    genres: Array<SkillGenre>;
    cost: number | null;
    baseCost: number | null;
    costPerRank: number | null;
    currentRankCost: number | null;
    costType: SkillCostType;
    hasLifeCost: boolean;
    hasManaCost: boolean;
    hasNoCost: boolean;
    rank: number;
    baseRank: number;
    bonusRank: number;
    baseMaxRank: number;
    maxRank: number;
    realm: number;
    isActivable: boolean;

    relatedBuffs: Array<Buff>;
    relatedMechanics: Array<Mechanic>;

    typeLabel: string;
    genresLabel: string | null;
    costLabel: string | null;
    cooldownLabel: string | null;
    rankLabel: string;

    template: string;
    values: Array<AbstractEffectValue>;
}