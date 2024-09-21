import { Buff } from './buff';
import { ClassMechanic } from './class-mechanic';
import { AbstractEffectValue } from './effect-value';
import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';
import { Mechanic } from './mechanic';
import { SkillType } from './skill-type';

export interface SkillUpgrade {
    id: number;
    order: number;
    skillId: number | null;
    masteryRequired: number;
    line: number;
    type: SkillType.Passive | SkillType.Upgrade;
    upgradeLevel: number | null;
    rank: number;
    maxRank: number;
    baseRank: number;
    name: string;
    icon: string;
    description: string;
    initialCost: number | null;
    perLevelCost: number | null;
    baseCost: number | null;
    cost: number | null;
    costType: SkillCostType;
    hasLifeCost: boolean;
    hasManaCost: boolean;
    hasNoCost: boolean;
    genres: Array<SkillGenre>;
    damageTypes: Array<string>;
    slormTier: string;
    upgradeSlormCost: number | null;
    investedSlorm: number;
    totalSlormCost: number;

    relatedClassMechanics: Array<ClassMechanic>;
    relatedMechanics: Array<Mechanic>;
    relatedBuffs: Array<Buff>;

    masteryLabel: string | null;
    rankLabel: string | null;
    genresLabel: string | null;
    costLabel: string | null;

    template: string;
    values: Array<AbstractEffectValue>;
}