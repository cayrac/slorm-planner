import { AbstractEffectValue } from './effect-value';
import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';
import { SkillType } from './skill-type';

export interface Skill {
    id: number;
    type: SkillType.Active | SkillType.Support;
    unlockLevel: number | null;
    level: number;
    maxLevel: number;
    baseLevel: number;
    bonusLevel: number;
    name: string;
    icon: string;
    iconLarge: string;
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
    genres: Array<SkillGenre>;
    damageTypes: Array<string>;

    genresLabel: string | null;
    costLabel: string | null;
    cooldownLabel: string | null;

    template: string;
    values: Array<AbstractEffectValue>;
}