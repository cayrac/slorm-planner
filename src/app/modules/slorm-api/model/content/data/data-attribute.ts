import { Trait } from '../trait';

export interface DataAttribute {
    override: (effect: Trait) => void;
}

