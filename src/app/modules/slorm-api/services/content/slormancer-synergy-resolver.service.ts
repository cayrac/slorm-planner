import { Injectable } from '@angular/core';

import { CharacterConfig } from '../../model/character-config';
import {
    ExternalSynergyResolveData,
    MergedStat,
    ResolveDataType,
    SynergyResolveData,
} from '../../model/content/character-stats';
import { EffectValueSynergy } from '../../model/content/effect-value';
import { Entity } from '../../model/entity';
import { MinMax } from '../../model/minmax';
import { bankerRound } from '../../util/math.util';
import { isSynergyResolveData, synergyResolveData } from '../../util/synergy-resolver.util';
import { SlormancerMergedStatUpdaterService } from './slormancer-merged-stat-updater.service';
import { SlormancerStatMappingService } from './slormancer-stat-mapping.service';
import { ExtractedStatMap } from './slormancer-stats-extractor.service';

@Injectable()
export class SlormancerSynergyResolverService {

    constructor(private slormancerStatUpdaterService: SlormancerMergedStatUpdaterService,
                private slormancerStatMappingService: SlormancerStatMappingService) { }

    private resolveSynergy(synergy: SynergyResolveData | ExternalSynergyResolveData, resolved: Array<SynergyResolveData>, characterStats: Array<MergedStat>, extractedStats: ExtractedStatMap, config: CharacterConfig) {
        this.updateSynergyValue(synergy, characterStats, extractedStats);
        this.applySynergyToStats(synergy, characterStats, extractedStats, config);
        if ('originalValue' in synergy) {
            resolved.push(synergy);
        }
    }

    public resolveSynergies(synergies: Array<SynergyResolveData | ExternalSynergyResolveData>, characterStats: Array<MergedStat>, extractedStats: ExtractedStatMap, config: CharacterConfig): { resolved: Array<SynergyResolveData>, unresolved: Array<SynergyResolveData> }  {
        const remainingSynergies = [ ...synergies];
        const resolved: Array<SynergyResolveData> = [];
        
        this.addExternalSynergies(remainingSynergies);

        let next: SynergyResolveData | ExternalSynergyResolveData | null;
        while (remainingSynergies.length > 0 && (next = this.takeNextSynergy(remainingSynergies)) !== null) {
            this.resolveSynergy(next, resolved, characterStats, extractedStats, config);
        }

        if (remainingSynergies.filter(isSynergyResolveData).length > 0) {
            const synergyes = remainingSynergies.filter(isSynergyResolveData);
            console.log('### There are unresolved synergies');
            for (const synergy of synergyes) {
                console.log(synergy.effect.source + ' => ' + synergy.effect.stat + (synergy.cascadeSynergy ? '(cascading)' : ''), synergy);
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
            precision: 3,
            method: (basic, elemental) => {
                const basicMin = typeof basic === 'number' ? basic : basic.min;
                const elementalMin = typeof elemental === 'number' ? elemental : elemental.min;
                return Math.abs(basicMin - elementalMin);
            },
            objectSource: { synergy: 'Difference raw and elemental damage'},
            sources: ['basic_damage', 'elemental_damage'],
            stat: 'raw_elem_diff',
            statsItWillUpdate: [ { stat: 'raw_elem_diff' } ],
            cascadeSynergy: true,
        });
    }

    private sourceHasNoDependency(resolveData: SynergyResolveData | ExternalSynergyResolveData, resolveDatas: Array<SynergyResolveData | ExternalSynergyResolveData>, debug = false): boolean {
        return resolveDatas.find(s => s.statsItWillUpdate.find(statItWillUpdate => {
                let found = false;
                if (resolveData.type === ResolveDataType.Synergy) {
                    found = statItWillUpdate.stat === resolveData.effect.source;
                } else {
                    found = resolveData.sources.some(source => statItWillUpdate.stat === source);
                }
                return found;
            }) !== undefined) === undefined
    }

    private sourceWontBeChanged(sources: string[], cascading: boolean, resolveDatas: Array<SynergyResolveData | ExternalSynergyResolveData>, debug = false): boolean {
        // a non cascading synergy can ignore another non cascading synergy that modify it's source
        return !resolveDatas
            .filter(s => cascading || s.cascadeSynergy)
            .some(s => s.statsItWillUpdate.find(statItWillUpdate => sources.some(source => statItWillUpdate.stat === source)));
    }

