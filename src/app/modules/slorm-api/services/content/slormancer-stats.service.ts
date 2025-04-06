import { Injectable } from '@angular/core';

import { PRIME_TOTEM_SKILL } from '../../constants';
import {
    GLOBAL_MERGED_STATS_MAPPING,
    HERO_MERGED_STATS_MAPPING,
    INNER_FIRE_CHANCE_MAPPING,
    INNER_FIRE_DAMAGE_MAPPING,
    MergedStatMapping,
    OVERDRIVE_CHANCE_MAPPING,
    OVERDRIVE_DAMAGE_MAPPING,
    REAPER_STATS_MAPPING,
    SKILL_MERGED_STATS_MAPPING,
} from '../../constants/content/data/data-character-stats-mapping';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { Activable } from '../../model/content/activable';
import { AncestralLegacy } from '../../model/content/ancestral-legacy';
import { AttributeTraits } from '../../model/content/attribute-traits';
import { MergedStat, SynergyResolveData } from '../../model/content/character-stats';
import { HeroClass } from '../../model/content/enum/hero-class';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { EquipableItem } from '../../model/content/equipable-item';
import { Mechanic } from '../../model/content/mechanic';
import { Reaper } from '../../model/content/reaper';
import { Rune } from '../../model/content/rune';
import { Skill } from '../../model/content/skill';
import { SkillUpgrade } from '../../model/content/skill-upgrade';
import { MinMax } from '../../model/minmax';
import { getAllLegendaryEffects, isDamageType, isEffectValueSynergy, isNotNullOrUndefined, valueOrDefault } from '../../util/utils';
import { SlormancerMergedStatUpdaterService } from './slormancer-merged-stat-updater.service';
import { SlormancerReaperService } from './slormancer-reaper.service';
import { SlormancerStatMappingService } from './slormancer-stat-mapping.service';
import { ExtractedStatMap, ExtractedStats, SlormancerStatsExtractorService } from './slormancer-stats-extractor.service';
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
        mechanics: Array<Mechanic>;
        runes: Array<Rune>;
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
                private slormancerStatUpdaterService: SlormancerMergedStatUpdaterService,
                private slormancerStatMappingService: SlormancerStatMappingService,
                private slormancerReaperService: SlormancerReaperService) { }

    private hasSynergyValueChanged(synergy: SynergyResolveData): boolean {
        let result = true;

        if (typeof synergy.originalValue === typeof synergy.effect.displaySynergy) {
            if (typeof synergy.originalValue === 'number') {
                result = synergy.originalValue !== synergy.effect.displaySynergy;
            } else {
                result = synergy.originalValue.min !== (<MinMax>synergy.effect.displaySynergy).min
                      || synergy.originalValue.max !== (<MinMax>synergy.effect.displaySynergy).max;
            }
        }

        return result;
    }

    private applyReaperSpecialChanges(character: Character, config: CharacterConfig) {
        if (character.reaper.id === 84) {
            const activable = character.reaper.activables.find(activable => activable.id === 21);
            
            if (activable !== undefined) {
                const hasTotem = activable.genres.includes(SkillGenre.Totem);

                if (config.show_temple_keeper_as_totem && !hasTotem) {
                    activable.genres.push(SkillGenre.Totem);
                } else if (!config.show_temple_keeper_as_totem && hasTotem) {
                    activable.genres.splice(activable.genres.indexOf(SkillGenre.Totem), 1);
                }

            }
        }
    }

    private applyAuthorityChanges(character: Character, mapping: MergedStatMapping[], stats: ExtractedStatMap) {
        if (getAllLegendaryEffects(character.gear).some(legendaryEffect => legendaryEffect.id === 96)) {
            const authorityInnerFireChanceLower = 'authority_inner_fire_chance_lower' in stats;
            const authorityOverdriveChanceLower = 'authority_overdrive_chance_lower' in stats
            const authorityInnerFireHigher = 'authority_inner_fire_damage_higher' in stats
            const authorityOverdriveDamageHigher = 'authority_overdrive_damage_higher' in stats

            if (authorityInnerFireChanceLower || authorityOverdriveChanceLower || authorityInnerFireHigher || authorityOverdriveDamageHigher) {
                // apply authority meta changes
                const innerFireDamage = mapping.find(mergedStat => mergedStat.stat === 'inner_fire_damage');
                const overdriveDamage = mapping.find(mergedStat => mergedStat.stat === 'overdrive_damage');
                const innerFireChance = mapping.find(mergedStat => mergedStat.stat === 'inner_fire_chance');
                const overdriveChance = mapping.find(mergedStat => mergedStat.stat === 'overdrive_chance');
                const innerOrOverdriveDamageHigh = mapping.find(mergedStat => mergedStat.stat === 'inner_or_overdrive_damage_high');

    
                if (innerFireChance && overdriveChance) {
                    if (authorityInnerFireChanceLower) {
                        overdriveChance.source = { ...INNER_FIRE_CHANCE_MAPPING.source };
                    } else if (authorityOverdriveChanceLower) {
                        innerFireChance.source = { ...OVERDRIVE_CHANCE_MAPPING.source };
                    }
                }
                if (innerFireDamage && overdriveDamage && innerOrOverdriveDamageHigh) {
                    if (authorityInnerFireHigher) {
                        overdriveDamage.source = { 
                            ...INNER_FIRE_DAMAGE_MAPPING.source,
                            flat: overdriveDamage.source.flat
                        };
                        innerOrOverdriveDamageHigh.source.flat = [
                            { stat: 'hundred' },
                            ...INNER_FIRE_DAMAGE_MAPPING.source.percent
                        ];
                        innerOrOverdriveDamageHigh.source.multiplier = [ ...INNER_FIRE_DAMAGE_MAPPING.source.multiplier ];
                    } else if (authorityOverdriveDamageHigher) {
                        innerFireDamage.source = {
                            ...OVERDRIVE_DAMAGE_MAPPING.source,
                            flat: innerFireDamage.source.flat
                        };
                        innerOrOverdriveDamageHigh.source.flat = [ 
                            { stat: 'hundred' },
                            ...OVERDRIVE_DAMAGE_MAPPING.source.percent
                        ];
                        innerOrOverdriveDamageHigh.source.multiplier = [ ...OVERDRIVE_DAMAGE_MAPPING.source.multiplier ];
                    }
                }
            }
        }
    }

    public updateCharacterStats(character: Character, config: CharacterConfig, additionalItem: EquipableItem | null = null, additionalRunes: Array<Rune> = [], additionalStats: ExtractedStatMap = {}): CharacterStatsBuildResult {
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
                activables: [],
                mechanics: [],
                runes: [],
            }
        }


        const mapping = this.getStatsMapping(character);
        this.applyAuthorityChanges(character, mapping, additionalStats);

        const extractedStats = this.slormancerStatsExtractorService.extractCharacterStats(character, config, additionalItem, additionalRunes, mapping, additionalStats);
        
        this.applyReaperSpecialChanges(character, config);


        result.extractedStats = extractedStats.stats;
        result.stats = this.slormancerStatMappingService.buildMergedStats(extractedStats.stats, mapping, config);
        
        if (character.ultimatum !== null && !character.ultimatum.locked) {
            this.slormancerStatMappingService.applyUltimatum(result.stats, mapping, character.ultimatum, config, result.extractedStats);
        }

        for (const stats of result.stats) {
            this.slormancerStatUpdaterService.updateStatTotal(stats);
        }

        const synergyResult = this.slormancerSynergyResolverService.resolveSynergies(extractedStats.synergies, result.stats, extractedStats.stats, config);
        result.unresolvedSynergies = synergyResult.unresolved;
        result.resolvedSynergies = synergyResult.resolved;
        result.unlockedAncestralLegacies = valueOrDefault(extractedStats.stats['unlock_ancestral_legacy_max_rank'], []).map(v => v.value);

        this.slormancerSynergyResolverService.resolveIsolatedSynergies(extractedStats.isolatedSynergies, result.stats, extractedStats.stats);

        for (const synergy of [...extractedStats.synergies, ...extractedStats.isolatedSynergies]) {
            if (this.hasSynergyValueChanged(synergy)) {
                if ('ancestralLegacy' in synergy.objectSource) {
                    result.changed.ancestralLegacies.push(synergy.objectSource.ancestralLegacy);
                } else if ('attribute' in synergy.objectSource) {
                    result.changed.attributes.push(synergy.objectSource.attribute);
                } else if ('item' in synergy.objectSource) {
                    result.changed.items.push(synergy.objectSource.item);
                } else if ('reaper' in synergy.objectSource) {
                    result.changed.reapers.push(synergy.objectSource.reaper);
                } else if ('skill' in synergy.objectSource) {
                    result.changed.skills.push(synergy.objectSource.skill);
                } else if ('upgrade' in synergy.objectSource) {
                    result.changed.upgrades.push(synergy.objectSource.upgrade);
                } else if ('activable' in synergy.objectSource) {
                    result.changed.activables.push(synergy.objectSource.activable);
                } else if ('mechanic' in synergy.objectSource) {
                    result.changed.mechanics.push(synergy.objectSource.mechanic);
                } else if ('rune' in synergy.objectSource) {
                    result.changed.runes.push(synergy.objectSource.rune);
                }
            }
        }

        return result;
    }

    private applySkillSpecialChanges(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, config: CharacterConfig, extractedStats: ExtractedStats, result: SkillStatsBuildResult) {
        skillAndUpgrades.skill.manaCostType = skillAndUpgrades.skill.baseCostType;
        skillAndUpgrades.skill.genres = skillAndUpgrades.skill.baseGenres.slice(0);
        
        if (extractedStats.stats['skill_is_projectile'] !== undefined && !skillAndUpgrades.skill.genres.includes(SkillGenre.Projectile)) {
            skillAndUpgrades.skill.genres.push(SkillGenre.Projectile)
        }
        if (extractedStats.stats['skill_is_fast'] !== undefined && !skillAndUpgrades.skill.genres.includes(SkillGenre.Fast)) {
            skillAndUpgrades.skill.genres.push(SkillGenre.Fast)
        }
        if (extractedStats.stats['skill_is_no_longer_fast'] !== undefined && skillAndUpgrades.skill.genres.includes(SkillGenre.Fast)) {
            const index = skillAndUpgrades.skill.genres.findIndex(genre => genre === SkillGenre.Fast)
            if (index !== -1) {
                skillAndUpgrades.skill.genres.splice(index, 1);
            }
        }

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

        if (PRIME_TOTEM_SKILL[character.heroClass] === skillAndUpgrades.skill.id && config.add_totem_tag_to_prime_totem_skills && [71, 72].includes(character.reaper.id) && !skillAndUpgrades.skill.genres.includes(SkillGenre.Totem)) {
            skillAndUpgrades.skill.genres.push(SkillGenre.Totem);
        }
    }

    private getStatsMapping(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades | null = null): MergedStatMapping[] {
        let result = [
            ...GLOBAL_MERGED_STATS_MAPPING,
            ...HERO_MERGED_STATS_MAPPING[character.heroClass]
        ]
        
        if (skillAndUpgrades) {
            const skillMapping = SKILL_MERGED_STATS_MAPPING[character.heroClass][skillAndUpgrades.skill.id];
            if (skillMapping) {
                result.push(...skillMapping);
            }
        }

        const reaperParents = this.slormancerReaperService.getReaperParentIds(character.reaper.id);
        const reaperMapping = reaperParents
            .map(reaperId => REAPER_STATS_MAPPING[reaperId])
            .filter(isNotNullOrUndefined)
            .flat();
        if (reaperMapping.length > 0) {
            result.push(...reaperMapping);
        }

        return result.map(mapping => ({
            ...mapping,
            source: {
                flat: mapping.source.flat.map(v => ({ ...v })),
                max: mapping.source.max.map(v => ({ ...v })),
                maxMultiplier: mapping.source.maxMultiplier.map(v => ({ ...v })),
                maxPercent: mapping.source.maxPercent.map(v => ({ ...v })),
                multiplier: mapping.source.multiplier.map(v => ({ ...v })),
                percent: mapping.source.percent.map(v => ({ ...v })),
            }
        }));

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
        };
        const mapping = this.getStatsMapping(character, skillAndUpgrades);
        const extractedStats = this.slormancerStatsExtractorService.extractSkillStats(skillAndUpgrades, characterStats, mapping, config);
        this.applySkillSpecialChanges(character, skillAndUpgrades, config, extractedStats, result);
        this.slormancerStatsExtractorService.extractSkillInfoStats(character, skillAndUpgrades, extractedStats);

        result.extractedStats = extractedStats.stats;
        result.stats = this.slormancerStatMappingService.buildMergedStats(extractedStats.stats, mapping, config);
        
        if (character.ultimatum !== null && !character.ultimatum.locked) {
            this.slormancerStatMappingService.applyUltimatum(result.stats, mapping, character.ultimatum, config, result.extractedStats);
        }
        
        for (const stats of result.stats) {
            this.slormancerStatUpdaterService.updateStatTotal(stats);
        }

        const synergies = extractedStats.synergies.filter(synergy => synergy.effect.stat !== 'berzerker_additional_damage');
        const synergyResult = this.slormancerSynergyResolverService.resolveSynergies(synergies, result.stats, extractedStats.stats, config);
        result.unresolvedSynergies = synergyResult.unresolved;

        this.slormancerSynergyResolverService.resolveIsolatedSynergies(extractedStats.isolatedSynergies, result.stats, extractedStats.stats);

        for (const synergy of [...extractedStats.synergies, ...extractedStats.isolatedSynergies]) {
            if (this.hasSynergyValueChanged(synergy)) {
                if ('skill' in synergy.objectSource) {
                    result.changed.skills.push(synergy.objectSource.skill);
                } else if ('upgrade' in synergy.objectSource) {
                    result.changed.upgrades.push(synergy.objectSource.upgrade);
                }
            }
        }

        return result;
    }
}