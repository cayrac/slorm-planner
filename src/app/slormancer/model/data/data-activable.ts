import { AbstractEffectValue } from '../effect-value';

export interface DataActivable {
    override: (values: Array<AbstractEffectValue>) => void;
}