    private takeNextSynergy(resolveDatas: Array<SynergyResolveData | ExternalSynergyResolveData>): SynergyResolveData | ExternalSynergyResolveData | null {
        // Take the first synergy with no stat used by another synergy
        let indexFound = resolveDatas.findIndex(resolveData => this.sourceHasNoDependency(resolveData, resolveDatas));

        if (indexFound === -1) {
            // savagery 60 + infinite time and deep and space
            const savagery60 = resolveDatas.findIndex(resolveData => resolveData.type === ResolveDataType.ExternalSynergy && resolveData.stat === 'raw_elem_diff');
            const weaponUpdateElementalAndPhysical = resolveDatas.find(resolveData => resolveData.type === ResolveDataType.Synergy && resolveData.effect.stat === 'weapon_to_elemental_damage') !== undefined
                && resolveDatas.find(resolveData => resolveData.type === ResolveDataType.Synergy && resolveData.effect.stat === 'weapon_to_physical_damage') !== undefined
            if (savagery60 !== -1 && weaponUpdateElementalAndPhysical) {
                indexFound = savagery60;
            }

            const critDamageToAncestramDamage = resolveDatas.find(resolveData => resolveData.type === ResolveDataType.Synergy && resolveData.effect.stat === 'brut_damage_percent' && resolveData.effect.source === 'critical_damage');
            const isoperimetry = resolveDatas.findIndex(resolveData => resolveData.type === ResolveDataType.Synergy && resolveData.effect.stat === 'isoperimetry_crit_damage_percent_extra');
            if (critDamageToAncestramDamage&& isoperimetry !== -1 ) {
                indexFound = isoperimetry;
            }
        }

        if (indexFound === -1) {
            // take the first synergy that won't be changed by another synergy (experimental)
            indexFound = resolveDatas.findIndex(resolveData => this.sourceWontBeChanged('sources' in resolveData ? resolveData.sources : [resolveData.effect.source], resolveData.cascadeSynergy, resolveDatas));
        }

        // if all cascading synergies are resolved, take the first non cascading synergy
        if (indexFound === -1 && !resolveDatas.some(s => s.cascadeSynergy)) {
            indexFound = 0;
        }

        let result: SynergyResolveData | ExternalSynergyResolveData | null = null;
        if (indexFound !== -1) {
            const extracted = resolveDatas.splice(indexFound, 1)[0];
            if (extracted) {
                result = extracted;
            }
        }

        if (result === null) {
            resolveDatas.findIndex(resolveData => this.sourceHasNoDependency(resolveData, resolveDatas, true))
        }

        return result;
    }

    public resolveSyngleSynergy(effect: EffectValueSynergy, characterStats: Array<MergedStat>, extractedStats: ExtractedStatMap, source: Entity) {
        const resolveData = synergyResolveData(effect, -1, source);
        this.updateSynergyValue(resolveData, characterStats, extractedStats);
    }

    private updateSynergyValue(resolveData: SynergyResolveData | ExternalSynergyResolveData, characterStats: Array<MergedStat>, extractedStats: ExtractedStatMap) {
        if (isSynergyResolveData(resolveData)) {
            const source = characterStats.find(stat => stat.stat === resolveData.effect.source);
            const allowMinMax = resolveData.statsItWillUpdate.reduce((t, c) => (c.mapping === undefined || c.mapping.allowMinMax) && t, resolveData.effect.allowMinMax);
            const cascadeSynergies = 'effect' in resolveData ? resolveData.effect.cascadeSynergy : false;

            let precision = resolveData.effect.precision;
            if (precision === null) {
                const precisions = resolveData.statsItWillUpdate.map(stat => stat.mapping ? stat.mapping.precision : 0);
                precision = Math.max(resolveData.effect.percent ? 1 : 0, precisions.length > 0 ? Math.min(...precisions) : 0);
            }
    
            let sourceValue: number | MinMax = 0;

            if (source) {
                sourceValue = cascadeSynergies ? source.total : source.totalWithoutSynergy;
            } else {
                const stat = extractedStats[resolveData.effect.source];
                if (stat) {
                    sourceValue = stat.reduce((t, v) => t + v.value, 0);
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
                ? bankerRound(newValue, precision)
                : { min: bankerRound(newValue.min, precision),
                    max: bankerRound(newValue.max, precision) };
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
            let addAsSynergy = true;
            if (foundStat === undefined) {

                let precision = 0;
                let displayPrecision: number | undefined = undefined;
                if ('effect' in synergyResolveData && synergyResolveData.effect.precision !== null) {
                    precision = synergyResolveData.effect.precision;
                } else if ('precision' in synergyResolveData && synergyResolveData.precision !== null) {
                    precision = synergyResolveData.precision;
                } else if (statToUpdate.mapping) {
                    precision = statToUpdate.mapping.precision;
                    displayPrecision = statToUpdate.mapping.displayPrecision;
                }

                foundStat = {
                    precision,
                    displayPrecision,
                    stat: statToUpdate.stat,
                    total: 0,
                    totalWithoutSynergy: 0,
                    totalDisplayed: 0,
                    allowMinMax: true,
                    readonly: false,
                    suffix: '',
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
                if (synergyResolveData.addAsFlat) {
                    addAsSynergy = false;
                }
            } else {
                synergy = synergyResolveData.value;
                stat = synergyResolveData.stat;
            }

            if (statToUpdate.mapping === undefined) {
                foundStat.values.flat.push({ value: synergy, extra: false, source: synergyResolveData.objectSource, synergy: addAsSynergy });
            } else {
                this.slormancerStatMappingService.addUniqueValueToStat(stat, synergy, foundStat, statToUpdate.mapping, config, extractedStats, synergyResolveData.objectSource, addAsSynergy);
            }

            this.slormancerStatUpdaterService.updateStatTotal(foundStat);
        }
    }
}