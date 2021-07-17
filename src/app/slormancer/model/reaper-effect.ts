import { AbstractEffectValue } from './effect-value';

export interface ReaperEffect {
    template: string;
    effects: Array<AbstractEffectValue>;
}