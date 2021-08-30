import { Activable } from './activable';
import { AbstractEffectValue } from './effect-value';

export interface LegendaryEffect {
    id: number;
    name: string;
    reinforcment: number;
    itemIcon: string;
    activable: Activable | null;
    skillIcon: string | null;
    value: number;
    onlyStat: boolean;
    values: Array<AbstractEffectValue>;

    title: string;
    description: string;

    template: string;
}