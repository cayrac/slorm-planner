import { ExtendedLegendaryEffectValue } from './extended-legendary-effect-value';

export interface ExtendedLegendaryData {
    statsOverride: Array<Partial<ExtendedLegendaryEffectValue>>;
    constants: Array<number>;
}

