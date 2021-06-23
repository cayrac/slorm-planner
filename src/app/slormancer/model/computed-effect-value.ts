import { MinMax } from './minmax';

export interface ComputedEffectValue {
    value: number;
    baseValue: number,
    range: { [ key: number]: number } | null;
    baseRange: { [ key: number]: number } | null;
    upgrade: number;
    percent: boolean;
    synergy: number | MinMax | null; 
}