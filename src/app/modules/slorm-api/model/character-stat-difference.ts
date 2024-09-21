import { MinMax } from './minmax';

export interface CharacterStatDifference {
    name: string;
    left: number | MinMax;
    difference: number;
    right: number | MinMax;
}