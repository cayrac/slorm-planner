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
}
export interface ExternalSynergyResolveData {
    type: ResolveDataType.ExternalSynergy;
    stat: string;
    sources: Array<string>;
    value: number | MinMax;
    objectSource: Entity;
    method: ((...values: Array<number | MinMax>) => number | MinMax);
    statsItWillUpdate: Array<{ stat: string, mapping?: MergedStatMapping }>;
}

export interface MergedStat<T = number | MinMax> {
    stat: string;
    total: T;
    allowMinMax: boolean;
    readonly: boolean;
    precision: number;
    suffix: 's' | '%' | '';
    values: {
        flat: Array<{ value: number | MinMax, extra: boolean, source: Entity }>;
        max: Array<{ value: number, extra: boolean, source: Entity }>;
        percent: Array<{ value: number, extra: boolean, source: Entity }>;
        maxPercent: Array<{ value: number, extra: boolean, source: Entity }>;
        multiplier: Array<{ value: number, extra: boolean, source: Entity }>;
        maxMultiplier: Array<{ value: number, extra: boolean, source: Entity }>;
    }
};