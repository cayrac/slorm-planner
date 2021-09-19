import { EffectValueSynergy } from './effect-value';

export interface ExtractedCharacterStat {
    stat: string;
    values: Array<number>;
}

export interface ExtractedCharacterStats {
    stats: Array<ExtractedCharacterStat>;
    synergies: Array<EffectValueSynergy>;
}