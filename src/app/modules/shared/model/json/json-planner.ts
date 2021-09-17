import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { JsonLayer } from './json-layer';

export interface JsonPlanner {
    type: 'p';
    cl: HeroClass;
    la: Array<JsonLayer>;
}