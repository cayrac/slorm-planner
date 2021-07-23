import { AbstractEffectValue } from './effect-value';
import { Skill } from './skill';

export interface ReaperEffect {
    template: string;
    values: Array<AbstractEffectValue>;
    skills: Array<Skill>;
}