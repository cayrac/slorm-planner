import { LegendaryEffectValue } from '../legendary-effect-value';

export interface DataLegendary {
    statsOverride: Array<Partial<LegendaryEffectValue>>;
    constants: Array<number>;
}

