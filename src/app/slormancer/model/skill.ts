import { AbstractEffectValue } from './effect-value';
import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';

export interface Skill {
    id: number;
    level: number;
    maxLevel: number;
    baseLevel: number;
    bonusLevel: number;
    name: string;
    icon: string;
    description: string;
    baseCooldown: number;
    cooldown: number;
    baseCost: number;
    perLevelCost: number;
    cost: number;
    costType: SkillCostType;
    hasLifeCost: boolean;
    hasManaCost: boolean;
    hasNoCost: boolean;
    damageTypes: Array<string>;
    genres: Array<SkillGenre>;

    template: string;
    values: Array<AbstractEffectValue>;
}