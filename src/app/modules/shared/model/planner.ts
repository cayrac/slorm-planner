import { CharacterConfig } from '../../slormancer/model/character-config';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { Layer } from './layer';

export interface Planner {
    name: string;
    version: string;
    heroClass: HeroClass;
    layers: Array<Layer>;
    configuration: CharacterConfig;
}