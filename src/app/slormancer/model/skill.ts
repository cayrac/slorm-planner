import { SkillCostType } from './enum/skill-cost-type';
import { SkillValue } from './skill-value';

export interface Skill {
    name: string;
    icon: string;
    description: string;
    baseCooldown: number;
    cooldown: number;
    baseCost: number;
    cost: number;
    costType: SkillCostType;
    damageTypes: Array<string>;
    genres: Array<string>;
    values: Array<SkillValue>;
    constants: Array<number>;
}