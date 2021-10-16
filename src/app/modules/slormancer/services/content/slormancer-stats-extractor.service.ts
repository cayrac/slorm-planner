import { Injectable } from '@angular/core';

import { POISON_DAMAGE_PERCENT } from '../../constants/common';
import { MergedStatMapping } from '../../constants/content/data/data-character-stats-mapping';
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
import { SkillCostType } from '../../model/content/enum/skill-cost-type';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { TraitLevel } from '../../model/content/enum/trait-level';
import { EquipableItem } from '../../model/content/equipable-item';
import { Mechanic } from '../../model/content/mechanic';
import { SkillType } from '../../model/content/skill-type';
import { effectValueSynergy } from '../../util/effect-value.util';
import { synergyResolveData } from '../../util/synergy-resolver.util';
import { isDamageType, isEffectValueSynergy, isNotNullOrUndefined, valueOrDefault } from '../../util/utils';
import { CharacterStatsBuildResult } from './slormancer-stats.service';

export declare type ExtractedStatMap = { [key: string]: Array<number> }

export interface ExtractedStats {
    stats: ExtractedStatMap;
    synergies: Array<SynergyResolveData>;
    isolatedSynergies: Array<SynergyResolveData>;
}

@Injectable()
export class SlormancerStatsExtractorService {

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
        const addReaperToElements = extractedStats.stats['reaper_added_to_elements'] !== undefined
        const overdriveDamageBasedOnSkillDamage = extractedStats.stats['overdrive_damage_based_on_skill_damage'] !== undefined

