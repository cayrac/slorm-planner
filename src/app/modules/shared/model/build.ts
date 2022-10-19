import { CharacterConfig, HeroClass } from 'slormancer-api';

import { Layer } from './layer';

export interface Build {
    name: string;
    version: string;
    heroClass: HeroClass;
    layers: Array<Layer>;
    configuration: CharacterConfig;
}