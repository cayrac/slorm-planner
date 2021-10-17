import { MergedStatMapping } from '../constants/content/data/data-character-stats-mapping';
import { ExternalSynergyResolveData, ResolveDataType, SynergyResolveData } from '../model/content/character-stats';
import { EffectValueSynergy } from '../model/content/effect-value';
import { Entity } from '../model/entity';
import { MinMax } from '../model/minmax';

export function isSynergyResolveData(resolveData: SynergyResolveData | ExternalSynergyResolveData): resolveData is SynergyResolveData {
    return resolveData.type === ResolveDataType.Synergy
}

export function synergyResolveData(effect: EffectValueSynergy, originalValue: number | MinMax, objectSource: Entity, statsItWillUpdate: Array<{ stat: string, mapping?: MergedStatMapping }> = []): SynergyResolveData {
    return { type: ResolveDataType.Synergy, effect, originalValue, objectSource, statsItWillUpdate };
}