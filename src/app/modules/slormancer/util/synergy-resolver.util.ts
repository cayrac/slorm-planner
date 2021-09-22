import { CharacterStatMapping } from '../constants/content/data/data-character-stats-mapping';
import {
    ExternalSynergyResolveData,
    ResolveDataType,
    SynergyResolveData,
    SynergyResolveDataSource,
} from '../model/content/character-stats';
import { EffectValueSynergy } from '../model/content/effect-value';
import { MinMax } from '../model/minmax';

export function isSynergyResolveData(resolveData: SynergyResolveData | ExternalSynergyResolveData): resolveData is SynergyResolveData {
    return resolveData.type === ResolveDataType.Synergy
}

export function synergyResolveData(effect: EffectValueSynergy, originalValue: number | MinMax, objectSource: SynergyResolveDataSource = {}, statsItWillUpdate: Array<{ stat: string, mapping?: CharacterStatMapping }> = []): SynergyResolveData {
    return { type: ResolveDataType.Synergy, effect, originalValue, objectSource, statsItWillUpdate };
}