import { MinMax } from '../minmax';

export interface CharacterStat {
    stat: string;
    total: number | MinMax;
    precision: number;
    values: {
        flat: Array<number>;
        percent: Array<number>;
        multiplier: Array<number>;
    }
};

export interface CharacterStats {
    hero: Array<CharacterStat>;
    support: Array<CharacterStat>;
    primary: Array<CharacterStat>;
    secondary: Array<CharacterStat>;
};