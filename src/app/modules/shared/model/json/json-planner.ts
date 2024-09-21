import { CharacterConfig, HeroClass } from '@slorm-api';

import { JsonLayer } from './json-layer';

export interface JsonPlanner {
    type: 'p';
    version: string;
    name: string;
    heroClass: HeroClass;
    layers: Array<JsonLayer>;
    configuration: CharacterConfig;
}