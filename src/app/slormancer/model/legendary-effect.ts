import { Activable } from './activable';
import { AbstractEffectValue } from './effect-value';

export interface LegendaryEffect {
    description: string;
    activable: Activable | null;
    icon: string | null;
    value: number;
    onlyStat: boolean;
    values: Array<AbstractEffectValue>;
}