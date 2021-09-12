import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { Layer } from './layer';

export interface Planner {
    heroClass: HeroClass
    layers: Array<Layer>
}