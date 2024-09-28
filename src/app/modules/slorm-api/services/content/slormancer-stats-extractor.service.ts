import { Injectable } from '@angular/core';

import {
    ARCANE_BOND_DAMAGE_FROM_MANA_SPENT,
    ARCANE_BOND_DAMAGE_FROM_MAX_MANA,
    ARCANE_CLONE_ATTACK_SPEED_REDUCTION,
    ASTRAL_METEOR_DAMAGE_PERCENT,
    ASTRAL_RETRIBUTION_DAMAGE_PERCENT,
    ATTACK_SPEED_PER_ARCANIC_EMBLEM,
    ATTACK_SPEED_PER_DELIGHTED_STACK,
    COOLDOWN_REDUCTION_PER_DELIGHTED_STACK,
    COOLDOWN_REDUCTION_PER_TEMPORAL_EMBLEM,
    DAMAGE_PER_OBLITERATION_EMBLEM,
    DELIGHTED_VALUE,
    POISON_DAMAGE_PERCENT,
    RAVENOUS_DAGGER_DAMAGE_PERCENT,
    REMNANT_DAMAGE_REDUCTION,
    TRAP_DAMAGE_PERCENT,
    UNITY_REAPERS,
} from '../../constants/common';
import { MAX_MANA_MAPPING, MergedStatMapping } from '../../constants/content/data/data-character-stats-mapping';
import { Activable, AncestralLegacy, AncestralLegacyType, GameHeroesData, MinMax } from '../../model';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { SynergyResolveData } from '../../model/content/character-stats';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { ALL_ATTRIBUTES } from '../../model/content/enum/attribute';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { EquipableItemBase } from '../../model/content/enum/equipable-item-base';
import { ALL_GEAR_SLOT_VALUES } from '../../model/content/enum/gear-slot';
import { HeroClass } from '../../model/content/enum/hero-class';
import { ALL_REAPER_SMITH } from '../../model/content/enum/reaper-smith';
import { ALL_SKILL_COST_TYPES, SkillCostType } from '../../model/content/enum/skill-cost-type';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { TraitLevel } from '../../model/content/enum/trait-level';
import { EquipableItem } from '../../model/content/equipable-item';
import { Mechanic } from '../../model/content/mechanic';
import { Rune } from '../../model/content/rune';
import { RuneType } from '../../model/content/rune-type';
import { SkillType } from '../../model/content/skill-type';
import { Entity } from '../../model/entity';
import { EntityValue } from '../../model/entity-value';
import { add, round } from '../../util';
import { effectValueSynergy } from '../../util/effect-value.util';
import { synergyResolveData } from '../../util/synergy-resolver.util';
import { isDamageType, isEffectValueSynergy, isNotNullOrUndefined, minAndMax, valueOrDefault } from '../../util/utils';
import { SlormancerClassMechanicService } from './slormancer-class-mechanic.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerMergedStatUpdaterService } from './slormancer-merged-stat-updater.service';
import { SlormancerReaperService } from './slormancer-reaper.service';
import { SlormancerSkillService } from './slormancer-skill.service';
import { SlormancerStatMappingService } from './slormancer-stat-mapping.service';
import { CharacterStatsBuildResult } from './slormancer-stats.service';

export declare type ExtractedStatMap = { [key: string]: Array<EntityValue<number>> }

export interface ExtractedStats {
    stats: ExtractedStatMap;
    synergies: Array<SynergyResolveData>;
    isolatedSynergies: Array<SynergyResolveData>;
}

@Injectable()
export class SlormancerStatsExtractorService {

    private readonly PHYSICAL_ELEMENTAL_STATS = [
        'min_elemental_damage_add',
        //'elemental_damage_percent',
        'min_basic_damage_add',
        //'basic_damage_percent',
    ];

    constructor(private slormancerStatMappingService: SlormancerStatMappingService,
                private slormancerMergedStatUpdaterService: SlormancerMergedStatUpdaterService,
                private slormancerDataService: SlormancerDataService,
                private slormancerReaperService: SlormancerReaperService,
                private slormancerSkillService: SlormancerSkillService,
                private slormancerClassMechanicService: SlormancerClassMechanicService,
        ) { }

    private getSynergyStatsItWillUpdate(stat: string, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig, stats: ExtractedStatMap): Array<{ stat: string, mapping?: MergedStatMapping }> {
        let result: Array<{ stat: string, mapping?: MergedStatMapping }> = [];

        for (const mapping of mergedStatMapping) {
            if (mapping.source.flat.some(s => s.stat === stat && (s.condition === undefined || s.condition(config, stats)) )
            || mapping.source.max.some(s => s.stat === stat && (s.condition === undefined || s.condition(config, stats)))
            || mapping.source.percent.some(s => s.stat === stat && (s.condition === undefined || s.condition(config, stats)))
            || mapping.source.multiplier.some(s => s.stat === stat && (s.condition === undefined || s.condition(config, stats)))) {
                result.push({ stat: mapping.stat, mapping });
            }
        }

        if (result.length === 0) {
            result.push({ stat });
        }

        return result;
    }

