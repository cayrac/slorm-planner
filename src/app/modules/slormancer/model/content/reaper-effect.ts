import { AbstractEffectValue } from './effect-value';

export interface ReaperEffect {
    template: string | null;
    values: Array<AbstractEffectValue>;
}