import { AbstractEffectValue } from './effect-value';
import { HeroClass } from './enum/hero-class';
import { SkillCostType } from './enum/skill-cost-type';
import { SkillGenre } from './enum/skill-genre';

export interface Activable {
    id: number;
    name: string;
    icon: string;
    baseCooldown: number | null;
    cooldown: number;
    baseCost: number;
    cost: number;
    costType: SkillCostType;
    hasLifeCost: boolean;
    hasManaCost: boolean;
    hasNoCost: boolean;
    genres: Array<SkillGenre>;
    damageTypes: Array<string>;
    level: number;
    heroClass: HeroClass;

    description: string;
    genresLabel: string | null;
    costLabel: string | null;
    cooldownLabel: string | null;

    template: string;
    values: Array<AbstractEffectValue>;
}