import { Injectable } from '@angular/core';

import { HERO_CHARACTER_STATS_MAPPING } from '../../constants/content/data/data-character-stats-mapping';
import { CharacterConfig } from '../../model/character-config';
import {
    CharacterStat,
    ExternalSynergyResolveData,
    ResolveDataType,
    SynergyResolveData,
} from '../../model/content/character-stats';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { MinMax } from '../../model/minmax';
import { effectValueSynergy } from '../../util/effect-value.util';
import { isSynergyResolveData, synergyResolveData } from '../../util/synergy-resolver.util';
import { SlormancerStatUpdaterService } from './slormancer-stats-updater.service';

@Injectable()
export class SlormancerSynergyResolverService {

    constructor(private slormancerStatUpdaterService: SlormancerStatUpdaterService) { }

    public resolveSynergies(synergies: Array<SynergyResolveData | ExternalSynergyResolveData>, stats: Array<CharacterStat>, config: CharacterConfig): Array<SynergyResolveData>  {
        const remainingSynergies = [ ...synergies];
        
        this.addDefaultSynergies(remainingSynergies, config);

        let next: SynergyResolveData | ExternalSynergyResolveData | null;
        while (remainingSynergies.length > 0 && (next = this.takeNextSynergy(remainingSynergies)) !== null) {
            this.applySynergyToStats(next, stats);
        }

        return remainingSynergies.filter(isSynergyResolveData);
    }

    public resolveIsolatedSynergies(synergies: Array<SynergyResolveData>, stats: Array<CharacterStat>) {
        for (const synergy of synergies) {
            this.updateSynergyValue(synergy, stats);
        }
    }

    private addDefaultSynergies(resolveDatas: Array<SynergyResolveData | ExternalSynergyResolveData>, config: CharacterConfig) {
        resolveDatas.push(synergyResolveData(effectValueSynergy(100 - config.percent_missing_mana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'current_mana'), -1, {}, [ { stat: 'current_mana' } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(config.percent_missing_mana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'missing_mana'), -1, {}, [ { stat: 'missing_mana' } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(config.percent_lock_mana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'mana_lock_flat'), -1, {}, [ { stat: 'mana_lock_flat' } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(config.percent_missing_health, 0, EffectValueUpgradeType.None, false, 'max_health', 'missing_health'), -1, {}, [ { stat: 'missing_health' } ]));
        let mapping = HERO_CHARACTER_STATS_MAPPING.find(m => m.stat === 'physical_damage');
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'basic_to_physical_damage'), -1, {}, [ { stat: 'physical_damage', mapping } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage'), -1, {}, [ { stat: 'physical_damage', mapping } ]));

        resolveDatas.push({
            type: ResolveDataType.ExternalSynergy,
            value: 0,
            method: (basic, elemental) => {
                const basicMin = typeof basic === 'number' ? basic : basic.min;
                const elementalMin = typeof elemental === 'number' ? elemental : elemental.min;
                console.log('resolving external data raw_elem_diff : ', basic, elemental);
                return Math.abs(basicMin - elementalMin);
            },
            sources: ['basic_damage', 'elemental_damage'],
            stat: 'raw_elem_diff',
            statsItWillUpdate: [ { stat: 'raw_elem_diff' } ]
        });

        return true;
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

    private updateSynergyValue(resolveData: SynergyResolveData | ExternalSynergyResolveData, stats: Array<CharacterStat>) {
        if (isSynergyResolveData(resolveData)) {
            const source = stats.find(stat => stat.stat === resolveData.effect.source);
    
            if (source) {
                const newValue = typeof source.total === 'number'
                    ? resolveData.effect.value * source.total / 100
                    : { min: resolveData.effect.value * source.total.min / 100,
                        max: resolveData.effect.value * source.total.max / 100 };
                
                resolveData.effect.synergy = newValue;
                
                if (resolveData.effect.stat === null) {
                    console.log('Synergy is going to add it\'s value to null', resolveData);
                }
            } else {
                console.log('no source (' + resolveData.effect.source + ') found for ', resolveData);
            }
        } else {
            const sources = resolveData.sources.map(source => {
                const stat = stats.find(stat => stat.stat === source);
                return  stat ? stat.total : 0;
            });
            resolveData.value = resolveData.method(...sources);
        }
    }

    private applySynergyToStats(synergyResolveData: SynergyResolveData | ExternalSynergyResolveData, stats: Array<CharacterStat>) {

        this.updateSynergyValue(synergyResolveData, stats);

        for (const statToUpdate of synergyResolveData.statsItWillUpdate) {
            let foundStat: CharacterStat | undefined = stats.find(stat => stat.stat === statToUpdate.stat);
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
                        multiplier: [],
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

            if (statToUpdate.mapping === undefined || statToUpdate.mapping.source.flat.find(v => v === stat)) {
                foundStat.values.flat.push(synergy);
            } else if (typeof synergy === 'number'){
                if (statToUpdate.mapping.source.percent.find(v => v === stat)) {
                    foundStat.values.percent.push(synergy);
                } else if (statToUpdate.mapping.source.multiplier.find(v => v === stat)) {
                    foundStat.values.multiplier.push(synergy);
                }
            }

            this.slormancerStatUpdaterService.updateStatTotal(foundStat);
        }
    }
}