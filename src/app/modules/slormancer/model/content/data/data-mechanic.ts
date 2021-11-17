import { AbstractEffectValue } from '../effect-value';
import { SkillGenre } from '../enum/skill-genre';

export interface DataMechanic {
    values: Array<AbstractEffectValue>;
    genres?: Array<SkillGenre>;
}
