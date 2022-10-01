import { Injectable } from '@angular/core';
import { Rune } from '@slormancer/model/content/rune';
import { RuneType } from '@slormancer/model/content/rune-type';

import {
    ARCANE_BOND_DAMAGE_FROM_MANA_SPENT as ARCANE_BOND_DAMAGE_FROM_MANA_LOST,
    ARCANE_CLONE_ATTACK_SPEED_REDUCTION,
    ASTRAL_METEOR_DAMAGE_PERCENT,
    ASTRAL_RETRIBUTION_DAMAGE_PERCENT,
    POISON_DAMAGE_PERCENT,
    RAVENOUS_DAGGER_DAMAGE_PERCENT,
    REMNANT_DAMAGE_REDUCTION,
    TRAP_DAMAGE_PERCENT,
} from '../../constants/common';
import { MAX_MANA_MAPPING, MergedStatMapping } from '../../constants/content/data/data-character-stats-mapping';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { SynergyResolveData } from '../../model/content/character-stats';
import { ClassMechanic } from '../../model/content/class-mechanic';
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
import { SkillType } from '../../model/content/skill-type';
import { Entity } from '../../model/entity';
import { EntityValue } from '../../model/entity-value';
import { effectValueSynergy } from '../../util/effect-value.util';
import { synergyResolveData } from '../../util/synergy-resolver.util';
import { isDamageType, isEffectValueSynergy, isNotNullOrUndefined, valueOrDefault } from '../../util/utils';
import { SlormancerMergedStatUpdaterService } from './slormancer-merged-stat-updater.service';
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

    constructor(private slormancerStatMappingService: SlormancerStatMappingService,
        private slormancerMergedStatUpdaterService: SlormancerMergedStatUpdaterService,
        ) { }

    private getSynergyStatsItWillUpdate(stat: string, mergedStatMapping: Array<MergedStatMapping>): Array<{ stat: string, mapping?: MergedStatMapping }> {
        let result: Array<{ stat: string, mapping?: MergedStatMapping }> = [];

        for (const mapping of mergedStatMapping) {
            if (mapping.source.flat.some(s => s.stat === stat)
            || mapping.source.max.some(s => s.stat === stat)
            || mapping.source.percent.some(s => s.stat === stat)
            || mapping.source.multiplier.some(s => s.stat === stat)) {
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
        const overdriveDamageBasedOnSkillDamage = extractedStats.stats['overdrive_damage_based_on_skill_damage'] !== undefined

        let mapping = mergedStatMapping.find(m => m.stat === 'physical_damage');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'basic_to_physical_damage'), -1, { synergy: 'Basic damages' }, [ { stat: 'physical_damage', mapping } ]));
                
        mapping = mergedStatMapping.find(m => m.stat === 'sum_all_resistances');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'armor', 'sum_all_resistances_add'), 0, { synergy: 'Armor' }, [ { stat: 'sum_all_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'dodge', 'sum_all_resistances_add'), 0, { synergy: 'Dodge' }, [ { stat: 'sum_all_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_resist', 'sum_all_resistances_add'), 0, { synergy: 'Elemental resistance' }, [ { stat: 'sum_all_resistances', mapping } ]));
        
        mapping = mergedStatMapping.find(m => m.stat === 'sum_reduced_resistances');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_melee', 'sum_reduced_resistances_add'), 0, { synergy: 'Reduce on melee' }, [ { stat: 'sum_reduced_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_projectile', 'sum_reduced_resistances_add'), 0, { synergy: 'Reduce on projectile' }, [ { stat: 'sum_reduced_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_area', 'sum_reduced_resistances_add'), 0, { synergy: 'Reduce on area' }, [ { stat: 'sum_reduced_resistances', mapping } ]));
                
        mapping = mergedStatMapping.find(m => m.stat === 'skill_elem_damage');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'skill_elem_damage_add'), 0, { synergy: 'Skill damage' }, [ { stat: 'skill_elem_damage', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'skill_elem_damage_add'), 0, { synergy: 'Elemental damage' }, [ { stat: 'skill_elem_damage', mapping } ]));
        
        mapping = mergedStatMapping.find(m => m.stat === 'overdrive_damage');
        if (overdriveDamageBasedOnSkillDamage) {
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'overdrive_damage_add'), 0, { synergy: 'Skill damage' }, [ { stat: 'overdrive_damage', mapping } ]));
        } else {
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'overdrive_damage_add'), 0, { synergy: 'Raw damage' }, [ { stat: 'overdrive_damage', mapping } ]));
        }
 
        mapping = mergedStatMapping.find(m => m.stat === 'inner_fire_damage');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'inner_fire_damage_add'), 0, { synergy: 'Raw damage' }, [ { stat: 'inner_fire_damage', mapping } ]));

        if (character.heroClass === HeroClass.Warrior) {
            mapping = mergedStatMapping.find(m => m.stat === 'astral_retribution_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(ASTRAL_RETRIBUTION_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'astral_retribution_damage_add'), 0, { synergy: 'Reaper damage'}, [ { stat: 'astral_retribution_damage', mapping } ]));
            mapping = mergedStatMapping.find(m => m.stat === 'astral_meteor_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(ASTRAL_METEOR_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'astral_meteor_damage_add'), 0, { synergy: 'Skill damage' }, [ { stat: 'astral_meteor_damage', mapping } ]));
        }

        if (character.heroClass === HeroClass.Mage) {
            mapping = mergedStatMapping.find(m => m.stat === 'arcane_bond_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(ARCANE_BOND_DAMAGE_FROM_MANA_LOST, 0, EffectValueUpgradeType.None, false, 'mana_lost_last_second', 'arcane_bond_damage_add'), 0, { synergy: 'Mana lost last second' }, [ { stat: 'arcane_bond_damage', mapping } ]));
            // reduced by percent_restored_mana_as_arcane_bond_damage
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'mana_gained_last_second', 'arcane_bond_damage_add_from_restored_mana'), 0, { synergy: 'Mana gained last second' }, [ { stat: 'arcane_bond_damage', mapping } ]));
        }
        
        if (character.heroClass === HeroClass.Huntress) {
            mapping = mergedStatMapping.find(m => m.stat === 'poison_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(POISON_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'poison_damage_add'), 0, { synergy: 'Skill damage' }, [ { stat: 'poison_damage', mapping } ]));
            mapping = mergedStatMapping.find(m => m.stat === 'ravenous_dagger_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(RAVENOUS_DAGGER_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'ravenous_dagger_damage_add'), 0, { synergy: 'Reaper damage' }, [ { stat: 'ravenous_dagger_damage', mapping } ]));
            mapping = mergedStatMapping.find(m => m.stat === 'trap_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(TRAP_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'trap_damage_add'), 0, { synergy: 'Skill damage' }, [ { stat: 'trap_damage', mapping } ]));
        }

        if (addReaperToInnerFire) {
            mapping = mergedStatMapping.find(m => m.stat === 'inner_fire_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'inner_fire_damage_add_extra'), -1, { synergy: 'Reaper damages' }, [ { stat: 'inner_fire_damage', mapping } ]));
        } else if (splitReaperToPhysicalAndElement) {
            mapping = mergedStatMapping.find(m => m.stat === 'elemental_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(50, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_elemental_damage'), -1, { synergy: 'Reaper damages' }, [ { stat: 'elemental_damage', mapping } ]));
            mapping = mergedStatMapping.find(m => m.stat === 'physical_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(50, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage'), -1, { synergy: 'Reaper damages' }, [ { stat: 'physical_damage', mapping } ]));
            if (addReaperToElements) {
                mapping = mergedStatMapping.find(m => m.stat === 'elemental_damage');
                extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_elemental_damage'), -1, { synergy: 'Reaper damages (bug ?)' }, [ { stat: 'elemental_damage', mapping } ]));
                mapping = mergedStatMapping.find(m => m.stat === 'physical_damage');
                extractedStats.synergies.push(synergyResolveData(effectValueSynergy(-50, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage'), -1, { synergy: 'Reaper damages (bug ?)' }, [ { stat: 'physical_damage', mapping } ]));
            }
        } else if (addReaperToElements) {
            let mapping = mergedStatMapping.find(m => m.stat === 'elemental_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_elemental_damage'), -1, { synergy: 'Reaper damages' }, [ { stat: 'elemental_damage', mapping } ]));
        } else {
            let mapping = mergedStatMapping.find(m => m.stat === 'physical_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage'), -1, { synergy: 'Reaper damages' }, [ { stat: 'physical_damage', mapping } ]));
        }

        return true;
    }

    private addCharacterValues(character: Character, stats: ExtractedStats) {
        this.addStat(stats.stats, 'half_level', character.level / 2, { character });
        this.addStat(stats.stats, 'remnant_damage_reduction_mult', -REMNANT_DAMAGE_REDUCTION, { synergy: 'Remnant base damage reduction' });
        this.addStat(stats.stats, 'arcane_clone_cooldown_reduction_global_mult', ARCANE_CLONE_ATTACK_SPEED_REDUCTION, { synergy: 'Arcane clone base attack speed reduction' });

        const supportSkills = [ character.skills[0], character.skills[1], character.skills[2] ].filter(isNotNullOrUndefined);
        this.addStat(stats.stats, 'total_mastery_support', supportSkills.reduce((total, skill) => total + skill.skill.level, 0), { character })
        this.addStat(stats.stats, 'mastery_secondary', character.secondarySkill === null ? 0 : character.secondarySkill.level, character.secondarySkill === null ? { character } : { skill: character.secondarySkill })
        const auraSkills = [ character.activable1, character.activable2, character.activable3, character.activable4 ]
            .filter(isNotNullOrUndefined)
            .filter(skill => skill.genres.includes(SkillGenre.Aura));
        this.addStat(stats.stats, 'active_aura_count', auraSkills.length, { character })

        if (character.heroClass === HeroClass.Mage) {
            const maxedUpgrades = character.skills.map(skill => skill.upgrades).flat().filter(upgrade => upgrade.rank === upgrade.maxRank).length;
            this.addStat(stats.stats, 'maxed_upgrades', maxedUpgrades, { synergy: 'Number of maxed upgrades' });
        }
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

        let rune_affinity = config.effect_rune_affinity;
        if (character.runes.effect !== null && character.runes.effect.reapersmith === character.reaper.smith.id) {
            rune_affinity = character.reaper.affinity;
        }
        this.addStat(stats.stats, 'rune_affinity', rune_affinity, { synergy: 'Effect rune affinity' });
    }

    private addMechanicValues(mechanics: Array<Mechanic>, stats: ExtractedStats) {
        for (const mechanic of mechanics) {
            stats.isolatedSynergies.push(...mechanic.values.filter(isEffectValueSynergy)
                .map(synergy => synergyResolveData(synergy, synergy.displaySynergy, { mechanic })));
        }
    }

    private addClassMechanicValues(classMechanics: Array<ClassMechanic>, stats: ExtractedStats) {
        for (const classMechanic of classMechanics) {
            stats.isolatedSynergies.push(...classMechanic.values.filter(isEffectValueSynergy)
                .map(synergy => synergyResolveData(synergy, synergy.displaySynergy, { classMechanic })));
        }
    }

    private addAncestralLegacyValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        for (const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {
            const active = ancestralLegacy.rank > 0 && character.ancestralLegacies.activeAncestralLegacies.indexOf(ancestralLegacy.id) !== -1;

            for (const effectValue of ancestralLegacy.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (active && !isDamageType(effectValue.stat)) {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { ancestralLegacy }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
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
    }

    private addAttributesValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
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
                                stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
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

    private addReaperValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        if (character.reaper !== null) {
            const source = { reaper: character.reaper };
            this.addStat(stats.stats, 'min_weapon_damage_add', character.reaper.damages.min, source);
            this.addStat(stats.stats, 'max_weapon_damage_add', character.reaper.damages.max - character.reaper.damages.min, source);        
            this.addStat(stats.stats, 'victims_current_reaper', character.reaper.kills, { synergy: 'Current reaper victims' });
            this.addStat(stats.stats, 'reaper_affinity', character.reaper.affinity, { synergy: 'Current reaper affinity' });


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
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { reaper: character.reaper }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
                    }
                } else {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value, source);
                }
            }
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
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { reaper: character.reaper }));
                    } else {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { reaper: character.reaper }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
                    }
                } else if (applyEffect) {
                    console.log('add stat ', effectValue.stat)
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

    private addGearValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        const addChestTwice = stats.stats['add_chest_stats_twice'] !== undefined;
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
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { item }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
                    }
                } else {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value, { item });
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

    private addAdditionalItemValues(additionalItem: EquipableItem | null, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        if (additionalItem !== null) {
            const effectValues = [
                    ...(additionalItem.legendaryEffect !== null ? additionalItem.legendaryEffect.effects.map(c => c.effect) : []),
                    ...(additionalItem.legendaryEffect !== null && additionalItem.legendaryEffect.activable !== null ? additionalItem.legendaryEffect.activable.values : [])
                ]
                .flat()
                .filter(isEffectValueSynergy);
            
            for (const synergy of effectValues) {            
                stats.isolatedSynergies.push(synergyResolveData(synergy, synergy.displaySynergy, { item: additionalItem }, this.getSynergyStatsItWillUpdate(synergy.stat, mergedStatMapping)));
            }
        }
    }

    private addAdditionalRuneValues(additionalRunes: Array<Rune>, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        for (const additionalRune of additionalRunes) {
            const effectValues = [
                    ...additionalRune.values,
                    ...(additionalRune.activable !== null ? additionalRune.activable.values : [])
                ]
                .filter(isEffectValueSynergy);
            
            for (const synergy of effectValues) {            
                stats.isolatedSynergies.push(synergyResolveData(synergy, synergy.displaySynergy, { rune: additionalRune }, this.getSynergyStatsItWillUpdate(synergy.stat, mergedStatMapping)));
            }
        }
    }

    private addSkillPassiveValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
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
                const equipped = skillEquiped && sau.selectedUpgrades.includes(upgrade.id);
                for (const upgradeValue of upgrade.values) {
                    if (upgradeValue.valueType !== EffectValueValueType.Upgrade) {
                        if (isEffectValueSynergy(upgradeValue)) {
                            if (equipped && !isDamageType(upgradeValue.stat)) {
                                stats.synergies.push(synergyResolveData(upgradeValue, upgradeValue.displaySynergy, { upgrade }, this.getSynergyStatsItWillUpdate(upgradeValue.stat, mergedStatMapping)));
                            } else {
                                stats.isolatedSynergies.push(synergyResolveData(upgradeValue, upgradeValue.displaySynergy, { upgrade }));
                            }
                        } else if (equipped) {
                            this.addStat(stats.stats, upgradeValue.stat, upgradeValue.value, { upgrade });
                        }
                    }
                }

                this.addMechanicValues(upgrade.relatedMechanics, stats);
                this.addClassMechanicValues(upgrade.relatedClassMechanics, stats);
            }
        }
    }

    public addActivableValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        const equipedActivables = [character.activable1, character.activable2, character.activable3, character.activable4]
            .filter(isNotNullOrUndefined);

        for (const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {
            if (ancestralLegacy.isActivable) {
                const equiped = equipedActivables.includes(ancestralLegacy);
                const source = { ancestralLegacy };
                for (const effectValue of ancestralLegacy.values) {
                    if (isEffectValueSynergy(effectValue)) {
                        if (!isDamageType(effectValue.stat)) {
                            stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
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
                const equiped = equipedActivables.includes(item.legendaryEffect.activable);
                const source = { item };
                for (const effectValue of item.legendaryEffect.activable.values) {
                    if (isEffectValueSynergy(effectValue)) {
                        if (!isDamageType(effectValue.stat)) {
                            stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
                        }
                    } else if (equiped) {
                        this.addStat(stats.stats, effectValue.stat, effectValue.value, source);
                    }
                }
            }
        }

        for (const activable of character.reaper.activables) {
            const equiped = equipedActivables.includes(activable);
            const source = { activable };
            for (const effectValue of activable.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (!isDamageType(effectValue.stat)) {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
                    } else {
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source));
                    }
                } else if (equiped) {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value, source);
                }
            }
        }
    }

    private getLockedManaPercent(character: Character, config: CharacterConfig, stats: ExtractedStats): number {        
        const activables = [character.activable1, character.activable2, character.activable3, character.activable4 ].filter(isNotNullOrUndefined);

        let lockedManaPercent = activables.filter(act => act.costType === SkillCostType.ManaLockFlat)
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
                }
            }
        }

        
        return lockedManaPercent;
    }

    private getLockedHealthPercent(character: Character, config: CharacterConfig, stats: ExtractedStats): number {        
        const activables = [character.activable1, character.activable2, character.activable3, character.activable4 ].filter(isNotNullOrUndefined);
        
        return activables.filter(act => act.costType === SkillCostType.LifeLockFlat)
        .reduce((t, s) => t + valueOrDefault(s.cost, 0), 0);
    }

    private addDynamicValues(character: Character, config: CharacterConfig, stats: ExtractedStats) {

        const lockedManaPercent = this.getLockedManaPercent(character, config, stats);
        const lockedHealthPercent = this.getLockedHealthPercent(character, config, stats);

        const percentMissingMana = lockedManaPercent > config.percent_missing_mana ? lockedManaPercent : config.percent_missing_mana;
        const percentMissingHealth = lockedHealthPercent > config.percent_missing_health ? lockedHealthPercent : config.percent_missing_health;
        
        this.addStat(stats.stats, 'mana_lock_percent', lockedManaPercent, { synergy: 'Percent locked mana' });
        this.addStat(stats.stats, 'percent_locked_health', lockedHealthPercent, { synergy: 'Percent locked life' });
        this.addStat(stats.stats, 'percent_missing_mana', percentMissingMana, { synergy: 'Percent missing mana' });
        this.addStat(stats.stats, 'percent_missing_health', percentMissingHealth, { synergy: 'Percent missing health' });

        stats.synergies.push(synergyResolveData(effectValueSynergy(100 - percentMissingMana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'current_mana', EffectValueValueType.Stat, undefined, 3), -1, { synergy: 'Current mana' }, [ { stat: 'current_mana' } ]));
        stats.synergies.push(synergyResolveData(effectValueSynergy(percentMissingMana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'missing_mana', EffectValueValueType.Stat, undefined, 3), -1, { synergy: 'Missing mana' }, [ { stat: 'missing_mana' } ]));
        stats.synergies.push(synergyResolveData(effectValueSynergy(lockedManaPercent, 0, EffectValueUpgradeType.None, false, 'max_mana', 'mana_lock_flat', EffectValueValueType.Stat, undefined, 3), -1, { synergy: 'Locked mana' }, [ { stat: 'mana_lock_flat' } ]));
        stats.synergies.push(synergyResolveData(effectValueSynergy(percentMissingHealth, 0, EffectValueUpgradeType.None, false, 'max_health', 'missing_health', EffectValueValueType.Stat, undefined, 3), -1, { synergy: 'Missing health' }, [ { stat: 'missing_health' } ]));
        stats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'max_health', 'max_health_shield', EffectValueValueType.Stat, undefined, 3), -1, { synergy: 'Max health and shield' }, [ { stat: 'max_health_shield' } ]));
        
        
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

    public extractCharacterStats(character: Character, config: CharacterConfig, additionalItem: EquipableItem | null = null, additionalRunes: Array<Rune> = [], mergedStatMapping: Array<MergedStatMapping>): ExtractedStats {
        const result: ExtractedStats = {
            synergies:  [],
            isolatedSynergies:  [],
            stats: { },
        }

        this.addCharacterValues(character, result);
        this.addConfigValues(character, config, result);
        this.addSkillPassiveValues(character, result, mergedStatMapping);
        this.addReaperValues(character, result, mergedStatMapping);
        this.addRunesValues(character, result, mergedStatMapping, config);
        this.addBaseValues(character, result);
        this.addAncestralLegacyValues(character, result, mergedStatMapping);
        this.addAttributesValues(character, result, mergedStatMapping);
        this.addGearValues(character, result, mergedStatMapping);
        this.addAdditionalItemValues(additionalItem, result, mergedStatMapping);
        this.addAdditionalRuneValues(additionalRunes, result, mergedStatMapping);
        this.addInventoryValues(character, result);
        this.addActivableValues(character, result, mergedStatMapping);
        this.addDefaultSynergies(character, config, result, mergedStatMapping);
        this.addDynamicValues(character, config, result);
        
        return result;
    }

    private addSkillValues(skillAndUpgrades: CharacterSkillAndUpgrades, extractedStats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        for (const skillValue of skillAndUpgrades.skill.values) {
                if (isEffectValueSynergy(skillValue)) {
                    if (!isDamageType(skillValue.stat) && skillValue.valueType !== EffectValueValueType.Upgrade) {
                        extractedStats.synergies.push(synergyResolveData(skillValue, skillValue.displaySynergy, { skill: skillAndUpgrades.skill }, this.getSynergyStatsItWillUpdate(skillValue.stat, mergedStatMapping)));
                    } else {
                        extractedStats.isolatedSynergies.push(synergyResolveData(skillValue, skillValue.displaySynergy, { skill: skillAndUpgrades.skill }));
                    }
                } else if (skillValue.valueType === EffectValueValueType.Upgrade) {
                    this.addStat(extractedStats.stats, skillValue.stat, skillValue.value, { skill: skillAndUpgrades.skill });
                }
        }
    }

    private addUpgradeValues(skillAndUpgrades: CharacterSkillAndUpgrades, extractedStats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        for (const upgrade of skillAndUpgrades.upgrades) {
            const equipped = skillAndUpgrades.selectedUpgrades.includes(upgrade.id);
            for (const upgradeValue of upgrade.values) {
                if (upgradeValue.valueType === EffectValueValueType.Upgrade) {
                    if (isEffectValueSynergy(upgradeValue)) {
                        if (equipped && !isDamageType(upgradeValue.stat)) {
                            extractedStats.synergies.push(synergyResolveData(upgradeValue, upgradeValue.displaySynergy, { upgrade }, this.getSynergyStatsItWillUpdate(upgradeValue.stat, mergedStatMapping)));
                        } else {
                            extractedStats.isolatedSynergies.push(synergyResolveData(upgradeValue, upgradeValue.displaySynergy, { upgrade }));
                        }
                    } else if (equipped) {
                        this.addStat(extractedStats.stats, upgradeValue.stat, upgradeValue.value, { upgrade });
                    }
                }
            }

            if (equipped && upgrade.cost !== 0) {
                this.addStat(extractedStats.stats, 'mana_cost_add_skill', upgrade.cost, { upgrade });
            }
        }
    }

    public extractSkillStats(skillAndUpgrades: CharacterSkillAndUpgrades, characterStats: CharacterStatsBuildResult, mergedStatMapping: Array<MergedStatMapping>): ExtractedStats {
        const result: ExtractedStats = {
            synergies:  [],
            isolatedSynergies:  [],
            stats: {},
        }

        const characterSynergies = [...characterStats.resolvedSynergies, ...characterStats.unresolvedSynergies];
        for (const synergy of characterSynergies) {
            synergy.statsItWillUpdate = this.getSynergyStatsItWillUpdate(synergy.effect.stat, mergedStatMapping);
        }
        result.synergies = characterSynergies;

        for (const stat in characterStats.extractedStats) {
            result.stats[stat] = (<Array<EntityValue<number>>>characterStats.extractedStats[stat]).slice(0);
        }

        this.addSkillValues(skillAndUpgrades, result, mergedStatMapping);
        this.addUpgradeValues(skillAndUpgrades, result, mergedStatMapping);



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

        this.addStat(extractedStats.stats, 'skill_id', skillAndUpgrades.skill.id, { skill: skillAndUpgrades.skill });
        this.addStat(extractedStats.stats, 'mana_cost_add_skill', skillAndUpgrades.skill.initialManaCost, { skill: skillAndUpgrades.skill });
        this.addStat(extractedStats.stats, 'cost_type', ALL_SKILL_COST_TYPES.indexOf(skillAndUpgrades.skill.manaCostType), { skill: skillAndUpgrades.skill });
        this.addStat(extractedStats.stats, 'cooldown_time_add', skillAndUpgrades.skill.baseCooldown, { skill: skillAndUpgrades.skill });
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