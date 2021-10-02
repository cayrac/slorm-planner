import { Injectable } from '@angular/core';

import {
    GLOBAL_MERGED_STATS_MAPPING,
    HERO_MERGED_STATS_MAPPING,
    MergedStatMapping,
    MergedStatMappingSource,
} from '../../constants/content/data/data-character-stats-mapping';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { Activable } from '../../model/content/activable';
import { AncestralLegacy } from '../../model/content/ancestral-legacy';
import { AttributeTraits } from '../../model/content/attribut-traits';
import { MergedStat, SynergyResolveData } from '../../model/content/character-stats';
import { HeroClass } from '../../model/content/enum/hero-class';
import { EquipableItem } from '../../model/content/equipable-item';
import { Reaper } from '../../model/content/reaper';
import { Skill } from '../../model/content/skill';
import { SkillUpgrade } from '../../model/content/skill-upgrade';
import { MinMax } from '../../model/minmax';
import { isDamageType, isEffectValueSynergy, valueOrDefault } from '../../util/utils';
import { ExtractedStatMap, SlormancerStatsExtractorService } from './slormancer-stats-extractor.service';
import { SlormancerStatUpdaterService } from './slormancer-stats-updater.service';
import { SlormancerSynergyResolverService } from './slormancer-synergy-resolver.service';

export interface CharacterStatsBuildResult {
    unlockedAncestralLegacies: Array<number>;
    unresolvedSynergies: Array<SynergyResolveData>;
    extractedStats: ExtractedStatMap,
    stats: Array<MergedStat>,
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

export interface SkillStatsBuildResult {
    unresolvedSynergies: Array<SynergyResolveData>;
    extractedStats: ExtractedStatMap,
    stats: Array<MergedStat>,
    changed: {
        skills: Array<Skill>;
        upgrades: Array<SkillUpgrade>;
    }
}

@Injectable()
export class SlormancerStatsService {

    constructor(private slormancerStatsExtractorService: SlormancerStatsExtractorService,
                private slormancerSynergyResolverService: SlormancerSynergyResolverService,
                private slormancerStatUpdaterService: SlormancerStatUpdaterService) { }
    
    private getMappingValues(sources: Array<MergedStatMappingSource>, stats: ExtractedStatMap, config: CharacterConfig)  {
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

    private buildMergedStats(stats: ExtractedStatMap, mappings: Array<MergedStatMapping>, config: CharacterConfig): Array<MergedStat> {
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
            } as MergedStat;
        });
    }

    private addConfigCharacterStats(stats: Array<MergedStat>, config: CharacterConfig) {
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

    private addSkillStats(stats: Array<MergedStat>, skills: Array<CharacterSkillAndUpgrades>) {
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

    public updateCharacterStats(character: Character, config: CharacterConfig, additionalItem: EquipableItem | null = null): CharacterStatsBuildResult {
        const result: CharacterStatsBuildResult = {
            unlockedAncestralLegacies: [],
            unresolvedSynergies: [],
            extractedStats: {},
            stats: [],
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
        const extractedStats = this.slormancerStatsExtractorService.extractCharacterStats(character, config, additionalItem);
        
        result.extractedStats = extractedStats.stats;
        result.stats = this.buildMergedStats(extractedStats.stats, GLOBAL_MERGED_STATS_MAPPING, config);

        this.addConfigCharacterStats(result.stats, config);
        this.addSkillStats(result.stats, character.skills);

        for (const stats of result.stats) {
            this.slormancerStatUpdaterService.updateStatTotal(stats);
        }

        result.unresolvedSynergies = this.slormancerSynergyResolverService.resolveSynergies(extractedStats.synergies, result.stats, config, extractedStats.stats);
        result.unlockedAncestralLegacies = valueOrDefault(extractedStats.stats['unlock_ancestral_legacy_max_rank'], []);

        this.slormancerSynergyResolverService.resolveIsolatedSynergies(extractedStats.isolatedSynergies, result.stats, extractedStats.stats);

        // console.log(extractedStats);
        // console.log(result);

        for (const synergy of [...extractedStats.synergies, ...extractedStats.isolatedSynergies]) {
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

    public updateSkillStats(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, config: CharacterConfig, characterExtractedStats: ExtractedStatMap): SkillStatsBuildResult {
        const result: SkillStatsBuildResult = {
            unresolvedSynergies: [],
            extractedStats: {},
            stats: [],
            changed: {
                skills: [],
                upgrades: []
            }
        }

        const extractedStats = this.slormancerStatsExtractorService.extractSkillStats(character, skillAndUpgrades, config, characterExtractedStats);

        // Spécial changes
        if (character.heroClass === HeroClass.Huntress && skillAndUpgrades.skill.id === 4) {
            const physicalDamage = extractedStats.stats['damage_type_to_elemental'] === undefined;
            
            const damageValues = skillAndUpgrades.skill.values
                .filter(isEffectValueSynergy)
                .filter(value => isDamageType(value.stat));

            for (const damageValue of damageValues) {
                damageValue.stat = physicalDamage ? 'physical_damage' : 'elemental_damage';
                damageValue.source = physicalDamage ? 'physical_damage' : 'elemental_damage';
            }
        }

        result.extractedStats = extractedStats.stats;
        result.stats = this.buildMergedStats(extractedStats.stats, [...GLOBAL_MERGED_STATS_MAPPING, ...HERO_MERGED_STATS_MAPPING[character.heroClass]], config);
        
        for (const stats of result.stats) {
            this.slormancerStatUpdaterService.updateStatTotal(stats);
        }
        
        result.unresolvedSynergies = this.slormancerSynergyResolverService.resolveSynergies(extractedStats.synergies, result.stats, config, extractedStats.stats);

        this.slormancerSynergyResolverService.resolveIsolatedSynergies(extractedStats.isolatedSynergies, result.stats, extractedStats.stats);

        for (const synergy of [...extractedStats.synergies, ...extractedStats.isolatedSynergies]) {
            if (this.hasSynergyValueChanged(synergy)) {
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