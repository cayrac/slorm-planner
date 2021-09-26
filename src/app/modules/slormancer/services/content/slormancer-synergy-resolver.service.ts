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
import { round } from '../../util/math.util';
import { isSynergyResolveData, synergyResolveData } from '../../util/synergy-resolver.util';
import { CharacterExtractedStatMap } from './slormancer-stats-extractor.service';
import { SlormancerStatUpdaterService } from './slormancer-stats-updater.service';

@Injectable()
export class SlormancerSynergyResolverService {

    constructor(private slormancerStatUpdaterService: SlormancerStatUpdaterService) { }

    public resolveSynergies(synergies: Array<SynergyResolveData | ExternalSynergyResolveData>, characterStats: Array<CharacterStat>, config: CharacterConfig, extractedStats: CharacterExtractedStatMap): Array<SynergyResolveData>  {
        const remainingSynergies = [ ...synergies];
        
        this.addDefaultSynergies(remainingSynergies, config, extractedStats);

        let next: SynergyResolveData | ExternalSynergyResolveData | null;
        while (remainingSynergies.length > 0 && (next = this.takeNextSynergy(remainingSynergies)) !== null) {
            this.updateSynergyValue(next, characterStats, extractedStats);
            this.applySynergyToStats(next, characterStats);
        }

        return remainingSynergies.filter(isSynergyResolveData);
    }

    public resolveIsolatedSynergies(synergies: Array<SynergyResolveData>, characterStats: Array<CharacterStat>, extractedStats: CharacterExtractedStatMap) {
        for (const synergy of synergies) {
            this.updateSynergyValue(synergy, characterStats, extractedStats);
        }
    }

