import { AbstractEffectValue } from '../effect-value';

export interface DataSkill {
    masteryRequired: number | null;
    override: (values: Array<AbstractEffectValue>) => void;
    additionalClassMechanics: Array<number>;
};

