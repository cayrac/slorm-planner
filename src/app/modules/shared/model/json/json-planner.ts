import { CharacterConfig } from '../../../slormancer/model/character-config';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { JsonLayer } from './json-layer';

export interface JsonPlanner {
    type: 'p';
    version: string;
    heroClass: HeroClass;
    layers: Array<JsonLayer>;
    configuration: CharacterConfig;
}