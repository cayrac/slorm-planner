import { MergedStatMapping } from '../../constants/content/data/data-character-stats-mapping';
import { MinMax } from '../minmax';
import { Activable } from './activable';
import { AncestralLegacy } from './ancestral-legacy';
import { AttributeTraits } from './attribut-traits';
import { EffectValueSynergy } from './effect-value';
import { EquipableItem } from './equipable-item';
import { Reaper } from './reaper';
import { Skill } from './skill';
import { SkillUpgrade } from './skill-upgrade';

export enum ResolveDataType {
    Synergy = 0,
    ExternalSynergy = 1,
}

export interface SynergyResolveDataSource {
    skill?: Skill;
    upgrade?: SkillUpgrade;
    item?: EquipableItem;
    ancestralLegacy?: AncestralLegacy;
    attribute?: AttributeTraits;
    reaper?: Reaper;
    activable?: Activable;
};

export interface SynergyResolveData {
    type: ResolveDataType.Synergy;
    effect: EffectValueSynergy;
    originalValue: number | MinMax;
    objectSource: SynergyResolveDataSource;
    statsItWillUpdate: Array<{ stat: string, mapping?: MergedStatMapping }>;
}
export interface ExternalSynergyResolveData {
    type: ResolveDataType.ExternalSynergy;
    stat: string;
    sources: Array<string>;
    value: number | MinMax;
    method: ((...values: Array<number | MinMax>) => number | MinMax);
    statsItWillUpdate: Array<{ stat: string, mapping?: MergedStatMapping }>;
}

export interface MergedStat<T = number | MinMax> {
    stat: string;
    total: T;
    allowMinMax: boolean;
    precision: number;
    values: {
        flat: Array<number | MinMax>;
        max: Array<number>;
        percent: Array<number>;
        maxPercent: Array<number>;
        multiplier: Array<number>;
    }
};