import { AbstractEffectValue } from './effect-value';
import { SkillGenre } from './enum/skill-genre';

export interface ClassMechanic {
    id: number;
    name: string;
    icon: string;
    description: string;
    genres: Array<SkillGenre>;

    template: string;
    values: Array<AbstractEffectValue>;
}