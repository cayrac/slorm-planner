import { Injectable } from '@angular/core';

import { MergedStatMapping } from '../../constants/content/data/data-character-stats-mapping';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { Activable } from '../../model/content/activable';
import { SynergyResolveData } from '../../model/content/character-stats';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { ALL_ATTRIBUTES } from '../../model/content/enum/attribute';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { EquipableItemBase } from '../../model/content/enum/equipable-item-base';
import { ALL_GEAR_SLOT_VALUES } from '../../model/content/enum/gear-slot';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { TraitLevel } from '../../model/content/enum/trait-level';
import { EquipableItem } from '../../model/content/equipable-item';
import { SkillType } from '../../model/content/skill-type';
import { synergyResolveData } from '../../util/synergy-resolver.util';
import { isDamageType, isEffectValueSynergy, isNotNullOrUndefined } from '../../util/utils';

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

    private addCharacterValues(character: Character, stats: ExtractedStats) {
        this.addStat(stats.stats, 'half_level', character.level / 2);
        this.addStat(stats.stats, 'remnant_damage_reduction_mult', -50);
    }
    
    private addConfigValues(config: CharacterConfig, stats: ExtractedStats) {
        this.addStat(stats.stats, 'all_level', config.all_characters_level);
        this.addStat(stats.stats, 'damage_stored', config.damage_stored);
        this.addStat(stats.stats, 'victims_reaper_104', config.victims_reaper_104);
        this.addStat(stats.stats, 'percent_missing_mana', config.percent_missing_mana);
        this.addStat(stats.stats, 'enemy_percent_missing_health', config.enemy_percent_missing_health);
        this.addStat(stats.stats, 'block_stacks', config.block_stacks);
        this.addStat(stats.stats, 'mana_lost_last_second', config.mana_lost_last_second);
        this.addStat(stats.stats, 'mana_gained_last_second', config.mana_gained_last_second);
    }

    private addAncestralLegacyValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        for (const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {
            const active = ancestralLegacy.rank > 0 && character.ancestralLegacies.activeAncestralLegacies.indexOf(ancestralLegacy.id) !== -1;

            for (const effectValue of ancestralLegacy.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (active && !isDamageType(effectValue.stat)) {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.synergy, { ancestralLegacy }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
                    } else {                        
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.synergy, { ancestralLegacy }));
                    }
                } else if (active) {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value);
                }
            }
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
                                stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.synergy, { attribute: attributeTraits }));
                            } else {
                                stats.synergies.push(synergyResolveData(effectValue, effectValue.synergy, { attribute: attributeTraits }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
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
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.synergy, { reaper: character.reaper }));
                    } else {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.synergy, { reaper: character.reaper }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
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
                        stats.isolatedSynergies.push(synergyResolveData(craftedEffect.effect, craftedEffect.effect.synergy, { item }));
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
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.synergy, { item }));
                    } else {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.synergy, { item }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
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
                stats.isolatedSynergies.push(synergyResolveData(synergy, synergy.synergy, { item: additionalItem }, this.getSynergyStatsItWillUpdate(synergy.stat, mergedStatMapping)));
            }
        }
    }

    private addSkillPassiveValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        for (const sau of character.skills) {
            const skillEquiped = character.supportSkill === sau.skill || character.primarySkill === sau.skill || character.secondarySkill === sau.skill;
            
            for (const skillValue of sau.skill.values) {
                if (skillValue.valueType !== EffectValueValueType.Upgrade) {
                    if (isEffectValueSynergy(skillValue)) {
                        stats.isolatedSynergies.push(synergyResolveData(skillValue, skillValue.synergy, { skill: sau.skill }));
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
                                stats.synergies.push(synergyResolveData(upgradeValue, upgradeValue.synergy, { upgrade }, this.getSynergyStatsItWillUpdate(upgradeValue.stat, mergedStatMapping)));
                            } else {
                                stats.isolatedSynergies.push(synergyResolveData(upgradeValue, upgradeValue.synergy, { upgrade }));
                            }
                        } else if (equipped) {
                            this.addStat(stats.stats, upgradeValue.stat, upgradeValue.value);
                        }
                    }
                }
            }
        }
    }

    public addActivableValues(character: Character, stats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        const activables = [character.activable1, character.activable2, character.activable3, character.activable4]
            .filter(isNotNullOrUndefined)
            .filter(a => 'level' in a) as Array<Activable>;
        for (const activable of activables) {
            for (const effectValue of activable.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (!isDamageType(effectValue.stat)) {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.synergy, { activable }, this.getSynergyStatsItWillUpdate(effectValue.stat, mergedStatMapping)));
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
        this.addConfigValues(config, result);
        this.addSkillPassiveValues(character, result, mergedStatMapping);
        this.addReaperValues(character, result, mergedStatMapping);
        this.addBaseValues(character, result);
        this.addAncestralLegacyValues(character, result, mergedStatMapping);
        this.addAttributesValues(character, result, mergedStatMapping);
        this.addGearValues(character, result, mergedStatMapping);
        this.addAdditionalItemValues(additionalItem, result, mergedStatMapping);
        this.addInventoryValues(character, result);
        this.addActivableValues(character, result, mergedStatMapping);
        
        return result;
    }

    private addSkillInfoValues(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, extractedStats: ExtractedStats) {
        if (skillAndUpgrades.skill.type === SkillType.Support) {
            extractedStats.stats['skill_is_support'] = [1];
        }
        if (skillAndUpgrades.skill.type === SkillType.Active) {
            extractedStats.stats['skill_is_active'] = [1];
        }
        if (skillAndUpgrades.skill === character.supportSkill) {
            extractedStats.stats['skill_is_equipped_support'] = [1];
        }
        if (skillAndUpgrades.skill === character.primarySkill) {
            extractedStats.stats['skill_is_equipped_primary'] = [1];
        }
        if (skillAndUpgrades.skill === character.secondarySkill) {
            extractedStats.stats['skill_is_equipped_secondary'] = [1];
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Melee)) {
            extractedStats.stats['skill_is_melee'] = [1];
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Projectile)) {
            extractedStats.stats['skill_is_projectile'] = [1];
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Temporal)) {
            extractedStats.stats['skill_is_temporal'] = [1];
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Arcanic)) {
            extractedStats.stats['skill_is_arcanic'] = [1];
        }
        if (skillAndUpgrades.skill.genres.includes(SkillGenre.Obliteration)) {
            extractedStats.stats['skill_is_obliteration'] = [1];
        }
        extractedStats.stats['skill_id'] = [skillAndUpgrades.skill.id];
        extractedStats.stats['mana_cost_add'] = [skillAndUpgrades.skill.initialCost];
        extractedStats.stats['cooldown_time_add'] = [skillAndUpgrades.skill.baseCooldown];
        if (character.supportSkill) {
            extractedStats.stats['support_skill'] = [character.supportSkill.id];
        }
        if (character.primarySkill) {
            extractedStats.stats['primary_skill'] = [character.primarySkill.id];
        }
        if (character.secondarySkill) {
            extractedStats.stats['secondary_skill'] = [character.secondarySkill.id];
        }
    }

    private addSkillValues(skillAndUpgrades: CharacterSkillAndUpgrades, extractedStats: ExtractedStats, mergedStatMapping: Array<MergedStatMapping>) {
        for (const skillValue of skillAndUpgrades.skill.values) {
                if (isEffectValueSynergy(skillValue)) {
                    if (!isDamageType(skillValue.stat) && skillValue.valueType !== EffectValueValueType.Upgrade) {
                        extractedStats.synergies.push(synergyResolveData(skillValue, skillValue.synergy, { skill: skillAndUpgrades.skill }, this.getSynergyStatsItWillUpdate(skillValue.stat, mergedStatMapping)));
                    } else {
                        extractedStats.isolatedSynergies.push(synergyResolveData(skillValue, skillValue.synergy, { skill: skillAndUpgrades.skill }));
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
                            extractedStats.synergies.push(synergyResolveData(upgradeValue, upgradeValue.synergy, { upgrade }, this.getSynergyStatsItWillUpdate(upgradeValue.stat, mergedStatMapping)));
                        } else {
                            extractedStats.isolatedSynergies.push(synergyResolveData(upgradeValue, upgradeValue.synergy, { upgrade }));
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

    public extractSkillStats(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, config: CharacterConfig, extractedStats: ExtractedStatMap, mergedStatMapping: Array<MergedStatMapping>): ExtractedStats {
        const result: ExtractedStats = {
            synergies:  [],
            isolatedSynergies:  [],
            stats: {},
        }

        for (const stat in extractedStats) {
            result.stats[stat] = (<Array<number>>extractedStats[stat]).slice(0);
        }

        this.addSkillInfoValues(character, skillAndUpgrades, result);
        this.addSkillValues(skillAndUpgrades, result, mergedStatMapping)
        this.addUpgradeValues(skillAndUpgrades, result, mergedStatMapping)
        
        return result;
    }
}