        const percentLockedMana = valueOrDefault<[number]>(<[number]>extractedStats.stats['percent_locked_mana'], [0])[0];
        const percentMissingHealth = valueOrDefault<[number]>(<[number]>extractedStats.stats['percent_missing_health'], [0])[0];
        const percentMissingMana = valueOrDefault<[number]>(<[number]>extractedStats.stats['percent_missing_mana'], [0])[0];

        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100 - percentMissingMana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'current_mana'), -1, {}, [ { stat: 'current_mana' } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(percentMissingMana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'missing_mana'), -1, {}, [ { stat: 'missing_mana' } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(percentLockedMana, 0, EffectValueUpgradeType.None, false, 'max_mana', 'mana_lock_flat'), -1, {}, [ { stat: 'mana_lock_flat' } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(percentMissingHealth, 0, EffectValueUpgradeType.None, false, 'max_health', 'missing_health'), -1, {}, [ { stat: 'missing_health' } ]));
        
        let mapping = mergedStatMapping.find(m => m.stat === 'physical_damage');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'basic_to_physical_damage'), -1, {}, [ { stat: 'physical_damage', mapping } ]));
        if (addReaperToElements) {
            let mapping = mergedStatMapping.find(m => m.stat === 'elemental_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_elemental_damage'), -1, {}, [ { stat: 'elemental_damage', mapping } ]));
        } else {
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'weapon_to_physical_damage'), -1, {}, [ { stat: 'physical_damage', mapping } ]));
        }
        
        mapping = mergedStatMapping.find(m => m.stat === 'sum_all_resistances');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'armor', 'sum_all_resistances_add'), 0, {}, [ { stat: 'sum_all_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'dodge', 'sum_all_resistances_add'), 0, {}, [ { stat: 'sum_all_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_resist', 'sum_all_resistances_add'), 0, {}, [ { stat: 'sum_all_resistances', mapping } ]));
        
        mapping = mergedStatMapping.find(m => m.stat === 'sum_reduced_resistances');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_melee', 'sum_reduced_resistances_add'), 0, {}, [ { stat: 'sum_reduced_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_projectile', 'sum_reduced_resistances_add'), 0, {}, [ { stat: 'sum_reduced_resistances', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'reduced_on_area', 'sum_reduced_resistances_add'), 0, {}, [ { stat: 'sum_reduced_resistances', mapping } ]));
                
        mapping = mergedStatMapping.find(m => m.stat === 'skill_elem_damage');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'skill_elem_damage_add'), 0, {}, [ { stat: 'skill_elem_damage', mapping } ]));
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'skill_elem_damage_add'), 0, {}, [ { stat: 'skill_elem_damage', mapping } ]));
        
        mapping = mergedStatMapping.find(m => m.stat === 'overdrive_damage');
        if (overdriveDamageBasedOnSkillDamage) {
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'overdrive_damage_add'), 0, {}, [ { stat: 'overdrive_damage', mapping } ]));
        } else {
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'overdrive_damage_add'), 0, {}, [ { stat: 'overdrive_damage', mapping } ]));
        }
 
        mapping = mergedStatMapping.find(m => m.stat === 'inner_fire_damage');
        extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'inner_fire_damage_add'), 0, {}, [ { stat: 'inner_fire_damage', mapping } ]));

        if (character.heroClass === HeroClass.Mage) {
            mapping = mergedStatMapping.find(m => m.stat === 'arcane_bond_damage');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'mana_lost_last_second', 'arcane_bond_damage_add'), 0, {}, [ { stat: 'arcane_bond_damage_add', mapping } ]));
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'mana_gained_last_second', 'arcane_bond_damage_add_from_restored_mana'), 0, {}, [ { stat: 'arcane_bond_damage_add_from_restored_mana', mapping } ]));
        }
        
        if (character.heroClass === HeroClass.Huntress) {
            mapping = mergedStatMapping.find(m => m.stat === 'poison_damage_add');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(POISON_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'poison_damage_add'), 0, {}, [ { stat: 'poison_damage_add', mapping } ]));
            mapping = mergedStatMapping.find(m => m.stat === 'poison_damage_add');
            extractedStats.synergies.push(synergyResolveData(effectValueSynergy(POISON_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'poison_damage_add'), 0, {}, [ { stat: 'poison_damage_add', mapping } ]));
        }

        return true;
    }

    private addCharacterValues(character: Character, stats: ExtractedStats) {
        this.addStat(stats.stats, 'half_level', character.level / 2);
        this.addStat(stats.stats, 'remnant_damage_reduction_mult', -50);
        this.addStat(stats.stats, 'arcane_clone_cooldown_reduction_global_mult', -35);

        if (character.heroClass === HeroClass.Mage) {
            const maxedUpgrades = character.skills.map(skill => skill.upgrades).flat().filter(upgrade => upgrade.rank === upgrade.maxRank).length;
            this.addStat(stats.stats, 'maxed_upgrades', maxedUpgrades);
        }
    }
    
    private addConfigValues(character: Character, config: CharacterConfig, stats: ExtractedStats) {

        const activables = [character.activable1, character.activable2, character.activable3, character.activable4 ].filter(isNotNullOrUndefined);

        const lockedManaPercent = activables.filter(act => act.costType === SkillCostType.ManaLock)
            .reduce((t, s) => t + valueOrDefault(s.cost, 0), 0);
        const lockedHealthPercent = activables.filter(act => act.costType === SkillCostType.LifeLock)
            .reduce((t, s) => t + valueOrDefault(s.cost, 0), 0);

        this.addStat(stats.stats, 'all_level', config.all_characters_level);
        this.addStat(stats.stats, 'damage_stored', config.damage_stored);
        this.addStat(stats.stats, 'victims_reaper_104', config.victims_reaper_104);
        this.addStat(stats.stats, 'slormocide_60', config.slormocide_60);
        this.addStat(stats.stats, 'goldbane_5', config.goldbane_5);
        this.addStat(stats.stats, 'percent_locked_mana', lockedManaPercent);
        this.addStat(stats.stats, 'percent_locked_health', lockedHealthPercent);
        this.addStat(stats.stats, 'percent_missing_mana', lockedManaPercent > config.percent_missing_mana ? lockedManaPercent : config.percent_missing_mana);
        this.addStat(stats.stats, 'percent_missing_health', lockedHealthPercent > config.percent_missing_health ? lockedHealthPercent :config.percent_missing_health);
        this.addStat(stats.stats, 'enemy_percent_missing_health', config.enemy_percent_missing_health);
        this.addStat(stats.stats, 'block_stacks', config.block_stacks);
        this.addStat(stats.stats, 'mana_lost_last_second', config.mana_lost_last_second);
        this.addStat(stats.stats, 'mana_gained_last_second', config.mana_gained_last_second);
        this.addStat(stats.stats, 'completed_achievements', config.completed_achievements);
        this.addStat(stats.stats, 'knight_other_level', config.knight_other_level);
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
            const active = ancestralLegacy.rank > 0 && character.ancestralLegacies.activeAncestralLegacies.indexOf(ancestralLegacy.id) !== -1 && !ancestralLegacy.isActivable;

            for (const effectValue of ancestralLegacy.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (active && !isDamageType(effectValue.stat)) {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { ancestralLegacy }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
                    } else {                        
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { ancestralLegacy }));
                    }
                } else if (active) {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value);
                }
            }

            this.addMechanicValues(ancestralLegacy.relatedMechanics, stats);
        }
    }

    private addAttributesValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        const disableGreaterTraits = stats.stats['disable_greater_traits'] !== undefined;
        for (const attribute of ALL_ATTRIBUTES) {
            const attributeTraits = character.attributes.allocated[attribute];

            for (const trait of attributeTraits.traits) {
                if (!disableGreaterTraits || trait.traitLevel !== TraitLevel.Greater) {
                    for (const effectValue of trait.values) {
                        if (isEffectValueSynergy(effectValue)) {
                            if (!trait.unlocked || isDamageType(effectValue.stat)) {                            
                                stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { attribute: attributeTraits }));
                            } else {
                                stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, { attribute: attributeTraits }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
                            }
                        } else if (trait.unlocked) { 
                            this.addStat(stats.stats, effectValue.stat, effectValue.value);                           
                        }
                    }
    
                    for (const effectValue of trait.cumulativeValues) {
                        if (trait.unlocked) { 
                            this.addStat(stats.stats, effectValue.stat, effectValue.value);                           
                        }
                    }
                }
            }
        }
    }

    private addReaperValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        if (character.reaper !== null) {
            this.addStat(stats.stats, 'min_weapon_damage_add', character.reaper.damages.min);
            this.addStat(stats.stats, 'max_weapon_damage_add', character.reaper.damages.max - character.reaper.damages.min);

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
                    this.addStat(stats.stats, effectValue.stat, effectValue.value);
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

        this.addStat(stats.stats, 'number_equipped_legendaries', items.filter(item => item.legendaryEffect !== null).length);

        for (const item of items) {
            const affixEffectValues = item.affixes.map(affix => affix.craftedEffect.effect);
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
                    this.addStat(stats.stats, effectValue.stat, effectValue.value);
                }
            }
        }
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

    private addSkillPassiveValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        for (const sau of character.skills) {
            const skillEquiped = character.supportSkill === sau.skill || character.primarySkill === sau.skill || character.secondarySkill === sau.skill;
            
            for (const skillValue of sau.skill.values) {
                if (skillValue.valueType !== EffectValueValueType.Upgrade) {
                    if (isEffectValueSynergy(skillValue)) {
                        stats.isolatedSynergies.push(synergyResolveData(skillValue, skillValue.displaySynergy, { skill: sau.skill }));
                    } else if (skillEquiped) {
                        this.addStat(stats.stats, skillValue.stat, skillValue.value);
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
                            this.addStat(stats.stats, upgradeValue.stat, upgradeValue.value);
                        }
                    }
                }

                this.addMechanicValues(upgrade.relatedMechanics, stats);
                this.addClassMechanicValues(upgrade.relatedClassMechanics, stats);
            }
        }
    }

    public addActivableValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        const activables = [character.activable1, character.activable2, character.activable3, character.activable4]
            .filter(isNotNullOrUndefined);
        for (const activable of activables) {
            for (const effectValue of activable.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (!isDamageType(effectValue.stat)) {
                        const source = 'level' in activable ? { activable } : { ancestralLegacy: activable };
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.displaySynergy, source, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
                    }
                } else {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value);
                }
            }
        }
    }

    private addBaseValues(character: Character, stats: ExtractedStats) {
        const baseStats = character.baseStats.map(stat => stat.values.map(value => <[string, number]>[stat.stat, value])).flat();
        for (const baseStat of baseStats) {
            this.addStat(stats.stats, baseStat[0], baseStat[1]);
        }
        this.addStat(stats.stats, 'hero_level', character.level);
    }

    private addStat(cache: { [key: string]: Array<number> }, stat: string, value: number) {
        if (stat === null) {
            console.log('NULL stat found at ', new Error().stack);
        } else {
            let foundStat = cache[stat];
            
            if (foundStat === undefined) {
                foundStat = [];
                cache[stat] = foundStat;
            }
    
            foundStat.push(value);
        }
    }

    public extractCharacterStats(character: Character, config: CharacterConfig, additionalItem: EquipableItem | null = null, mergedStatMapping: Array<MergedStatMapping>): ExtractedStats {
        const result: ExtractedStats = {
            synergies:  [],
            isolatedSynergies:  [],
            stats: { },
        }

        this.addCharacterValues(character, result);
        this.addConfigValues(character, config, result);
        this.addSkillPassiveValues(character, result, mergedStatMapping);
        this.addReaperValues(character, result, mergedStatMapping);
        this.addBaseValues(character, result);
        this.addAncestralLegacyValues(character, result, mergedStatMapping);
        this.addAttributesValues(character, result, mergedStatMapping);
        this.addGearValues(character, result, mergedStatMapping);
        this.addAdditionalItemValues(additionalItem, result, mergedStatMapping);
        this.addInventoryValues(character, result);
        this.addActivableValues(character, result, mergedStatMapping);
        this.addDefaultSynergies(character, config, result, mergedStatMapping)
        
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
                    this.addStat(extractedStats.stats, skillValue.stat, skillValue.value);
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
                        this.addStat(extractedStats.stats, upgradeValue.stat, upgradeValue.value);
                    }
                }
            }

            if (equipped && upgrade.cost !== 0) {
                this.addStat(extractedStats.stats, 'mana_cost_add', upgrade.cost);
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
            result.stats[stat] = (<Array<number>>characterStats.extractedStats[stat]).slice(0);
        }

        this.addSkillValues(skillAndUpgrades, result, mergedStatMapping)
        this.addUpgradeValues(skillAndUpgrades, result, mergedStatMapping)
        
        return result;
    }

    public extractSkillInfoStats(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, extractedStats: ExtractedStats) {
        if (skillAndUpgrades.skill.type === SkillType.Support) {
            this.addStat(extractedStats.stats, 'skill_is_support', 1);
        }
        if (skillAndUpgrades.skill.type === SkillType.Active) {
            this.addStat(extractedStats.stats, 'skill_is_active', 1);
        }
        if (skillAndUpgrades.skill === character.supportSkill) {
            this.addStat(extractedStats.stats, 'skill_is_equipped_support', 1);
        }
        if (skillAndUpgrades.skill === character.primarySkill) {
            this.addStat(extractedStats.stats, 'skill_is_equipped_primary', 1);
        }
        if (skillAndUpgrades.skill === character.secondarySkill) {
            this.addStat(extractedStats.stats, 'skill_is_equipped_secondary', 1);
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Melee)) {
            this.addStat(extractedStats.stats, 'skill_is_melee', 1);
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Projectile)) {
            this.addStat(extractedStats.stats, 'skill_is_projectile', 1);
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Aoe)) {
            this.addStat(extractedStats.stats, 'skill_is_aoe', 1);
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Temporal)) {
            this.addStat(extractedStats.stats, 'skill_is_temporal', 1);
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Arcanic)) {
            this.addStat(extractedStats.stats, 'skill_is_arcanic', 1);
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Obliteration)) {
            this.addStat(extractedStats.stats, 'skill_is_obliteration', 1);
        }

        this.addStat(extractedStats.stats, 'skill_id', skillAndUpgrades.skill.id);
        this.addStat(extractedStats.stats, 'mana_cost_add', skillAndUpgrades.skill.initialCost);
        this.addStat(extractedStats.stats, 'cooldown_time_add', skillAndUpgrades.skill.baseCooldown);
        if (character.supportSkill) {
            this.addStat(extractedStats.stats, 'support_skill', character.supportSkill.id);
        }
        if (character.primarySkill) {
            this.addStat(extractedStats.stats, 'primary_skill', character.primarySkill.id);
        }
        if (character.secondarySkill) {
            this.addStat(extractedStats.stats, 'secondary_skill', character.secondarySkill.id);
        }
    }
}