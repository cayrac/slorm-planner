import { AbstractEffectValue } from '../effect-value';
import { SkillGenre } from '../enum/skill-genre';

export interface DataClassMechanic {
    values?: Array<AbstractEffectValue>;
    genres?: Array<SkillGenre>;
    templateOverride?: (template: string) => string;
}