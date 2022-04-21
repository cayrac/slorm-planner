import { AbstractEffectValue } from './effect-value';
import { MechanicType } from './enum/mechanic-type';
import { SkillGenre } from './enum/skill-genre';
import { SkillElement } from './skill-element';

export interface Mechanic {
    type: MechanicType;
    name: string;
    icon: string;
    description: string;
    genres: Array<SkillGenre>;
    element: SkillElement;

    template: string;
    values: Array<AbstractEffectValue>;
}