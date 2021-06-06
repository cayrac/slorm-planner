import { HeroesData } from './heroes-data';

export interface Missions {
    unknown_value: number;
    missions: HeroesData<Array<number>>
}