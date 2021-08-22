import { Buff } from './buff';
import { AbstractEffectValue } from './effect-value';
import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';
import { Mechanic } from './mechanic';
import { SkillClassMechanic } from './skill-class-mechanic';
import { SkillType } from './skill-type';

export interface SkillUpgrade {
    id: number;
    skillId: number;
    masteryRequired: number | null;
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

    relatedClassMechanics: Array<SkillClassMechanic>;
    relatedMechanics: Array<Mechanic>;
    relatedBuffs: Array<Buff>;

    template: string;
    values: Array<AbstractEffectValue>;
}