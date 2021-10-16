import { AbstractEffectValue } from './effect-value';

export interface ClassMechanic {
    id: number;
    name: string;
    icon: string;
    description: string;

    template: string;
    values: Array<AbstractEffectValue>;
}