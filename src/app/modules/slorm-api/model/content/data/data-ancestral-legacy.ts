import { AncestralLegacy } from '../ancestral-legacy';
import { AbstractEffectValue } from '../effect-value';
import { MechanicType } from '../enum/mechanic-type';

export interface DataAncestralLegacy {
    override?: (values: Array<AbstractEffectValue>, ancestralLegacy: AncestralLegacy) => void;
    additionalMechanics?: Array<MechanicType>
    additionalBuffs?: Array<string>
};

