import { HeroesData } from './heroes-data';

export interface StatsFetched {
    unknown_value: number;
    stats: HeroesData<Array<number>>
}