    private addDefaultSynergies(resolveDatas: Array<SynergyResolveData | ExternalSynergyResolveData>, config: CharacterConfig, extractedStats: CharacterExtractedStatMap) {
        const addReaperToElements = extractedStats['reaper_added_to_elements'] !== undefined
        const overdriveDamageBasedOnSkillDamage = extractedStats['overdrive_damage_based_on_skill_damage'] !== undefined

        resolveDatas.push(synergyResolveData(effectValueSynergy(100 - config.percent_missing_mana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'current_mana'), -1, {}, [ { stat: 'current_mana' } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(config.percent_missing_mana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'missing_mana'), -1, {}, [ { stat: 'missing_mana' } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(config.percent_lock_mana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'mana_lock_flat'), -1, {}, [ { stat: 'mana_lock_flat' } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(config.percent_missing_health, 0, EffectValueUpgradeType.None, false, 'max_health', 'missing_health'), -1, {}, [ { stat: 'missing_health' } ]));
        
        let mapping = HERO_CHARACTER_STATS_MAPPING.find(m => m.stat === 'physical_damage');
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'basic_to_physical_damage'), -1, {}, [ { stat: 'physical_damage', mapping } ]));
        if (addReaperToElements) {
            let mapping = HERO_CHARACTER_STATS_MAPPING.find(m => m.stat === 'elemental_damage');
            resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_elemental_damage'), -1, {}, [ { stat: 'elemental_damage', mapping } ]));
        } else {
            resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage'), -1, {}, [ { stat: 'physical_damage', mapping } ]));
        }
        
        mapping = HERO_CHARACTER_STATS_MAPPING.find(m => m.stat === 'sum_all_resistances');
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'armor', 'sum_all_resistances_add'), 0, {}, [ { stat: 'sum_all_resistances', mapping } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'dodge', 'sum_all_resistances_add'), 0, {}, [ { stat: 'sum_all_resistances', mapping } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_resist', 'sum_all_resistances_add'), 0, {}, [ { stat: 'sum_all_resistances', mapping } ]));
        
        mapping = HERO_CHARACTER_STATS_MAPPING.find(m => m.stat === 'sum_reduced_resistances');
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_melee', 'sum_reduced_resistances_add'), 0, {}, [ { stat: 'sum_reduced_resistances', mapping } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_projectile', 'sum_reduced_resistances_add'), 0, {}, [ { stat: 'sum_reduced_resistances', mapping } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_area', 'sum_reduced_resistances_add'), 0, {}, [ { stat: 'sum_reduced_resistances', mapping } ]));
                
        mapping = HERO_CHARACTER_STATS_MAPPING.find(m => m.stat === 'skill_elem_damage');
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'skill_elem_damage_add'), 0, {}, [ { stat: 'skill_elem_damage', mapping } ]));
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'skill_elem_damage_add'), 0, {}, [ { stat: 'skill_elem_damage', mapping } ]));
        
        // overdrive_damage_based_on_skill_damage
        mapping = HERO_CHARACTER_STATS_MAPPING.find(m => m.stat === 'overdrive_damage');
        if (overdriveDamageBasedOnSkillDamage) {
            resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'overdrive_damage_add'), 0, {}, [ { stat: 'overdrive_damage', mapping } ]));
        } else {
            resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'overdrive_damage_add'), 0, {}, [ { stat: 'overdrive_damage', mapping } ]));
        }
 
        mapping = HERO_CHARACTER_STATS_MAPPING.find(m => m.stat === 'inner_fire_damage');
        resolveDatas.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'inner_fire_damage_add'), 0, {}, [ { stat: 'inner_fire_damage', mapping } ]));

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

    private updateSynergyValue(resolveData: SynergyResolveData | ExternalSynergyResolveData, characterStats: Array<CharacterStat>, extractedStats: CharacterExtractedStatMap) {
        if (isSynergyResolveData(resolveData)) {
            const source = characterStats.find(stat => stat.stat === resolveData.effect.source);
            const allowMinMax = resolveData.statsItWillUpdate.reduce((t, c) => (c.mapping === undefined || c.mapping.allowMinMax) && t, true);
            const precisions = resolveData.statsItWillUpdate.map(stat => stat.mapping ? stat.mapping.precision : 0);
            const precision = Math.max(resolveData.effect.percent ? 1 : 0, precisions.length > 0 ? Math.min(...precisions) : 0);
    
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

            if (resolveData.effect.stat === null) {
                console.log('Synergy is going to add it\'s value to null', resolveData);
            }

        } else {
            const sources = resolveData.sources.map(source => {
                const stat = characterStats.find(stat => stat.stat === source);
                return  stat ? stat.total : 0;
            });
            resolveData.value = resolveData.method(...sources);
        }
    }

    private applySynergyToStats(synergyResolveData: SynergyResolveData | ExternalSynergyResolveData, stats: Array<CharacterStat>) {

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
                        maxPercent: [],
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

            if (statToUpdate.mapping === undefined || statToUpdate.mapping.source.flat.find(v => v.stat === stat)) {
                foundStat.values.flat.push(synergy);
            } else if (typeof synergy === 'number'){
                if (statToUpdate.mapping.source.max.find(v => v.stat === stat)) {
                    foundStat.values.max.push(synergy);
                } else if (statToUpdate.mapping.source.percent.find(v => v.stat === stat)) {
                    foundStat.values.percent.push(synergy);
                } else if (statToUpdate.mapping.source.multiplier.find(v => v.stat === stat)) {
                    foundStat.values.multiplier.push(synergy);
                }
            }

            if ('sources' in synergyResolveData) {
                console.log('Synergy added ' + (typeof synergy === 'number' ? synergy : synergy.min + '-' + synergy.max) + ' ' + synergyResolveData.sources.join(', ') + ' to ' + foundStat.stat);
            } else {           
                console.log('Synergy added ' + (typeof synergy === 'number' ? synergy : synergy.min + '-' + synergy.max) + ' ' + synergyResolveData.effect.source + ' to ' + foundStat.stat);
            }

            this.slormancerStatUpdaterService.updateStatTotal(foundStat);
        }
    }
}