import { AbstractEffectValue } from './effect-value';

export interface ReaperEffect {
    template: string;
    values: Array<AbstractEffectValue>;
}