import { AbstractEffectValue } from './effect-value';

export interface ReaperEffect {
    templates: Array<string>;
    effects: Array<AbstractEffectValue>;
}