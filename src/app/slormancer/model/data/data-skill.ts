import { AbstractEffectValue } from '../effect-value';

export interface DataSkill {
    override: (values: Array<AbstractEffectValue>) => void
};

