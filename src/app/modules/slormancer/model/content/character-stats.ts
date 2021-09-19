import { MinMax } from '../minmax';

export enum CharacterStatType {
    Seconds = 's',
    Percent = '%',
    None = ''
}

export interface CharacterStat {
    section: string;
    stat: string;
    total: number | MinMax;
    type: CharacterStatType;
    precision: number;
    sign: boolean;
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