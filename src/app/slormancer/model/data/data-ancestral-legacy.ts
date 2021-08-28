import { AbstractEffectValue } from '../effect-value';
import { MechanicType } from '../enum/mechanic-type';

export interface DataAncestralLegacy {
    override?: (values: Array<AbstractEffectValue>) => void;
    links: Array<number>;
    additionalMechanics?: Array<MechanicType.InnerFire>
};

