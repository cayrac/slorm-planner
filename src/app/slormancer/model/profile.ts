import { HeroesData } from './heroes-data';

export interface Profile {
    unknown_value: number;
    profile: HeroesData<Array<number>>;
}