import { CharacterStatMapping } from '../../constants/content/data/data-character-stats-mapping';
import { MinMax } from '../minmax';
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
};

export interface SynergyResolveData {
    type: ResolveDataType.Synergy;
    effect: EffectValueSynergy;
    originalValue: number | MinMax;
    objectSource: SynergyResolveDataSource;
    statsItWillUpdate: Array<{ stat: string, mapping?: CharacterStatMapping }>;
}
export interface ExternalSynergyResolveData {
    type: ResolveDataType.ExternalSynergy;
    stat: string;
    sources: Array<string>;
    value: number | MinMax;
    method: ((...values: Array<number | MinMax>) => number | MinMax);
    statsItWillUpdate: Array<{ stat: string, mapping?: CharacterStatMapping }>;
}

export interface CharacterStat {
    stat: string;
    total: number | MinMax;
    allowMinMax: boolean;
    precision: number;
    values: {
        flat: Array<number | MinMax>;
        max: Array<number>;
        percent: Array<number>;
        multiplier: Array<number>;
    }
};

export interface CharacterStats {
    hero: Array<CharacterStat>;
    support: Array<CharacterStat>;
    primary: Array<CharacterStat>;
    secondary: Array<CharacterStat>;
};