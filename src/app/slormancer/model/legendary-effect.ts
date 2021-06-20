import { LegendaryEffectValue } from './legendary-effect-value';

export interface LegendaryEffect {
    description: string;
    activable: number | null;
    icon: string | null;
    value: number;
    onlyStat: boolean;
    values: Array<LegendaryEffectValue>;
    constants: Array<number>;
}