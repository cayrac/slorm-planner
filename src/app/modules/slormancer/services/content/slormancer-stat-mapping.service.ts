import { Injectable } from '@angular/core';

import { MergedStatMapping, MergedStatMappingSource } from '../../constants/content/data/data-character-stats-mapping';
import { CharacterConfig } from '../../model/character-config';
import { MergedStat } from '../../model/content/character-stats';
import { MinMax } from '../../model/minmax';
import { ExtractedStatMap } from './slormancer-stats-extractor.service';

@Injectable()
export class SlormancerStatMappingService {

    constructor() { }
    
    private getMappingValues(sources: Array<MergedStatMappingSource>, stats: ExtractedStatMap, config: CharacterConfig): Array<number | MinMax>  {
        return sources
            .filter(source => source.condition === undefined || source.condition(config, stats))
            .map(source => {
                let result = stats[source.stat];
                if (result && source.multiplier) {
                    const mult = source.multiplier(config, stats);
                    result = result.map(v => v * mult);
                }
                return result ? result : [];
            })
            .flat();
    }

    public buildMergedStats(stats: ExtractedStatMap, mappings: Array<MergedStatMapping>, config: CharacterConfig): Array<MergedStat> {
        return mappings.map(mapping => {
            return {
                stat: mapping.stat,
                total: 0,
                precision: mapping.precision,
                allowMinMax: mapping.allowMinMax,
                values: {
                    flat: this.getMappingValues(mapping.source.flat, stats, config),
                    max: this.getMappingValues(mapping.source.max, stats, config),
                    percent: this.getMappingValues(mapping.source.percent, stats, config),
                    maxPercent: this.getMappingValues(mapping.source.maxPercent, stats, config),
                    multiplier: this.getMappingValues(mapping.source.multiplier, stats, config),
                    maxMultiplier: this.getMappingValues(mapping.source.maxMultiplier, stats, config),
                }
            } as MergedStat;
        });
    }

    public addUniqueValueToStat(stat: string, value: number, mergedStat: MergedStat, mapping: MergedStatMapping, config: CharacterConfig, extractedStats: ExtractedStatMap) {
        let mappingSource: MergedStatMappingSource | undefined;
        let array: Array<number> | null = null;

        if (mappingSource = mapping.source.max.find(v => v.stat === stat)) {
            array = mergedStat.values.max;
        } else if (mappingSource = mapping.source.percent.find(v => v.stat === stat)) {
            array = mergedStat.values.percent;
        } else if (mappingSource = mapping.source.maxPercent.find(v => v.stat === stat)) {
            array = mergedStat.values.maxPercent;
        } else if (mappingSource = mapping.source.multiplier.find(v => v.stat === stat)) {
            array = mergedStat.values.multiplier;
        } else if (mappingSource = mapping.source.maxMultiplier.find(v => v.stat === stat)) {
            array = mergedStat.values.maxMultiplier;
        }

        if (mappingSource && array !== null && (mappingSource.condition === undefined || mappingSource.condition(config, extractedStats))) {
            if (mappingSource.multiplier) {
                value = value * mappingSource.multiplier(config, extractedStats);
            }
            array.push(value);
        }
    }
}