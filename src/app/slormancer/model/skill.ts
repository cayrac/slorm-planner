import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';
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
    genres: Array<SkillGenre>;
    values: Array<SkillValue>;
    constants: Array<number>;
}