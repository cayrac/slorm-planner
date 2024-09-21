import { MergedStatMapping } from '../../constants/content/data/data-character-stats-mapping';
import { Entity } from '../entity';
import { MinMax } from '../minmax';
import { EffectValueSynergy } from './effect-value';

export enum ResolveDataType {
    Synergy = 0,
    ExternalSynergy = 1,
}

export interface SynergyResolveData {
    type: ResolveDataType.Synergy;
    effect: EffectValueSynergy;
    originalValue: number | MinMax;
    objectSource: Entity;
    statsItWillUpdate: Array<{ stat: string, mapping?: MergedStatMapping }>;
    cascadeSynergy: boolean;
    addAsFlat: boolean;
}
export interface ExternalSynergyResolveData {
    type: ResolveDataType.ExternalSynergy;
    stat: string;
    sources: Array<string>;
    value: number | MinMax;
    objectSource: Entity;
    precision: number | null;
    method: ((...values: Array<number | MinMax>) => number | MinMax);
    statsItWillUpdate: Array<{ stat: string, mapping?: MergedStatMapping }>;
    cascadeSynergy: boolean;
}

export interface MergedStatValue<T = number | MinMax> {
    value: T;
    extra: boolean;
    source: Entity;
    synergy: boolean;
}

export interface MergedStat<T = number | MinMax> {
    stat: string;
    total: T;
    totalWithoutSynergy: T;
    totalDisplayed: T;
    allowMinMax: boolean;
    readonly: boolean;
    precision: number;
    displayPrecision?: number;
    suffix: 's' | '%' | '';
    maximum?: number;
    values: {
        flat: Array<MergedStatValue<T>>;
        max: Array<MergedStatValue<number>>;
        percent: Array<MergedStatValue<number>>;
        maxPercent: Array<MergedStatValue<number>>;
        multiplier: Array<MergedStatValue<number>>;
        maxMultiplier: Array<MergedStatValue<number>>;
    }
};