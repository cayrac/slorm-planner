import { Injectable } from '@angular/core';

import { CharacterConfig } from '../../model/character-config';
import {
    ExternalSynergyResolveData,
    MergedStat,
    ResolveDataType,
    SynergyResolveData,
} from '../../model/content/character-stats';
import { MinMax } from '../../model/minmax';
import { round } from '../../util/math.util';
import { isSynergyResolveData } from '../../util/synergy-resolver.util';
import { SlormancerStatMappingService } from './slormancer-stat-mapping.service';
import { ExtractedStatMap } from './slormancer-stats-extractor.service';
import { SlormancerStatUpdaterService } from './slormancer-stats-updater.service';

@Injectable()
export class SlormancerSynergyResolverService {

    constructor(private slormancerStatUpdaterService: SlormancerStatUpdaterService,
                private slormancerStatMappingService: SlormancerStatMappingService) { }

    public resolveSynergies(synergies: Array<SynergyResolveData | ExternalSynergyResolveData>, characterStats: Array<MergedStat>, extractedStats: ExtractedStatMap, config: CharacterConfig): { resolved: Array<SynergyResolveData>, unresolved: Array<SynergyResolveData> }  {
        const remainingSynergies = [ ...synergies];
        const resolved: Array<SynergyResolveData> = []
        
        this.addExternalSynergies(remainingSynergies);

          let next: SynergyResolveData | ExternalSynergyResolveData | null;
        while (remainingSynergies.length > 0 && (next = this.takeNextSynergy(remainingSynergies)) !== null) {
            this.updateSynergyValue(next, characterStats, extractedStats);
            this.applySynergyToStats(next, characterStats, extractedStats, config);
            if ('objectSource' in next) {
                resolved.push(next);
            }
        }

        return { unresolved: remainingSynergies.filter(isSynergyResolveData), resolved };
    }

    public resolveIsolatedSynergies(synergies: Array<SynergyResolveData>, characterStats: Array<MergedStat>, extractedStats: ExtractedStatMap) {
        for (const synergy of synergies) {
            this.updateSynergyValue(synergy, characterStats, extractedStats);
        }
    }

    private addExternalSynergies(resolveDatas: Array<SynergyResolveData | ExternalSynergyResolveData>) {
        resolveDatas.push({
            type: ResolveDataType.ExternalSynergy,
            value: 0,
            method: (basic, elemental) => {
                const basicMin = typeof basic === 'number' ? basic : basic.min;
                const elementalMin = typeof elemental === 'number' ? elemental : elemental.min;
                return Math.abs(basicMin - elementalMin);
            },
            sources: ['basic_damage', 'elemental_damage'],
            stat: 'raw_elem_diff',
            statsItWillUpdate: [ { stat: 'raw_elem_diff' } ]
        });
    }

    private takeNextSynergy(resolveDatas: Array<SynergyResolveData | ExternalSynergyResolveData>): SynergyResolveData | ExternalSynergyResolveData | null {
        const indexFound = resolveDatas.findIndex(resolveData => resolveDatas
            .find(s => s.statsItWillUpdate.find(statItWillUpdate => {
                let found = false; 
                if (resolveData.type === ResolveDataType.Synergy) {
                    found = statItWillUpdate.stat === resolveData.effect.source;
                } else {
                    found = resolveData.sources.some(source => statItWillUpdate.stat === source);
                }
                return found;
            }) !== undefined) === undefined);

        let result: SynergyResolveData | ExternalSynergyResolveData | null = null;
        if (indexFound !== -1) {
            const extracted = resolveDatas.splice(indexFound, 1)[0];
            if (extracted) {
                result = extracted;
            }
        }
        return result;
    }

    private updateSynergyValue(resolveData: SynergyResolveData | ExternalSynergyResolveData, characterStats: Array<MergedStat>, extractedStats: ExtractedStatMap) {
        if (isSynergyResolveData(resolveData)) {
            const source = characterStats.find(stat => stat.stat === resolveData.effect.source);
            const allowMinMax = resolveData.statsItWillUpdate.reduce((t, c) => (c.mapping === undefined || c.mapping.allowMinMax) && t, resolveData.effect.allowMinMax);

            let precision = resolveData.effect.precision;
            if (precision === null) {
                const precisions = resolveData.statsItWillUpdate.map(stat => stat.mapping ? stat.mapping.precision : 0);
                precision = Math.max(resolveData.effect.percent ? 1 : 0, precisions.length > 0 ? Math.min(...precisions) : 0);
            }
    
            let sourceValue: number | MinMax = 0;

            if (source) {
                sourceValue = source.total;
            } else {
                const stat = extractedStats[resolveData.effect.source];
                if (stat) {
                    sourceValue = stat.reduce((t, v) => t + v, 0);
                } else {
                    console.log('no source (' + resolveData.effect.source + ') found for ', resolveData);
                }
            }

            if (typeof sourceValue !== 'number' && !allowMinMax) {
                sourceValue = (sourceValue.min + sourceValue.max) / 2;
            }
            
            const newValue = typeof sourceValue === 'number'
                ? resolveData.effect.value * sourceValue / 100
                : { min: resolveData.effect.value * sourceValue.min / 100,
                    max: resolveData.effect.value * sourceValue.max / 100 };

            resolveData.effect.synergy = newValue;

            resolveData.effect.displaySynergy = typeof newValue === 'number'
                ? round(newValue, precision)
                : { min: round(newValue.min, precision),
                    max: round(newValue.max, precision) };
        } else {
            const sources = resolveData.sources.map(source => {
                const stat = characterStats.find(stat => stat.stat === source);
                return  stat ? stat.total : 0;
            });
            resolveData.value = resolveData.method(...sources);
        }
    }

    private applySynergyToStats(synergyResolveData: SynergyResolveData | ExternalSynergyResolveData, stats: Array<MergedStat>, extractedStats: ExtractedStatMap, config: CharacterConfig) {

        for (const statToUpdate of synergyResolveData.statsItWillUpdate) {
            let foundStat: MergedStat | undefined = stats.find(stat => stat.stat === statToUpdate.stat);
            if (foundStat === undefined) {
                foundStat = {
                    precision:  statToUpdate.mapping ? statToUpdate.mapping.precision : 0,
                    stat: statToUpdate.stat,
                    total: 0,
                    allowMinMax: true,
                    values: {
                        flat: [],
                        max: [],
                        percent: [],
                        maxPercent: [],
                        multiplier: [],
                        maxMultiplier: [],
                    }
                };
                stats.push(foundStat);
            }

            let synergy: number | MinMax;
            let stat: string;
            if (isSynergyResolveData(synergyResolveData)) {
                synergy = synergyResolveData.effect.synergy;
                stat = synergyResolveData.effect.stat;
            } else {
                synergy = synergyResolveData.value;
                stat = synergyResolveData.stat;
            }

            if (statToUpdate.mapping === undefined) {
                foundStat.values.flat.push(synergy);
            } else {
                this.slormancerStatMappingService.addUniqueValueToStat(stat, synergy, foundStat, statToUpdate.mapping, config, extractedStats);
            }

            this.slormancerStatUpdaterService.updateStatTotal(foundStat);
        }
    }
}