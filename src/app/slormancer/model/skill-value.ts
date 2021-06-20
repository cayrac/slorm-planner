import { MinMax } from './minmax';

export interface SkillValue {
    baseValue: number | null;
    type: string | null;
    valueReal: string | null;
    computedValue: number | MinMax | null;
}