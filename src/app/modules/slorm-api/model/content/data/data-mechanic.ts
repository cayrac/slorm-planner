import { AbstractEffectValue } from '../effect-value';
import { SkillGenre } from '../enum/skill-genre';
import { SkillElement } from '../skill-element';

export interface DataMechanic {
    values: Array<AbstractEffectValue>;
    genres?: Array<SkillGenre>;
    element?: SkillElement;
    template?: (template: string) => string;
}
