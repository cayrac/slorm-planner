import { Injectable } from '@angular/core';

import {
    GLOBAL_MERGED_STATS_MAPPING,
    HERO_MERGED_STATS_MAPPING,
    SKILL_MERGED_STATS_MAPPING,
} from '../../constants/content/data/data-character-stats-mapping';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { Activable } from '../../model/content/activable';
import { AncestralLegacy } from '../../model/content/ancestral-legacy';
import { AttributeTraits } from '../../model/content/attribut-traits';
import { MergedStat, SynergyResolveData } from '../../model/content/character-stats';
import { HeroClass } from '../../model/content/enum/hero-class';
import { SkillCostType } from '../../model/content/enum/skill-cost-type';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { EquipableItem } from '../../model/content/equipable-item';
import { Reaper } from '../../model/content/reaper';
import { Skill } from '../../model/content/skill';
import { SkillUpgrade } from '../../model/content/skill-upgrade';
import { MinMax } from '../../model/minmax';
import { isDamageType, isEffectValueSynergy, valueOrDefault } from '../../util/utils';
import { SlormancerStatMappingService } from './slormancer-stat-mapping.service';
import { ExtractedStatMap, ExtractedStats, SlormancerStatsExtractorService } from './slormancer-stats-extractor.service';
import { SlormancerStatUpdaterService } from './slormancer-stats-updater.service';
import { SlormancerSynergyResolverService } from './slormancer-synergy-resolver.service';

export interface CharacterStatsBuildResult {
    unlockedAncestralLegacies: Array<number>;
    unresolvedSynergies: Array<SynergyResolveData>;
    resolvedSynergies: Array<SynergyResolveData>;
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
                private slormancerStatUpdaterService: SlormancerStatUpdaterService,
                private slormancerStatMappingService: SlormancerStatMappingService) { }

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
                    maxMultiplier: [],
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
                total: sau.skill.level,
                values: {
                    flat: [sau.skill.level],
                    max: [],
                    percent: [],
                    maxPercent: [],
                    multiplier: [],
                    maxMultiplier: [],
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
            resolvedSynergies: [],
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
        const mapping = [...GLOBAL_MERGED_STATS_MAPPING, ...HERO_MERGED_STATS_MAPPING[character.heroClass]];
        const extractedStats = this.slormancerStatsExtractorService.extractCharacterStats(character, config, additionalItem, mapping);
        
        result.extractedStats = extractedStats.stats;
        result.stats = this.slormancerStatMappingService.buildMergedStats(extractedStats.stats, mapping, config);

        this.addConfigCharacterStats(result.stats, config);

        for (const stats of result.stats) {
            this.slormancerStatUpdaterService.updateStatTotal(stats);
        }

        const synergyResult = this.slormancerSynergyResolverService.resolveSynergies(extractedStats.synergies, result.stats, extractedStats.stats, config);
        result.unresolvedSynergies = synergyResult.unresolved;
        result.resolvedSynergies = synergyResult.resolved;
        result.unlockedAncestralLegacies = valueOrDefault(extractedStats.stats['unlock_ancestral_legacy_max_rank'], []);

        this.slormancerSynergyResolverService.resolveIsolatedSynergies(extractedStats.isolatedSynergies, result.stats, extractedStats.stats);

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

    private applySkillSpecialChanges(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, config: CharacterConfig, extractedStats: ExtractedStats) {
        skillAndUpgrades.skill.costType = skillAndUpgrades.skill.baseCostType;
        skillAndUpgrades.skill.genres = skillAndUpgrades.skill.baseGenres.slice(0);
        
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

        if (character.heroClass === HeroClass.Mage) {
            if (extractedStats.stats['cast_by_clone'] !== undefined) {
                skillAndUpgrades.skill.genres.push(SkillGenre.Totem);
            }

            let newMagicSchool: SkillGenre | null = null; // config
            if (character.heroClass === HeroClass.Mage && skillAndUpgrades.skill.id === 8) {
                newMagicSchool = config.attunment_pulse_current_school;
            } else if (extractedStats.stats['skill_is_now_temporal'] !== undefined) {
                newMagicSchool = SkillGenre.Temporal;
            } else if (extractedStats.stats['skill_is_now_obliteration'] !== undefined) {
                newMagicSchool = SkillGenre.Obliteration;
            }
    
            if (newMagicSchool !== null) {
                const index = skillAndUpgrades.skill.genres.findIndex(genre => genre === SkillGenre.Arcanic || genre === SkillGenre.Temporal || genre === SkillGenre.Obliteration)
                if (index !== -1) {
                    skillAndUpgrades.skill.genres.splice(index, 1, newMagicSchool);
                }
            }
        }

        if (extractedStats.stats['no_longer_cost_per_second'] !== undefined) {
            if (skillAndUpgrades.skill.costType === SkillCostType.ManaSecond) {
                skillAndUpgrades.skill.costType = SkillCostType.Mana;
            } else if (skillAndUpgrades.skill.costType === SkillCostType.LifeSecond) {
                skillAndUpgrades.skill.costType = SkillCostType.Life;
            }
        }
    }

    public updateSkillStats(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, config: CharacterConfig, characterStats: CharacterStatsBuildResult): SkillStatsBuildResult {
        const result: SkillStatsBuildResult = {
            unresolvedSynergies: [],
            extractedStats: {},
            stats: [],
            changed: {
                skills: [],
                upgrades: []
            }
        }
        const mapping = [...GLOBAL_MERGED_STATS_MAPPING, ...HERO_MERGED_STATS_MAPPING[character.heroClass], ...valueOrDefault(SKILL_MERGED_STATS_MAPPING[character.heroClass][skillAndUpgrades.skill.id], []) ];
        const extractedStats = this.slormancerStatsExtractorService.extractSkillStats(skillAndUpgrades, characterStats, mapping);
        this.applySkillSpecialChanges(character, skillAndUpgrades, config, extractedStats)
        this.slormancerStatsExtractorService.extractSkillInfoStats(character, skillAndUpgrades, extractedStats);

        result.extractedStats = extractedStats.stats;
        result.stats = this.slormancerStatMappingService.buildMergedStats(extractedStats.stats, mapping, config);
        this.addSkillStats(result.stats, character.skills);

        for (const stats of result.stats) {
            this.slormancerStatUpdaterService.updateStatTotal(stats);
        }

        if (skillAndUpgrades.skill.id === 10) {
            console.log('avant synergies : ', result.stats.find(a => a.stat == 'cooldown_time')?.total);
        }

        const synergyResult = this.slormancerSynergyResolverService.resolveSynergies(extractedStats.synergies, result.stats, extractedStats.stats, config);
        result.unresolvedSynergies = synergyResult.unresolved;

        if (skillAndUpgrades.skill.id === 10) {
            console.log('apres synergies : ', result.stats.find(a => a.stat == 'cooldown_time')?.total);
        }

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