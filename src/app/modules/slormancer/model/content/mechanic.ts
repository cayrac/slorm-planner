import { AbstractEffectValue } from './effect-value';
import { MechanicType } from './enum/mechanic-type';
import { SkillGenre } from './enum/skill-genre';

export interface Mechanic {
    type: MechanicType;
    name: string;
    icon: string;
    description: string;
    genres: Array<SkillGenre>;

    template: string;
    values: Array<AbstractEffectValue>;
}