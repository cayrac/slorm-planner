import { EffectValueVariable } from '../effect-value';

export interface DataUltimatum {
    value: () => EffectValueVariable;
    extendedMalus: boolean;
}
