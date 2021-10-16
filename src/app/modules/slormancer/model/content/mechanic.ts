import { AbstractEffectValue } from './effect-value';
import { MechanicType } from './enum/mechanic-type';

export interface Mechanic {
    type: MechanicType;
    name: string;
    icon: string;
    description: string;

    template: string;
    values: Array<AbstractEffectValue>;
}