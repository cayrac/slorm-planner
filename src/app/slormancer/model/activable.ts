import { AbstractEffectValue } from './effect-value';
import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';

export interface Activable {
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
    values: Array<AbstractEffectValue>;
}