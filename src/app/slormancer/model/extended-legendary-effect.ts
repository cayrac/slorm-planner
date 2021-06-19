import { ExtendedLegendaryEffectValue } from './extended-legendary-effect-value';

export interface ExtendedLegendaryEffect {
    description: string;
    skill: number | null;
    icon: number | null;
    value: number;
    onlyStat: boolean;
    values: Array<ExtendedLegendaryEffectValue>;
    constants: Array<number>;
}