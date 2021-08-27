import { AbstractEffectValue } from '../effect-value';

export interface DataAncestralLegacy {
    override?: (values: Array<AbstractEffectValue>) => void;
    links: Array<number>;
};

