import { AbstractEffectValue } from './effect-value';

export interface SkillEffect {
    template: string | null;
    values: Array<AbstractEffectValue>;
}