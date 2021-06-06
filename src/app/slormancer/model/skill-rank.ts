import { HeroesData } from './heroes-data';

export interface SkillRank {
    unknown_value: number;
    skills: HeroesData<Array<number>>
}