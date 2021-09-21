import { Injectable } from '@angular/core';

import {
    CharacterStatMapping,
    HERO_CHARACTER_STATS_MAPPING,
} from '../../constants/content/data/data-character-stats-mapping';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { AncestralLegacy } from '../../model/content/ancestral-legacy';
import { AttributeTraits } from '../../model/content/attribut-traits';
import { CharacterStat, CharacterStats, SynergyResolveData } from '../../model/content/character-stats';
import { EquipableItem } from '../../model/content/equipable-item';
import { Reaper } from '../../model/content/reaper';
import { Skill } from '../../model/content/skill';
import { SkillUpgrade } from '../../model/content/skill-upgrade';
import { isNotNullOrUndefined } from '../../util/utils';
import { CharacterExtractedStatMap, SlormancerStatsExtractorService } from './slormancer-stats-extractor.service';
import { SlormancerStatUpdaterService } from './slormancer-stats-updater.service';
import { SlormancerSynergyResolverService } from './slormancer-synergy-resolver.service';

export interface CharacterStatsBuildResult {
    unresolvedSynergies: Array<SynergyResolveData>;
    stats: CharacterStats,
    changed:  {
        items: Array<EquipableItem>;
        ancestralLegacies: Array<AncestralLegacy>;
        skills: Array<Skill>;
        upgrades: Array<SkillUpgrade>;
        reapers: Array<Reaper>;
        attributes: Array<AttributeTraits>;
    }
}

@Injectable()
export class SlormancerStatsService {

    constructor(private slormancerStatsExtractorService: SlormancerStatsExtractorService,
                private slormancerSynergyResolverService: SlormancerSynergyResolverService,
                private slormancerStatUpdaterService: SlormancerStatUpdaterService) { }
    
    private buildCharacterStats(stats: CharacterExtractedStatMap, mappings: Array<CharacterStatMapping>): Array<CharacterStat> {
        return mappings.map(mapping => {
            return {
                stat: mapping.stat,
                total: 0,
                precision: mapping.precision,
                allowMinMax: mapping.allowMinMax,
                values: {
                    flat: mapping.source.flat.map(source => stats[source]).filter(isNotNullOrUndefined).flat(),
                    max: mapping.source.max.map(source => stats[source]).filter(isNotNullOrUndefined).flat(),
                    percent: mapping.source.percent.map(source => stats[source]).filter(isNotNullOrUndefined).flat(),
                    multiplier: mapping.source.multiplier.map(source => stats[source]).filter(isNotNullOrUndefined).flat(),
                }
            }
        });
    }

    private addConfigCharacterStats(stats: Array<CharacterStat>, config: CharacterConfig) {
        const configEntries = <Array<[string, number]>>Object.entries(config);
        for (const [stat, value] of configEntries) {
            stats.push({
                stat: stat,
                total: value,
                precision: 0,
                allowMinMax: false,
                values: {
                    flat: [value],
                    max: [],
                    percent: [],
                    multiplier: [],
                }
            });
        }
    }

    private addSkillStats(stats: Array<CharacterStat>, skills: Array<CharacterSkillAndUpgrades>) {
        for (const sau of skills) {
            stats.push({
                allowMinMax: false,
                precision: 0,
                stat: 'based_on_mastery_' + sau.skill.id,
                total: sau.skill.baseLevel,
                values: {
                    flat: [sau.skill.baseLevel],
                    max: [],
                    percent: [],
                    multiplier: []
                }
            });
        }
    }

    private buildMechanicDamages(stats: Array<CharacterStat>, damageSource: string, damagePercent: string, stat: string) {
        const damageSourceStat = stats.find(stat => stat.stat === damageSource);
        const damagePercentStat = stats.find(stat => stat.stat === damagePercent);

        let finalDamages = { min: 0, max: 0 };

        if (damageSourceStat && damagePercentStat && typeof damagePercentStat.total === 'number' && typeof damageSourceStat.total !== 'number') {
            finalDamages.min = damageSourceStat.total.min * damagePercentStat.total / 100;
            finalDamages.max = damageSourceStat.total.max * damagePercentStat.total / 100;
        }

        const result = {
            precision: 0,
            stat: stat,
            total: finalDamages,
            allowMinMax: true,
            values: {
                flat: [finalDamages],
                max: [],
                multiplier: [],
                percent: []
            }
        } 

        stats.push(result);

        return result;
    }

    public getStats(character: Character, config: CharacterConfig): CharacterStatsBuildResult {
        const result: CharacterStatsBuildResult = {
            unresolvedSynergies: [],
            stats:  {
                hero: [],
                support: [],
                primary: [],
                secondary: [],
            },
            changed: {
                items: [],
                ancestralLegacies: [],
                skills: [],
                upgrades: [],
                reapers: [],
                attributes: []
            }
        }
        const stats = this.slormancerStatsExtractorService.extractStats(character);
        
        result.stats.hero = this.buildCharacterStats(stats.heroStats, HERO_CHARACTER_STATS_MAPPING);
        result.stats.support = this.buildCharacterStats(stats.supportStats, []);
        result.stats.primary = this.buildCharacterStats(stats.primaryStats, []);
        result.stats.secondary = this.buildCharacterStats(stats.secondaryStats, []);

        this.addConfigCharacterStats(result.stats.hero, config);
        this.addSkillStats(result.stats.hero, character.skills);

        for (const stats of result.stats.hero) {
            this.slormancerStatUpdaterService.updateStatTotal(stats);
        }
        for (const stats of result.stats.support) {
            this.slormancerStatUpdaterService.updateStatTotal(stats);
        }
        for (const stats of result.stats.primary) {
            this.slormancerStatUpdaterService.updateStatTotal(stats);
        }
        for (const stats of result.stats.secondary) {
            this.slormancerStatUpdaterService.updateStatTotal(stats);
        }

        result.unresolvedSynergies = this.slormancerSynergyResolverService.resolveSynergies(stats.synergies, result.stats.hero, config);

        this.slormancerSynergyResolverService.resolveIsolatedSynergies(stats.isolatedSynergies, result.stats.hero);

        this.buildMechanicDamages(result.stats.hero, 'basic_damage', 'inner_fire_damage_base_percent', 'inner_fire_damage');
        this.buildMechanicDamages(result.stats.hero, 'basic_damage', 'overdrive_damage_base_percent', 'overdrive_damage');

        console.log(stats.heroStats);
        console.log(result);

        for (const synergy of [...stats.synergies, ...stats.isolatedSynergies]) {
            if (synergy.valueChanged) {
                if (synergy.objectSource.ancestralLegacy) {
                    result.changed.ancestralLegacies.push(synergy.objectSource.ancestralLegacy);
                }
                if (synergy.objectSource.attribute) {
                    result.changed.attributes.push(synergy.objectSource.attribute);
                }
                if (synergy.objectSource.item) {
                    result.changed.items.push(synergy.objectSource.item);
                }
                if (synergy.objectSource.reaper) {
                    result.changed.reapers.push(synergy.objectSource.reaper);
                }
                if (synergy.objectSource.skill) {
                    result.changed.skills.push(synergy.objectSource.skill);
                }
                if (synergy.objectSource.upgrade) {
                    result.changed.upgrades.push(synergy.objectSource.upgrade);
                }
            }
        }

        return result;
    }
}