    private addDefaultSynergies(character: Character, config: CharacterConfig, extractedStats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        const addReaperToInnerFire = extractedStats.stats['reaper_added_to_inner_fire'] !== undefined
        const splitReaperToPhysicalAndElement = extractedStats.stats['reaper_split_to_physical_and_element'] !== undefined
        const addReaperToElements = extractedStats.stats['reaper_added_to_elements'] !== undefined
        const addReaperToSkillAndElements = extractedStats.stats['reaper_added_to_skill_and_elements'] !== undefined
        const overdriveDamageBasedOnSkillDamage = extractedStats.stats['overdrive_damage_based_on_skill_damage'] !== undefined

        let mapping = mergedStatMapping.find(m => m.stat === 'physical_damage');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'basic_to_physical_damage', EffectValueValueType.Unknown, undefined, null, true, true, true, true), -1, { synergy: 'Basic damages' }, [ { stat: 'physical_damage', mapping } ], true));
                
        mapping = mergedStatMapping.find(m => m.stat === 'sum_all_resistances');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'armor', 'sum_all_resistances_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Armor' }, [ { stat: 'sum_all_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'dodge', 'sum_all_resistances_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Dodge' }, [ { stat: 'sum_all_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_resist', 'sum_all_resistances_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Elemental resistance' }, [ { stat: 'sum_all_resistances', mapping } ]));
        
        mapping = mergedStatMapping.find(m => m.stat === 'sum_reduced_resistances');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_melee', 'sum_reduced_resistances_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Reduce on melee' }, [ { stat: 'sum_reduced_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_projectile', 'sum_reduced_resistances_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Reduce on projectile' }, [ { stat: 'sum_reduced_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_area', 'sum_reduced_resistances_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Reduce on area' }, [ { stat: 'sum_reduced_resistances', mapping } ]));
                
        mapping = mergedStatMapping.find(m => m.stat === 'skill_elem_damage');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'skill_elem_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Skill damage' }, [ { stat: 'skill_elem_damage', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'skill_elem_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Elemental damage' }, [ { stat: 'skill_elem_damage', mapping } ]));
        
        mapping = mergedStatMapping.find(m => m.stat === 'overdrive_damage');
        if (overdriveDamageBasedOnSkillDamage) {
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'overdrive_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Skill damage' }, [ { stat: 'overdrive_damage', mapping } ], true));
        } else {
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'overdrive_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Raw damage' }, [ { stat: 'overdrive_damage', mapping } ], true));
        }
 
        mapping = mergedStatMapping.find(m => m.stat === 'inner_fire_damage');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'inner_fire_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Raw damage' }, [ { stat: 'inner_fire_damage', mapping } ], true));

        if (character.heroClass === HeroClass.Warrior) {
            mapping = mergedStatMapping.find(m => m.stat === 'astral_retribution_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(ASTRAL_RETRIBUTION_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'astral_retribution_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Reaper damage'}, [ { stat: 'astral_retribution_damage', mapping } ]));
            mapping = mergedStatMapping.find(m => m.stat === 'astral_meteor_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(ASTRAL_METEOR_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'astral_meteor_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Skill damage' }, [ { stat: 'astral_meteor_damage', mapping } ]));
        }

        if (character.heroClass === HeroClass.Mage) {
            mapping = mergedStatMapping.find(m => m.stat === 'arcane_bond_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(ARCANE_BOND_DAMAGE_FROM_MANA_SPENT, 0, EffectValueUpgradeType.None, false, 'mana_lost_last_second', 'arcane_bond_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Mana lost last second' }, [ { stat: 'arcane_bond_damage', mapping } ]));
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(ARCANE_BOND_DAMAGE_FROM_MAX_MANA, 0, EffectValueUpgradeType.None, false, 'max_mana', 'arcane_bond_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Mana lost last second' }, [ { stat: 'arcane_bond_damage', mapping } ]));
            // reduced by percent_restored_mana_as_arcane_bond_damage
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(ARCANE_BOND_DAMAGE_FROM_MANA_SPENT, 0, EffectValueUpgradeType.None, false, 'mana_gained_last_second', 'arcane_bond_damage_add_from_restored_mana', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Mana gained last second' }, [ { stat: 'arcane_bond_damage', mapping } ]));
        }
        
        if (character.heroClass === HeroClass.Huntress) {
            mapping = mergedStatMapping.find(m => m.stat === 'poison_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(POISON_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'poison_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Skill damage' }, [ { stat: 'poison_damage', mapping } ]));
            mapping = mergedStatMapping.find(m => m.stat === 'ravenous_dagger_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(RAVENOUS_DAGGER_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'ravenous_dagger_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Reaper damage' }, [ { stat: 'ravenous_dagger_damage', mapping } ]));
            mapping = mergedStatMapping.find(m => m.stat === 'trap_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(TRAP_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'trap_damage_add', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Skill damage' }, [ { stat: 'trap_damage', mapping } ]));
        }
        
        if (character.reaper.id === 5) {
            let indirect_defense_max_stacks = 0;

            if (extractedStats.stats['indirect_defense_max_stacks'] && extractedStats.stats['indirect_defense_max_stacks'][0]) {
                indirect_defense_max_stacks = extractedStats.stats['indirect_defense_max_stacks'][0].value;
            }
            
            const indirect_defense = 100 - Math.max(Math.min(indirect_defense_max_stacks, config.indirect_defense_stacks), 0);
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(indirect_defense, 0, EffectValueUpgradeType.None, false, 'max_health', 'indirect_defense', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Max health' }, [ { stat: 'indirect_defense', mapping } ]));
        }

        if (addReaperToSkillAndElements) {
            mapping = mergedStatMapping.find(m => m.stat === 'elemental_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_elemental_damage', EffectValueValueType.Unknown, undefined, null, true, true, true, true), -1, { synergy: 'Reaper damages' }, [ { stat: 'elemental_damage', mapping } ]));
            mapping = mergedStatMapping.find(m => m.stat === 'physical_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage', EffectValueValueType.Unknown, undefined, null, true, true, true, true), -1, { synergy: 'Reaper damages' }, [ { stat: 'physical_damage', mapping } ]));
        } else if (addReaperToInnerFire) {
            mapping = mergedStatMapping.find(m => m.stat === 'inner_fire_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'inner_fire_damage_add_extra', EffectValueValueType.Unknown, undefined, null, true, true, true, true), -1, { synergy: 'Reaper damages' }, [ { stat: 'inner_fire_damage', mapping } ]));
        } else if (splitReaperToPhysicalAndElement) {
            mapping = mergedStatMapping.find(m => m.stat === 'elemental_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(50, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_elemental_damage', EffectValueValueType.Unknown, undefined, null, true, true, true, true), -1, { synergy: 'Reaper damages' }, [ { stat: 'elemental_damage', mapping } ]));
            mapping = mergedStatMapping.find(m => m.stat === 'physical_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(50, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage', EffectValueValueType.Unknown, undefined, null, true, true, true, true), -1, { synergy: 'Reaper damages' }, [ { stat: 'physical_damage', mapping } ]));
            if (addReaperToElements) {
                mapping = mergedStatMapping.find(m => m.stat === 'elemental_damage');
                extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_elemental_damage', EffectValueValueType.Unknown, undefined, null, true, true, true, true), -1, { synergy: 'Reaper damages (bug ?)' }, [ { stat: 'elemental_damage', mapping } ]));
                mapping = mergedStatMapping.find(m => m.stat === 'physical_damage');
                extractedStats.synergies.push(synergyResolveData(effectValueSynergy(-50, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage', EffectValueValueType.Unknown, undefined, null, true, true, true, true), -1, { synergy: 'Reaper damages (bug ?)' }, [ { stat: 'physical_damage', mapping } ]));
            }
        } else if (addReaperToElements) {
            let mapping = mergedStatMapping.find(m => m.stat === 'elemental_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_elemental_damage', EffectValueValueType.Unknown, undefined, null, true, true, true, true), -1, { synergy: 'Reaper damages' }, [ { stat: 'elemental_damage', mapping } ]));
        } else {
            let mapping = mergedStatMapping.find(m => m.stat === 'physical_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage', EffectValueValueType.Unknown, undefined, null, true, true, true, true), -1, { synergy: 'Reaper damages' }, [ { stat: 'physical_damage', mapping } ]));
        }

        return true;
    }

    private addCharacterValues(character: Character, config: CharacterConfig, stats: ExtractedStats) {
        const activables = this.getAllActiveActivables(character);
        this.addStat(stats.stats, 'half_level', character.level / 2, { character });
        this.addStat(stats.stats, 'remnant_damage_reduction_mult', -REMNANT_DAMAGE_REDUCTION, { synergy: 'Remnant base damage reduction' });
        this.addStat(stats.stats, 'arcane_clone_attack_speed_global_mult', ARCANE_CLONE_ATTACK_SPEED_REDUCTION, { synergy: 'Arcane clone base attack speed reduction' });

        if (character.might.ancestral > 0) {
            this.addStat(stats.stats, 'min_elemental_damage_add', character.might.ancestral, { might: 'Ancestral might' });
        }
        if (character.might.skill > 0) {
            this.addStat(stats.stats, 'min_basic_damage_add', character.might.skill, { might: 'Skill might' });
        }

        const supportSkills = [ character.skills[0], character.skills[1], character.skills[2] ].filter(isNotNullOrUndefined);
        this.addStat(stats.stats, 'total_mastery_support', supportSkills.reduce((total, skill) => total + skill.skill.level, 0), { character })
        this.addStat(stats.stats, 'mastery_secondary', character.secondarySkill === null ? 0 : character.secondarySkill.level, character.secondarySkill === null ? { character } : { skill: character.secondarySkill })
        const auraSkills = activables.filter(skill => skill.genres.includes(SkillGenre.Aura));
        this.addStat(stats.stats, 'active_aura_count', auraSkills.length, { character });
        const equippedActivables = [
            character.activable1,
            character.activable2,
            character.activable3,
            character.activable4,
        ].filter(isNotNullOrUndefined);
        const equippedAuraSkills = auraSkills.filter(skill => equippedActivables.some(equipped => equipped.name === skill.name));
        this.addStat(stats.stats, 'equipped_active_aura_count', equippedAuraSkills.length, { character });

        if (character.heroClass === HeroClass.Mage) {
            const maxedUpgrades = typeof config.maxed_upgrades === 'number'
                ? config.maxed_upgrades
                : this.slormancerSkillService.getNumberOfMaxedUpgrades(character);
            this.addStat(stats.stats, 'maxed_upgrades', maxedUpgrades, { synergy: 'Number of maxed upgrades' });

            this.addStat(stats.stats, 'base_attack_speed_per_arcanic_emblem', ATTACK_SPEED_PER_ARCANIC_EMBLEM, { synergy: 'Arcanic emblem' });
            this.addStat(stats.stats, 'base_cooldown_reduction_per_temporal_emblem', COOLDOWN_REDUCTION_PER_TEMPORAL_EMBLEM, { synergy: 'Temporal emblem' });
            this.addStat(stats.stats, 'base_damage_per_obliteration_emblem', DAMAGE_PER_OBLITERATION_EMBLEM, { synergy: 'Obliteration emblem' });
        }

        if (character.heroClass === HeroClass.Huntress) {
            const serenity = minAndMax(0, config.serenity, DELIGHTED_VALUE);
            if (serenity > 0) {
                this.addStat(stats.stats, 'attack_speed_percent', serenity * ATTACK_SPEED_PER_DELIGHTED_STACK, { synergy: 'Serenity' } );
            }
            if (DELIGHTED_VALUE - serenity > 0) {
                this.addStat(stats.stats, 'cooldown_reduction_global_mult', (DELIGHTED_VALUE - serenity) * COOLDOWN_REDUCTION_PER_DELIGHTED_STACK, { synergy: 'Serenity' } );
            }
        }
        
        const allCharacterMasteries = character.skills.reduce((total, skill) => total + skill.skill.level, 0);
        this.addStat(stats.stats, 'all_character_masteries', allCharacterMasteries, { synergy: 'Character skill masteries' });
        stats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'critical_damage', 'brut_damage_percent', EffectValueValueType.Unknown, undefined, null, true, true, true, true), 0, { synergy: 'Critical strike damage' }, [ { stat: 'ancestral_damage' } ], true));
    }
    
    private addConfigValues(character: Character, config: CharacterConfig, stats: ExtractedStats) {

        this.addStat(stats.stats, 'all_level', config.all_other_characters_level + character.level, { synergy: 'Summ all other characters level' });
        this.addStat(stats.stats, 'corrupted_slorm', config.elder_slorms, { synergy: 'Total Elder Slorm' });
        this.addStat(stats.stats, 'damage_stored', config.damage_stored, { synergy: 'Damage stored' });
        this.addStat(stats.stats, 'victims_reaper_104', config.victims_reaper_104, { synergy: 'Goldfish reaper kill count' });
        this.addStat(stats.stats, 'slormocide_60', config.slormocide_60, { synergy: 'Slorm found recently' });
        this.addStat(stats.stats, 'goldbane_5', config.goldbane_5, { synergy: 'Gold found recently' });
        this.addStat(stats.stats, 'enemy_percent_missing_health', config.enemy_percent_missing_health, { synergy: 'Enemy percent missing health' });
        this.addStat(stats.stats, 'block_stacks', config.block_stacks, { synergy: 'Block stacks' });
        this.addStat(stats.stats, 'mana_lost_last_second', config.mana_lost_last_second, { synergy: 'Mana lost last second' });
        this.addStat(stats.stats, 'mana_gained_last_second', config.mana_gained_last_second, { synergy: 'Mana gained last second' });
        this.addStat(stats.stats, 'completed_achievements', config.completed_achievements, { synergy: 'Completed achievements' });
        this.addStat(stats.stats, 'knight_other_level', config.knight_other_level, { synergy: 'Maximum level of Huntress or Mage' });
        this.addStat(stats.stats, 'highest_floor', config.highest_slorm_temple_floor, { synergy: 'Highest Slorm Temple floor' });
        this.addStat(stats.stats, 'support_streak', config.support_streak_stacks, { synergy: 'Support streak stacks' });
        this.addStat(stats.stats, 'hero_class', character.heroClass, { synergy: 'Class id' });
        this.addStat(stats.stats, 'victims_combo', Math.max(0, config.victims_combo), { synergy: 'Combo counter' });
        this.addStat(stats.stats, 'victims_combo_100', Math.max(0, config.victims_combo - 100), { synergy: 'Combo counter minus 100' });
        this.addStat(stats.stats, 'current_dps', 0, { synergy: 'Current dps (not supported)' });
        this.addStat(stats.stats, 'absorbed_damage_wrath', config.absorbed_damage_wrath, { synergy: 'Absorbed damage wrath' });
        this.addStat(stats.stats, 'moonlight_stacks', config.moonlight_stacks, { synergy: 'Moonlight stacks' });
        this.addStat(stats.stats, 'sunlight_stacks', config.sunlight_stacks, { synergy: 'Sunlight stacks' });

        let rune_affinity = config.effect_rune_affinity;
        if (character.runes.effect !== null && character.runes.effect.reapersmith === character.reaper.smith.id) {
            rune_affinity = character.reaper.reaperAffinity;
        }
        this.addStat(stats.stats, 'rune_affinity', rune_affinity, { synergy: 'Effect rune affinity' });
    }

    private addMechanicValues(mechanics: Array<Mechanic>, stats: ExtractedStats) {
        for (const mechanic of mechanics) {
            stats.isolatedSynergies.push(...mechanic.values.filter(isEffectValueSynergy)
                .map(synergy => synergyResolveData(synergy, synergy.displaySynergy, { mechanic })));
        }
    }

    private addClassMechanicValues(heroClass: HeroClass, stats: ExtractedStats) {
        const classMechanics = this.slormancerClassMechanicService.getClassMechanics(heroClass);
        for (const classMechanic of classMechanics) {
            stats.isolatedSynergies.push(...classMechanic.values.filter(isEffectValueSynergy)
                .map(synergy => synergyResolveData(synergy, synergy.displaySynergy, { classMechanic })));
        }
    }

    private addAncestralLegacyValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig) {
        for (const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {
            const active = ancestralLegacy.rank > 0 && character.ancestralLegacies.activeAncestralLegacies.indexOf(ancestralLegacy.id) !== -1;

            for (const effectValue of ancestralLegacy.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (active && !isDamageType(effectValue.stat)) {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { ancestralLegacy }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping, config, stats.stats)));
                    } else {                        
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { ancestralLegacy }));
                    }
                    } else if (active && !ancestralLegacy.isActivable) {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value, { ancestralLegacy });
                }
            }

            if (active && !ancestralLegacy.isActivable) {
                if (ancestralLegacy.hasManaCost && ancestralLegacy.currentRankCost !== null) {
                    this.addStat(stats.stats, 'mana_cost_add_skill_imbue', ancestralLegacy.currentRankCost, { ancestralLegacy });
                }
                if (ancestralLegacy.hasLifeCost && ancestralLegacy.currentRankCost !== null) {
                    this.addStat(stats.stats, 'life_cost_add_skill_imbue', ancestralLegacy.currentRankCost, { ancestralLegacy });
                }
            }

            this.addMechanicValues(ancestralLegacy.relatedMechanics, stats);
        }

        const equipedImbues = character.ancestralLegacies.ancestralLegacies
            .filter(ancestralLegacy => character.ancestralLegacies.activeAncestralLegacies.includes(ancestralLegacy.id) && ancestralLegacy.types.includes(AncestralLegacyType.Imbue))
            .length;
        this.addStat(stats.stats, 'equipped_imbues', equipedImbues, { reaper: character.reaper });
    }

    private addAttributesValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig) {
        const disableGreaterTraits = stats.stats['disable_greater_traits'] !== undefined;
        for (const attribute of ALL_ATTRIBUTES) {
            const attributeTraits = character.attributes.allocated[attribute];
            const source = { attribute: attributeTraits };

            for (const trait of attributeTraits.traits) {
                if (!disableGreaterTraits || trait.traitLevel !== TraitLevel.Greater) {
                    for (const effectValue of trait.values) {
                        if (isEffectValueSynergy(effectValue)) {
                            if (!trait.unlocked || isDamageType(effectValue.stat)) {                            
                                stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source));
                            } else {
                                stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping, config, stats.stats)));
                            }
                        } else if (trait.unlocked) { 
                            this.addStat(stats.stats, effectValue.stat, effectValue.value, source);                           
                        }
                    }
                }
    
                for (const effectValue of trait.cumulativeValues) {
                    if (trait.unlocked) { 
                        this.addStat(stats.stats, effectValue.stat, effectValue.value, source);                           
                    }
                }
            }
        }
    }

    private addReaperValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig) {
        const source = { reaper: character.reaper };
        this.addStat(stats.stats, 'min_weapon_damage_add', character.reaper.damages.min, source);
        this.addStat(stats.stats, 'max_weapon_damage_add', character.reaper.damages.max - character.reaper.damages.min, source);        
        this.addStat(stats.stats, 'victims_current_reaper', character.reaper.kills, { synergy: 'Current reaper victims' });
        this.addStat(stats.stats, 'reaper_affinity', character.reaper.reaperAffinity, { synergy: 'Current reaper affinity' });

        if (character.reaper.id === 30 || character.reaper.id === 31) {
            this.addStat(stats.stats, 'remain_damage', 1000, { synergy: 'Remain damage' });
        }

        const effectValues: Array<AbstractEffectValue> = character.reaper.templates.base.map(effect => effect.values).flat();
        if (character.reaper.primordial) {
            effectValues.push(...character.reaper.templates.benediction.map(effect => effect.values).flat());
            effectValues.push(...character.reaper.templates.malediction.map(effect => effect.values).flat());
        }

        for (const effectValue of effectValues) {
            if (isEffectValueSynergy(effectValue)) {
                if (isDamageType(effectValue.stat)) {
                    stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { reaper: character.reaper }));
                } else {
                    stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { reaper: character.reaper }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping, config, stats.stats)));
                }
            } else {
                this.addStat(stats.stats, effectValue.stat, effectValue.value, source);
            }
        }

        if (UNITY_REAPERS.includes(character.reaper.id)) {
            let totalDamage: MinMax = { min: 0, max: 0 };
            let totalLevel = 0;
            for(const reaperId of UNITY_REAPERS) {
                const reaperData = this.slormancerDataService.getGameDataReaper(reaperId);

                if (reaperData !== null) {
                    const minLevel = this.slormancerReaperService.getReaperMinimumLevel(reaperId);
                    const maxLevel = reaperData.MAX_LVL ?? 100;

                    const levelsMapping: GameHeroesData<number> = {
                        [HeroClass.Warrior]: (config as any)['unity_level_0_' + reaperId],
                        [HeroClass.Huntress]: (config as any)['unity_level_1_' + reaperId],
                        [HeroClass.Mage]: (config as any)['unity_level_2_' + reaperId],
                    }

                    if (character.reaper.id === reaperId) {
                        if (character.reaper.primordial) {
                            levelsMapping[character.heroClass] = character.reaper.level;
                        } else {
                            levelsMapping[character.heroClass] = character.reaper.level;
                        }
                    }
                    
                    const levels = [
                        levelsMapping[HeroClass.Warrior],
                        levelsMapping[HeroClass.Huntress],
                        levelsMapping[HeroClass.Mage],
                    ].map(level => level === 0 ? 0 : Math.min(maxLevel, Math.max(minLevel, level)));

                    for(const level of levels) {
                        if (level > 0) {
                            totalLevel += level;
                            const reaper = this.slormancerReaperService.getReaperById(reaperId, character.heroClass, false, level, 0, 'TOREMOVE', 0, 0, character.reaper.reaperAffinity, character.reaper.effectAffinity, character.reaper.bonusAffinity, character.reaper.masteryLevel);
                            if (reaper !== null) {
                                totalDamage = add(totalDamage, reaper.damages) as MinMax;
                            }
                        }
                    }
                    
                    this.addStat(stats.stats, 'legion_' + (reaperId - 46), levels.filter(level => level > 0).length, { synergy: 'Number of legion ' + (reaperId - 46) + ' reapers' });
                }

            }

            this.addStat(stats.stats, 'legion_level_all', totalLevel, { synergy: 'Total level of legion reapers' });
            this.addStat(stats.stats, 'legion_reaper_dmg', round((totalDamage.min + totalDamage.max) / 2, 0), { synergy: 'Total damage of legion reapers' });
        }
    }

    private addRunesValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig) {
        const runes: Array<Rune> = [character.runes.activation, character.runes.effect, character.runes.enhancement].filter(isNotNullOrUndefined);
        for (const rune of runes) {
            const source = { rune };

            for (const effectValue of rune.values) {
                const applyEffect = rune.type !== RuneType.Effect || config.is_rune_active;

                if (isEffectValueSynergy(effectValue)) {
                    if (isDamageType(effectValue.stat) || !applyEffect) {
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source));
                    } else {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping, config, stats.stats)));
                    }
                } else if (applyEffect) {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value, source);
                }
            }
        }
    }

    private addInventoryValues(character: Character, stats: ExtractedStats) {
        const items = [...character.inventory, ...character.sharedInventory.flat()]
            .filter(isNotNullOrUndefined)

        for (const item of items) {
            if (item.legendaryEffect !== null) {
                for (const craftedEffect of item.legendaryEffect.effects) {
                    if (isEffectValueSynergy(craftedEffect.effect)) {
                        stats.isolatedSynergies.push(synergyResolveData(craftedEffect.effect, craftedEffect.effect.displaySynergy, { item }));
                    }
                }
            }
        }
    }

    private addGearValues(character: Character, stats: ExtractedStats, config: CharacterConfig, mergedStatMapping: Array<MergedStatMapping>) {
        const addChestTwice = stats.stats['add_chest_stats_twice'] !== undefined;
        const ignorePhysicalElementalStats = stats.stats['ignore_physical_elemental_stats'] !== undefined;
        const items = ALL_GEAR_SLOT_VALUES
            .map(slot => character.gear[slot])
            .filter(isNotNullOrUndefined);
        const statsToIgnore: Array<string> = [];
        if (stats.stats['disable_attack_speed_from_gear_stats'] !== undefined) {
            statsToIgnore.push('cooldown_reduction_global_mult');
        }

        const reaperSmithStats: { [key: number]: number } = { }

        this.addStat(stats.stats, 'number_equipped_legendaries', items.filter(item => item.legendaryEffect !== null).length, { synergy: 'Number of equipped legendaries' });

        for (const item of items) {
            const affixEffectValues = item.affixes.map(affix => affix.craftedEffect.effect)
                .filter(affix => !statsToIgnore.includes(affix.stat));
            const effectValues = [
                    ...affixEffectValues,
                    ...(item.legendaryEffect !== null ? item.legendaryEffect.effects.map(c => c.effect) : []),
                    ...(item.legendaryEffect !== null && item.legendaryEffect.activable !== null ? item.legendaryEffect.activable.values : [])
                ]
                .flat();
            
            if (addChestTwice && item.base === EquipableItemBase.Body) {
                effectValues.push(...affixEffectValues);
            }

            for (const effectValue of effectValues) {
                if (isEffectValueSynergy(effectValue)) {
                    if (isDamageType(effectValue.stat)) {
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { item }));
                    } else {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { item }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping, config, stats.stats)));
                    }
                } else {
                    if (!ignorePhysicalElementalStats || !this.PHYSICAL_ELEMENTAL_STATS.includes(effectValue.stat)) {
                        if (effectValue.stat === null) {
                            console.log('null stat item found', item)
                        }
                        this.addStat(stats.stats, effectValue.stat, effectValue.value, { item });
                    }
                }
            }

            if (item.reaperEnchantment !== null) {
                reaperSmithStats[item.reaperEnchantment.craftedReaperSmith] = item.reaperEnchantment.craftedValue + valueOrDefault(reaperSmithStats[item.reaperEnchantment.craftedReaperSmith], 0);
            }
        }

        let totalSmithBonus = 0;
        for (const reaperSmith of ALL_REAPER_SMITH) {
            const total = valueOrDefault(reaperSmithStats[reaperSmith], 0);
            totalSmithBonus += total;
            this.addStat(stats.stats, 'reapersmith_' + reaperSmith, total, { character });
        }
        this.addStat(stats.stats, 'reaper_bonus', totalSmithBonus, { character });
    }

    private addAdditionalItemValues(additionalItem: EquipableItem | null, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig) {
        if (additionalItem !== null) {
            const effectValues = [
                    ...(additionalItem.legendaryEffect !== null ? additionalItem.legendaryEffect.effects.map(c => c.effect) : []),
                    ...(additionalItem.legendaryEffect !== null && additionalItem.legendaryEffect.activable !== null ? additionalItem.legendaryEffect.activable.values : [])
                ]
                .flat()
                .filter(isEffectValueSynergy);
            
            for (const synergy of effectValues) {            
                stats.isolatedSynergies.push(synergyResolveData(synergy, synergy.displaySynergy, { item: additionalItem }, this.getSynergyStatsItWillUpdate(synergy.stat, mergedStatMapping, config, stats.stats)));
            }
        }
    }

    private addAdditionalRuneValues(additionalRunes: Array<Rune>, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig) {
        for (const additionalRune of additionalRunes) {
            const effectValues = [
                    ...additionalRune.values,
                    ...(additionalRune.activable !== null ? additionalRune.activable.values : [])
                ]
                .filter(isEffectValueSynergy);
            
            for (const synergy of effectValues) {            
                stats.isolatedSynergies.push(synergyResolveData(synergy, synergy.displaySynergy, { rune: additionalRune }, this.getSynergyStatsItWillUpdate(synergy.stat, mergedStatMapping, config, stats.stats)));
            }
        }
    }

    private addSkillPassiveValues(character: Character, config: CharacterConfig, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        let poisonUpgrades = 0;
        for (const sau of character.skills) {
            const skillEquiped = character.supportSkill === sau.skill || character.primarySkill === sau.skill || character.secondarySkill === sau.skill;
            
            for (const skillValue of sau.skill.values) {
                if (skillValue.valueType !== EffectValueValueType.Upgrade) {
                    if (isEffectValueSynergy(skillValue)) {
                        stats.isolatedSynergies.push(synergyResolveData(skillValue, skillValue.displaySynergy, { skill: sau.skill }));
                    } else if (skillEquiped) {
                        this.addStat(stats.stats, skillValue.stat, skillValue.value, { skill: sau.skill });
                    }
                }
            }

            for (const upgrade of sau.upgrades) {
                const upgradeActive = skillEquiped && sau.activeUpgrades.includes(upgrade.id);
                for (const upgradeValue of upgrade.values) {
                    if (upgradeValue.valueType !== EffectValueValueType.Upgrade) {
                        if (isEffectValueSynergy(upgradeValue)) {
                            if (upgradeActive && !isDamageType(upgradeValue.stat)) {
                                stats.synergies.push(synergyResolveData(upgradeValue, upgradeValue.displaySynergy, { upgrade }, this.getSynergyStatsItWillUpdate(upgradeValue.stat, mergedStatMapping, config, stats.stats)));
                            } else {
                                stats.isolatedSynergies.push(synergyResolveData(upgradeValue, upgradeValue.displaySynergy, { upgrade }));
                            }
                        } else if (upgradeActive) {
                            this.addStat(stats.stats, upgradeValue.stat, upgradeValue.value, { upgrade });
                        }
                    }
                }

                this.addMechanicValues(upgrade.relatedMechanics, stats);

                if (upgradeActive && upgrade.relatedClassMechanics.some(classMechanic => classMechanic.id === 211)) {
                    poisonUpgrades++;
                }
            }
            
            this.addStat(stats.stats, 'based_on_mastery_' + sau.skill.id + '_add', sau.skill.level, { skill: sau.skill });
        }
        this.addStat(stats.stats, 'poison_upgrades', poisonUpgrades, { character });
    }

    public addActivableValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig) {
        const activables = this.getAllActiveActivables(character);

        for (const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {
            if (ancestralLegacy.isActivable) {
                const equiped = activables.includes(ancestralLegacy);
                const source = { ancestralLegacy };
                for (const effectValue of ancestralLegacy.values) {
                    if (isEffectValueSynergy(effectValue)) {
                        if (!isDamageType(effectValue.stat)) {
                            stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping, config, stats.stats)));
                        }
                    } else if (equiped) {
                        this.addStat(stats.stats, effectValue.stat, effectValue.value, source);
                    }
                }
            }
        }
        
        const items = ALL_GEAR_SLOT_VALUES
            .map(slot => character.gear[slot])
            .filter(isNotNullOrUndefined);

        for (const item of items) {
            if (item.legendaryEffect !== null && item.legendaryEffect.activable !== null) {
                const equiped = activables.includes(item.legendaryEffect.activable);
                const source = { item };
                for (const effectValue of item.legendaryEffect.activable.values) {
                    if (isEffectValueSynergy(effectValue)) {
                        if (!isDamageType(effectValue.stat)) {
                            stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping, config, stats.stats)));
                        }
                    } else if (equiped) {
                        this.addStat(stats.stats, effectValue.stat, effectValue.value, source);
                    }
                }
            }
        }

        for (const activable of character.reaper.activables) {
            const equiped = activables.includes(activable);
            const source = { activable };
            for (const effectValue of activable.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (!isDamageType(effectValue.stat)) {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping, config, stats.stats)));
                    } else {
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source));
                    }
                } else if (equiped) {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value, source);
                }
            }
        }
    }

    private getAllActiveActivables(character: Character): (Activable | AncestralLegacy)[] {
        const ancestralLegacyActivables = character.ancestralLegacies.ancestralLegacies
            .filter(ancestralLegacy => character.ancestralLegacies.activeAncestralLegacies.includes(ancestralLegacy.id) && ancestralLegacy.isActivable);
        const itemActivables = ALL_GEAR_SLOT_VALUES
            .map(slot => character.gear[slot]?.legendaryEffect?.activable)
            .filter(isNotNullOrUndefined);
        const reaperActivables = character.reaper.activables

        return [
            ...ancestralLegacyActivables,
            ...itemActivables,
            ...reaperActivables
        ].filter(activable => activable === character.activable1
                           || activable === character.activable2
                           || activable === character.activable3
                           || activable === character.activable4
                           || activable.genres.includes(SkillGenre.Aura));
    }

    private getLockedManaPercent(activables: (Activable | AncestralLegacy)[], config: CharacterConfig, stats: ExtractedStats): number {        
        let lockedManaPercent = activables.filter(act => act.costType === SkillCostType.ManaLock)
            .reduce((t, s) => t + valueOrDefault(s.cost, 0), 0);

        const skeletonSquireSkill = activables.find(activable => activable.id === 17);
        if (skeletonSquireSkill !== undefined && skeletonSquireSkill.cost !== null) {

            const maxMana = this.slormancerStatMappingService.buildMergedStat<number>(stats.stats, MAX_MANA_MAPPING, config);
            this.slormancerMergedStatUpdaterService.updateStatTotal(maxMana);
            if (maxMana !== undefined) {
                const availableMana = Math.max(0, (maxMana.total * (100 - lockedManaPercent) / 100) - config.minimum_unreserved_mana);
                const maxPossibleSummon = Math.floor(availableMana / skeletonSquireSkill.cost);

                const summonsCount = config.always_summon_maximum_skeleton_squires ? maxPossibleSummon : Math.min(maxPossibleSummon, config.summoned_skeleton_squires);
            
                if (summonsCount > 0) {
                    lockedManaPercent = lockedManaPercent + (summonsCount * skeletonSquireSkill.cost * 100 / maxMana.total);

                    if (config.add_skeletons_to_controlled_minions) {
                        this.addStat(stats.stats, 'additional_controlled_minions', summonsCount, { synergy: 'Skeletons under your control' });
                    }
                }
            }
        }

        
        return lockedManaPercent;
    }

    private getLockedHealthPercent(activables: (Activable | AncestralLegacy)[], config: CharacterConfig, stats: ExtractedStats): number {
        return activables.filter(act => act.costType === SkillCostType.LifeLock)
            .reduce((t, s) => t + valueOrDefault(s.cost, 0), 0);
    }

    private addDynamicValues(character: Character, config: CharacterConfig, stats: ExtractedStats) {
        const activables = this.getAllActiveActivables(character);

        const lockedManaPercent = this.getLockedManaPercent(activables, config, stats);
        const lockedHealthPercent = this.getLockedHealthPercent(activables, config, stats);

        const percentMissingMana = lockedManaPercent > config.percent_missing_mana ? lockedManaPercent : config.percent_missing_mana;
        const percentMissingHealth = lockedHealthPercent > config.percent_missing_health ? lockedHealthPercent : config.percent_missing_health;
        
        this.addStat(stats.stats, 'mana_lock_percent', lockedManaPercent, { synergy: 'Percent locked mana' });
        this.addStat(stats.stats, 'mana_lock_percent_ungift', lockedManaPercent, { synergy: 'Percent locked mana' });
        this.addStat(stats.stats, 'percent_locked_health', lockedHealthPercent, { synergy: 'Percent locked life' });
        this.addStat(stats.stats, 'percent_missing_mana', percentMissingMana, { synergy: 'Percent missing mana' });
        this.addStat(stats.stats, 'percent_missing_health', percentMissingHealth, { synergy: 'Percent missing health' });

        stats.synergies.push(synergyResolveData(effectValueSynergy(100 - percentMissingMana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'current_mana', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true), -1, { synergy: 'Current mana' }, [ { stat: 'current_mana' } ], true));
        stats.synergies.push(synergyResolveData(effectValueSynergy(percentMissingMana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'missing_mana', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true), -1, { synergy: 'Missing mana' }, [ { stat: 'missing_mana' } ], true));
        stats.synergies.push(synergyResolveData(effectValueSynergy(lockedManaPercent, 0, EffectValueUpgradeType.None, false, 'max_mana', 'mana_lock_flat', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true), -1, { synergy: 'Locked mana' }, [ { stat: 'mana_lock_flat' } ], true));
        stats.synergies.push(synergyResolveData(effectValueSynergy(lockedHealthPercent, 0, EffectValueUpgradeType.None, false, 'max_health', 'life_lock_flat', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true), -1, { synergy: 'Locked life' }, [ { stat: 'life_lock_flat' } ], true));
        stats.synergies.push(synergyResolveData(effectValueSynergy(percentMissingHealth, 0, EffectValueUpgradeType.None, false, 'max_health', 'missing_health', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true), -1, { synergy: 'Missing health' }, [ { stat: 'missing_health' } ], true));
        stats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'max_health', 'max_health_shield', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true), -1, { synergy: 'Max health and shield' }, [ { stat: 'max_health_shield' } ], true));
        
        const increasedMaxStacks = stats.stats['increased_max_stacks'];
        let increasedMax = 0;
        if (increasedMaxStacks) {
            increasedMax = increasedMaxStacks.map(entity => entity.value).reduce((value, total) => value + total, 0);
        }

        const bloodthirstMaxStacksStat = stats.stats['bloodthirst_max_stacks'];
        let bloodthirstStacks = 0;
        if (bloodthirstMaxStacksStat) {
            const bloodthirstMaxstacks = Math.ceil((bloodthirstMaxStacksStat[0] as EntityValue<number>).value) + increasedMax;
            bloodthirstStacks = Math.max(0, Math.min(bloodthirstMaxstacks, config.bloodthirst_stacks));
            this.addStat(stats.stats, 'bloodthirst_stacks', bloodthirstStacks, { synergy: 'Bloodthirst stacks' });
        }        
        
        const ancestralWrathMaxStacks = stats.stats['ancestral_wrath_max_stacks'];
        if (ancestralWrathMaxStacks) {
            let max = 0;
            const ancestralWrathMaxStacksStat = ancestralWrathMaxStacks[0];
            if (ancestralWrathMaxStacksStat) {
                max = Math.ceil(ancestralWrathMaxStacksStat.value) + increasedMax;
            }
            this.addStat(stats.stats, 'ancestral_wrath_stacks', Math.max(0, Math.min(max, config.ancestral_wrath_stacks)), { synergy: 'Ancestral wrath stacks' });
        }

        // Adding blood frenzy attack speed manually due to the computing issue
        if (config.has_blood_frenzy_buff) {
            const bloodfrenzy = [character.activable1, character.activable2, character.activable3, character.activable4]
                .filter(isNotNullOrUndefined)
                .find(activable => !('element' in activable) && activable.id === 39);
                
            if (bloodfrenzy) {
                for(let i = 0 ; i < bloodthirstStacks ; i++) {
                    this.addStat(stats.stats, 'cooldown_reduction_global_mult', 1, { activable: bloodfrenzy as Activable });
                }
            }
        }

        if (character.reaper.id === 96) {
            stats.synergies.push(synergyResolveData(
                effectValueSynergy(100 * config.moonlight_stacks, 0, EffectValueUpgradeType.None, false, 'health_regeneration', 'health_regeneration_per_moonlight_stack', EffectValueValueType.Stat, undefined, 3),
                -1,
                { synergy: 'Health regeneration per moonlight stack' },
                [{ stat: 'health_regeneration_per_moonlight_stack' }]
            ));
            stats.synergies.push(synergyResolveData(
                effectValueSynergy(100 * config.sunlight_stacks, 0, EffectValueUpgradeType.None, false, 'life_on_hit', 'life_on_hit_per_sunlight_stack', EffectValueValueType.Stat, undefined, 3),
                -1,
                { synergy: 'Life on hit per sunlight stack' },
                [{ stat: 'life_on_hit_per_sunlight_stack' }]
            ));
        }
    }

    private addBaseValues(character: Character, stats: ExtractedStats) {
        const baseStats = character.baseStats.map(stat => stat.values.map(value => <[string, number]>[stat.stat, value])).flat();
        for (const baseStat of baseStats) {
            this.addStat(stats.stats, baseStat[0], baseStat[1], { character });
        }
        this.addStat(stats.stats, 'hero_level', character.level, { character });
    }

    private addStat(cache: ExtractedStatMap, stat: string, value: number, source: Entity) {
        if (stat === null) {
            console.log('NULL stat found at ', new Error().stack);
        } else {
            let foundStat = cache[stat];
            
            if (foundStat === undefined) {
                foundStat = [];
                cache[stat] = foundStat;
            }
    
            foundStat.push({ value, source });
        }
    }

    public extractCharacterStats(character: Character, config: CharacterConfig, additionalItem: EquipableItem | null = null, additionalRunes: Array<Rune> = [], mergedStatMapping: Array<MergedStatMapping>, additionalStats: ExtractedStatMap = {}): ExtractedStats {
        const result: ExtractedStats = {
            synergies:  [],
            isolatedSynergies:  [],
            stats: { ...additionalStats },
        }

        this.addCharacterValues(character, config, result);
        this.addConfigValues(character, config, result);
        this.addSkillPassiveValues(character, config, result, mergedStatMapping);
        this.addReaperValues(character, result, mergedStatMapping, config);
        this.addRunesValues(character, result, mergedStatMapping, config);
        this.addBaseValues(character, result);
        this.addAncestralLegacyValues(character, result, mergedStatMapping, config);
        this.addAttributesValues(character, result, mergedStatMapping, config);
        this.addGearValues(character, result, config, mergedStatMapping);
        this.addAdditionalItemValues(additionalItem, result, mergedStatMapping, config);
        this.addAdditionalRuneValues(additionalRunes, result, mergedStatMapping, config);
        this.addInventoryValues(character, result);
        this.addActivableValues(character, result, mergedStatMapping, config);
        this.addDefaultSynergies(character, config, result, mergedStatMapping);
        this.addDynamicValues(character, config, result);
        this.addClassMechanicValues(character.heroClass, result)
        
        return result;
    }

    private addSkillValues(skillAndUpgrades: CharacterSkillAndUpgrades, extractedStats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig) {
        for (const skillValue of skillAndUpgrades.skill.values) {
            if (isEffectValueSynergy(skillValue)) {
                if (!isDamageType(skillValue.stat) && skillValue.valueType !== EffectValueValueType.Upgrade) {
                    extractedStats.synergies.push(synergyResolveData(skillValue, skillValue.displaySynergy, { skill: skillAndUpgrades.skill }, this.getSynergyStatsItWillUpdate(skillValue.stat, mergedStatMapping, config, extractedStats.stats)));
                } else {
                    extractedStats.isolatedSynergies.push(synergyResolveData(skillValue, skillValue.displaySynergy, { skill: skillAndUpgrades.skill }));
                }
            } else if (skillValue.valueType === EffectValueValueType.Upgrade) {
                this.addStat(extractedStats.stats, skillValue.stat, skillValue.value, { skill: skillAndUpgrades.skill });
            }
        }
    }

    private addUpgradeValues(skillAndUpgrades: CharacterSkillAndUpgrades, extractedStats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig) {
        for (const upgrade of skillAndUpgrades.upgrades) {
            const equipped = skillAndUpgrades.activeUpgrades.includes(upgrade.id);
            for (const upgradeValue of upgrade.values) {
                if (upgradeValue.valueType === EffectValueValueType.Upgrade) {
                    if (isEffectValueSynergy(upgradeValue)) {
                        if (equipped && !isDamageType(upgradeValue.stat)) {
                            extractedStats.synergies.push(synergyResolveData(upgradeValue, upgradeValue.displaySynergy, { upgrade }, this.getSynergyStatsItWillUpdate(upgradeValue.stat, mergedStatMapping, config, extractedStats.stats)));
                        } else {
                            extractedStats.isolatedSynergies.push(synergyResolveData(upgradeValue, upgradeValue.displaySynergy, { upgrade }));
                        }
                    } else if (equipped) {
                        this.addStat(extractedStats.stats, upgradeValue.stat, upgradeValue.value, { upgrade });
                    }
                }
            }

            if (equipped && upgrade.cost !== null && upgrade.cost !== 0) {
                this.addStat(extractedStats.stats, 'mana_cost_add_skill', upgrade.cost, { upgrade });
            }
        }
    }

    public extractSkillStats(skillAndUpgrades: CharacterSkillAndUpgrades, characterStats: CharacterStatsBuildResult, mergedStatMapping: Array<MergedStatMapping>, config: CharacterConfig): ExtractedStats {
        const result: ExtractedStats = {
            synergies:  [],
            isolatedSynergies:  [],
            stats: {},
        }

        for (const stat in characterStats.extractedStats) {
            result.stats[stat] = (<Array<EntityValue<number>>>characterStats.extractedStats[stat]).slice(0);
        }

        const characterSynergies = [...characterStats.resolvedSynergies, ...characterStats.unresolvedSynergies];
        for (const synergy of characterSynergies) {
            synergy.statsItWillUpdate = this.getSynergyStatsItWillUpdate(synergy.effect.stat, mergedStatMapping, config, result.stats);
        }
        result.synergies = characterSynergies;

        this.addSkillValues(skillAndUpgrades, result, mergedStatMapping, config);
        this.addUpgradeValues(skillAndUpgrades, result, mergedStatMapping, config);
        this.addClassMechanicValues(skillAndUpgrades.skill.heroClass, result);

        result.stats['skill_elements'] = skillAndUpgrades.skill.elements.map(element => ({ value: element, source: { skill: skillAndUpgrades.skill } }));
        
        return result;
    }

    public extractSkillInfoStats(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, extractedStats: ExtractedStats) {
        if (skillAndUpgrades.skill.type === SkillType.Support) {
            this.addStat(extractedStats.stats, 'skill_is_support', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill.type === SkillType.Active) {
            this.addStat(extractedStats.stats, 'skill_is_active', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill === character.supportSkill) {
            this.addStat(extractedStats.stats, 'skill_is_equipped_support', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill === character.primarySkill) {
            this.addStat(extractedStats.stats, 'skill_is_equipped_primary', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill === character.secondarySkill) {
            this.addStat(extractedStats.stats, 'skill_is_equipped_secondary', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Melee)) {
            this.addStat(extractedStats.stats, 'skill_is_melee', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Projectile)) {
            this.addStat(extractedStats.stats, 'skill_is_projectile', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.AreaOfEffect)) {
            this.addStat(extractedStats.stats, 'skill_is_aoe', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Temporal)) {
            this.addStat(extractedStats.stats, 'skill_is_temporal', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Arcanic)) {
            this.addStat(extractedStats.stats, 'skill_is_arcanic', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Obliteration)) {
            this.addStat(extractedStats.stats, 'skill_is_obliteration', 1, { skill: skillAndUpgrades.skill });
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Aura)) {
            this.addStat(extractedStats.stats, 'skill_is_aura', 1, { skill: skillAndUpgrades.skill });
        }

        this.addStat(extractedStats.stats, 'skill_id', skillAndUpgrades.skill.id, { skill: skillAndUpgrades.skill });
        if (skillAndUpgrades.skill.initialManaCost !== null) {
            this.addStat(extractedStats.stats, 'mana_cost_add_skill', skillAndUpgrades.skill.initialManaCost, { skill: skillAndUpgrades.skill });
        }
        // todo rajouter life cost type
        this.addStat(extractedStats.stats, 'cost_type', ALL_SKILL_COST_TYPES.indexOf(skillAndUpgrades.skill.manaCostType), { skill: skillAndUpgrades.skill });
        if (skillAndUpgrades.skill.baseCooldown !== null) {
            this.addStat(extractedStats.stats, 'cooldown_time_add', skillAndUpgrades.skill.baseCooldown, { skill: skillAndUpgrades.skill });
        }
        if (character.supportSkill) {
            this.addStat(extractedStats.stats, 'support_skill', character.supportSkill.id, { skill: skillAndUpgrades.skill });
        }
        if (character.primarySkill) {
            this.addStat(extractedStats.stats, 'primary_skill', character.primarySkill.id, { skill: skillAndUpgrades.skill });
        }
        if (character.secondarySkill) {
            this.addStat(extractedStats.stats, 'secondary_skill', character.secondarySkill.id, { skill: skillAndUpgrades.skill });
        }
    }
}