import { Injectable } from '@angular/core';

import {
    CharacterStatMapping,
    HERO_CHARACTER_STATS_MAPPING,
} from '../../constants/content/data/data-character-stats-mapping';
import { Character } from '../../model/character';
import { CharacterStat, CharacterStats, CharacterStatType } from '../../model/content/character-stats';
import { round } from '../../util/math.util';
import { isNotNullOrUndefined } from '../../util/utils';
import { CharacterExtractedStatMap, SlormancerStatsExtractorService } from './slormancer-stats-extractor.service';

@Injectable()
export class SlormancerStatsService {

    constructor(private slormancerStatsExtractorService: SlormancerStatsExtractorService) { }
    
    private buildCharacterStats(stats: CharacterExtractedStatMap, mappings: Array<CharacterStatMapping>): Array<CharacterStat> {
        return mappings.map(mapping => {
            return {
                section: mapping.section,
                stat: mapping.stat,
                total: 0,
                type: mapping.type,
                precision: mapping.precision,
                sign: mapping.sign,
                values: {
                    flat: mapping.source.flat.map(source => stats[source]).filter(isNotNullOrUndefined).flat(),
                    percent: mapping.source.percent.map(source => stats[source]).filter(isNotNullOrUndefined).flat(),
                    multiplier: mapping.source.multiplier.map(source => stats[source]).filter(isNotNullOrUndefined).flat(),
                }
            }
        });
    }

    private updateCharacterStatTotal(stat: CharacterStat) {
        let total = stat.values.flat.reduce((total, value) => total + value, 0);
        total = total * (100 + stat.values.percent.reduce((total, value) => total + value, 0)) / 100;
        if (stat.stat === 'attack_speed') {
            total = 100 - stat.values.multiplier.map(mult => Math.max(0, 100 - mult) / 100).reduce((total, value) => total * value, 1 - (total / 100)) * 100;
        } else {
            total = stat.values.multiplier.reduce((total, increase) => total * (100 + increase) / 100 , total);
        }
        stat.total = round(total, stat.precision);
    }

    private mergeDamages(stats: Array<CharacterStat>, min: string, max: string, stat: string) {
        const basicMin = stats.find(stat => stat.stat === min);
        const basicMax = stats.find(stat => stat.stat === max);

        let basicMinDamages = 0;
        let basicMaxDamages = 0;
        if (basicMin) {
            basicMinDamages = <number>basicMin.total;
            stats.splice(stats.indexOf(basicMin), 1);
        }
        if (basicMax) {
            basicMaxDamages = <number>basicMax.total;
            stats.splice(stats.indexOf(basicMax), 1);
        }

        stats.push({
            section: 'cat_attack',
            precision: 0,
            sign: false,
            stat: stat,
            total: { min: basicMinDamages, max: basicMinDamages + basicMaxDamages },
            type: CharacterStatType.None,
            values: {
                flat: [],
                multiplier: [],
                percent: []
            }
        });
    }

    public getStats(character: Character): CharacterStats {
        const result: CharacterStats = {
            hero: [],
            support: [],
            primary: [],
            secondary: [],
        }
        const stats = this.slormancerStatsExtractorService.extractStats(character);
        
        result.hero = this.buildCharacterStats(stats.heroStats, HERO_CHARACTER_STATS_MAPPING);
        result.support = this.buildCharacterStats(stats.supportStats, []);
        result.primary = this.buildCharacterStats(stats.primaryStats, HERO_CHARACTER_STATS_MAPPING);
        result.secondary = this.buildCharacterStats(stats.secondaryStats, HERO_CHARACTER_STATS_MAPPING);
        

        for (const stats of result.hero) {
            this.updateCharacterStatTotal(stats);
        }
        for (const stats of result.support) {
            this.updateCharacterStatTotal(stats);
        }
        for (const stats of result.primary) {
            this.updateCharacterStatTotal(stats);
        }
        for (const stats of result.secondary) {
            this.updateCharacterStatTotal(stats);
        }

        this.mergeDamages(result.hero, 'min_basic_damage_add', 'max_basic_damage_add', 'basic_damage');
        this.mergeDamages(result.hero, 'min_weapon_damage_add', 'max_weapon_damage_add', 'weapon_damage');

        console.log(stats.heroStats);
        console.log(result);

        return result;
    }
}