import { Injectable } from '@angular/core';

import {
    CharacterStatMapping,
    CharacterStatMappingSource,
    HERO_CHARACTER_STATS_MAPPING,
} from '../../constants/content/data/data-character-stats-mapping';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { Activable } from '../../model/content/activable';
import { AncestralLegacy } from '../../model/content/ancestral-legacy';
import { AttributeTraits } from '../../model/content/attribut-traits';
import { CharacterStat, CharacterStats, SynergyResolveData } from '../../model/content/character-stats';
import { EquipableItem } from '../../model/content/equipable-item';
import { Reaper } from '../../model/content/reaper';
import { Skill } from '../../model/content/skill';
import { SkillUpgrade } from '../../model/content/skill-upgrade';
import { MinMax } from '../../model/minmax';
import { valueOrDefault } from '../../util/utils';
import { CharacterExtractedStatMap, SlormancerStatsExtractorService } from './slormancer-stats-extractor.service';
import { SlormancerStatUpdaterService } from './slormancer-stats-updater.service';
import { SlormancerSynergyResolverService } from './slormancer-synergy-resolver.service';

export interface CharacterStatsBuildResult {
    unlockedAncestralLegacies: Array<number>;
    unresolvedSynergies: Array<SynergyResolveData>;
    stats: CharacterStats,
    changed:  {
        items: Array<EquipableItem>;
        ancestralLegacies: Array<AncestralLegacy>;
        skills: Array<Skill>;
        upgrades: Array<SkillUpgrade>;
        reapers: Array<Reaper>;
        attributes: Array<AttributeTraits>;
        activables: Array<Activable>;
    }
}

@Injectable()
export class SlormancerStatsService {

    constructor(private slormancerStatsExtractorService: SlormancerStatsExtractorService,
                private slormancerSynergyResolverService: SlormancerSynergyResolverService,
                private slormancerStatUpdaterService: SlormancerStatUpdaterService) { }
    
    private getMappingValues(sources: Array<CharacterStatMappingSource>, stats: CharacterExtractedStatMap, config: CharacterConfig)  {
        return sources
            .filter(source => source.condition === undefined || source.condition(config, stats))
            .map(source => {
                let result = stats[source.stat];
                const mult = source.multiplier ? source.multiplier(config, stats) : 1;
                if (result && mult !== 1) {
                    result = result.map(v => v * mult);
                }
                return result ? result : [];
            })
            .flat();
    }

    private buildCharacterStats(stats: CharacterExtractedStatMap, mappings: Array<CharacterStatMapping>, config: CharacterConfig): Array<CharacterStat> {
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
                }
            } as CharacterStat;
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
                    maxPercent: [],
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
                    maxPercent: [],
                    multiplier: []
                }
            });
        }
    }

    private hasSynergyValueChanged(synergy: SynergyResolveData): boolean {
        let result = true;

        if (typeof synergy.originalValue === typeof synergy.effect.synergy) {
            if (typeof synergy.originalValue === 'number') {
                result = synergy.originalValue !== synergy.effect.synergy;
            } else {
                result = synergy.originalValue.min !== (<MinMax>synergy.effect.synergy).min
                      || synergy.originalValue.max !== (<MinMax>synergy.effect.synergy).max;
            }
        }

        return result;
    }

    public getStats(character: Character, config: CharacterConfig): CharacterStatsBuildResult {
        const result: CharacterStatsBuildResult = {
            unlockedAncestralLegacies: [],
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
                attributes: [],
                activables: []
            }
        }
        const stats = this.slormancerStatsExtractorService.extractStats(character, config);
        
        result.stats.hero = this.buildCharacterStats(stats.heroStats, HERO_CHARACTER_STATS_MAPPING, config);

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

        result.unresolvedSynergies = this.slormancerSynergyResolverService.resolveSynergies(stats.synergies, result.stats.hero, config, stats.heroStats);
        result.unlockedAncestralLegacies = valueOrDefault(stats.heroStats['unlock_ancestral_legacy_max_rank'], []);

        this.slormancerSynergyResolverService.resolveIsolatedSynergies(stats.isolatedSynergies, result.stats.hero, stats.heroStats);

        console.log(stats.heroStats);
        // console.log(result);

        for (const synergy of [...stats.synergies, ...stats.isolatedSynergies]) {
            if (this.hasSynergyValueChanged(synergy)) {
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
                if (synergy.objectSource.activable) {
                    result.changed.activables.push(synergy.objectSource.activable);
                }
            }
        }

        return result;
    }
}