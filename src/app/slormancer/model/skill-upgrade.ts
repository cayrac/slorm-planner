import { AbstractEffectValue } from './effect-value';
import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';
import { SkillType } from './skill-type';

export interface SkillUpgrade {
    id: number;
    skillId: number;
    type: SkillType.Passive | SkillType.Upgrade;
    upgradeLevel: number | null;
    rank: number;
    maxRank: number;
    baseRank: number;
    name: string;
    icon: string;
    description: string;
    baseCost: number;
    perLevelCost: number;
    cost: number;
    costType: SkillCostType;
    hasLifeCost: boolean;
    hasManaCost: boolean;
    hasNoCost: boolean;
    genres: Array<SkillGenre>;

    nextRankDescription: Array<string>;
    maxRankDescription: Array<string>;

    template: string;
    values: Array<AbstractEffectValue>;
}