import { Injectable } from '@angular/core';

import { HERO_CHARACTER_STATS_MAPPING } from '../../constants/content/data/data-character-stats-mapping';
import { CharacterConfig } from '../../model/character-config';
import { CharacterStat, SynergyResolveData } from '../../model/content/character-stats';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { MinMax } from '../../model/minmax';
import { effectValueSynergy } from '../../util/effect-value.util';
import { SlormancerStatUpdaterService } from './slormancer-stats-updater.service';

@Injectable()
export class SlormancerSynergyResolverService {

    constructor(private slormancerStatUpdaterService: SlormancerStatUpdaterService) { }

    private addDefaultSynergies(synergies: Array<SynergyResolveData>, config: CharacterConfig) {
        synergies.push({
            effect: effectValueSynergy(100 - config.percent_missing_mana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'current_mana'),
            originalValue: -1,
            valueChanged: true,
            objectSource: {},
            statsItWillUpdate: [ { stat: 'current_mana' } ]
        });
        synergies.push({
            effect: effectValueSynergy(config.percent_missing_mana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'missing_mana'),
            originalValue: -1,
            valueChanged: true,
            objectSource: {},
            statsItWillUpdate: [ { stat: 'missing_mana' } ]
        });
        synergies.push({
            effect: effectValueSynergy(config.percent_lock_mana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'mana_lock_flat'),
            originalValue: -1,
            valueChanged: true,
            objectSource: {},
            statsItWillUpdate: [ { stat: 'mana_lock_flat' } ]
        });
        synergies.push({
            effect: effectValueSynergy(config.percent_missing_health, 0, EffectValueUpgradeType.None, false, 'max_health', 'missing_health'),
            originalValue: -1,
            valueChanged: true,
            objectSource: {},
            statsItWillUpdate: [ { stat: 'missing_health' } ]
        });
        let mapping = HERO_CHARACTER_STATS_MAPPING.find(m => m.stat === 'physical_damage');
        synergies.push({
            effect: effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'basic_to_physical_damage'),
            originalValue: -1,
            valueChanged: true,
            objectSource: {},
            statsItWillUpdate: [ { stat: 'physical_damage', mapping } ]
        });
        synergies.push({
            effect: effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage'),
            originalValue: -1,
            valueChanged: true,
            objectSource: {},
            statsItWillUpdate: [ { stat: 'physical_damage', mapping } ]
        });
    }

    private takeNextSynergy(synergies: Array<SynergyResolveData>): SynergyResolveData | null {
        const indexFound = synergies.findIndex(synergy => synergies
            .find(s => s.statsItWillUpdate.find(statItWillUpdate => statItWillUpdate.stat === synergy.effect.source) !== undefined) === undefined);
        let result: SynergyResolveData | null = null;

        if (indexFound !== -1) {
            const extracted = synergies.splice(indexFound, 1)[0];
            if (extracted) {
                result = extracted;
            }
        }

        return result;
    }

    public resolveSynergies(synergies: Array<SynergyResolveData>, stats: Array<CharacterStat>, config: CharacterConfig): Array<SynergyResolveData>  {
        this.addDefaultSynergies(synergies, config);

        const remainingSynergies = [ ...synergies];
        let next: SynergyResolveData | null;
        while (remainingSynergies.length > 0 && (next = this.takeNextSynergy(remainingSynergies)) !== null) {
            this.applySynergyToStats(next, stats);
        }

        return remainingSynergies;
    }

    private isEqual(a: number | MinMax, b: number | MinMax): boolean {
        let result = false;


        if (typeof a === typeof b) {
            if (typeof a === 'number') {
                result = a === b;
            } else {
                result = a.min === (<MinMax>b).min && a.max === (<MinMax>b).max;
            }
        }

        return result;
    }

    private updateSynergyValue(synergyResolveData: SynergyResolveData, stats: Array<CharacterStat>) {
        const source = stats.find(stat => stat.stat === synergyResolveData.effect.source);

        if (source) {
            const newValue = typeof source.total === 'number'
                ? synergyResolveData.effect.value * source.total / 100
                : { min: synergyResolveData.effect.value * source.total.min / 100,
                    max: synergyResolveData.effect.value * source.total.max / 100 };
            
            synergyResolveData.valueChanged = !this.isEqual(synergyResolveData.originalValue, newValue);
            synergyResolveData.effect.synergy = newValue;
            
            // console.log(synergyResolveData.effect.value + '% of ' + synergyResolveData.effect.source + ' added to ' + synergyResolveData.effect.stat + ' : ' + (typeof synergyResolveData.effect.synergy === 'number' ? synergyResolveData.effect.synergy : (synergyResolveData.effect.synergy.min + '-' + synergyResolveData.effect.synergy.max)));
            if (synergyResolveData.effect.stat === null) {
                console.log('Synergy is going to add it\'s value to null', synergyResolveData);
            }
        } else {
            console.log('no source (' + synergyResolveData.effect.source + ') found for ', synergyResolveData);
        }
    }

    public resolveIsolatedSynergies(synergies: Array<SynergyResolveData>, stats: Array<CharacterStat>) {
        for (const synergy of synergies) {
            this.updateSynergyValue(synergy, stats);
        }
    }

    private applySynergyToStats(synergyResolveData: SynergyResolveData, stats: Array<CharacterStat>) {

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

            if (statToUpdate.mapping === undefined || statToUpdate.mapping.source.flat.find(v => v === synergyResolveData.effect.stat)) {
                foundStat.values.flat.push(synergyResolveData.effect.synergy);
            } else if (typeof synergyResolveData.effect.synergy === 'number'){
                if (statToUpdate.mapping.source.percent.find(v => v === synergyResolveData.effect.stat)) {
                    foundStat.values.percent.push(synergyResolveData.effect.synergy);
                } else if (statToUpdate.mapping.source.multiplier.find(v => v === synergyResolveData.effect.stat)) {
                    foundStat.values.multiplier.push(synergyResolveData.effect.synergy);
                }
            }

            this.slormancerStatUpdaterService.updateStatTotal(foundStat);
        }
    }
}