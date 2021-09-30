import { Injectable } from '@angular/core';

import { GLOBAL_MERGED_STATS_MAPPING, MergedStatMapping } from '../../constants/content/data/data-character-stats-mapping';
import { Character, CharacterSkillAndUpgrades } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { Activable } from '../../model/content/activable';
import { SynergyResolveData } from '../../model/content/character-stats';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { ALL_ATTRIBUTES } from '../../model/content/enum/attribute';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { ALL_GEAR_SLOT_VALUES } from '../../model/content/enum/gear-slot';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { TraitLevel } from '../../model/content/enum/trait-level';
import { EquipableItem } from '../../model/content/equipable-item';
import { SkillType } from '../../model/content/skill-type';
import { synergyResolveData } from '../../util/synergy-resolver.util';
import { isEffectValueSynergy, isNotNullOrUndefined } from '../../util/utils';

export declare type ExtractedStatMap = { [key: string]: Array<number> }

export interface ExtractedStats {
    stats: ExtractedStatMap;
    synergies: Array<SynergyResolveData>;
    isolatedSynergies: Array<SynergyResolveData>;
}

@Injectable()
export class SlormancerStatsExtractorService {

    private getSynergyStatsItWillUpdate(stat: string): Array<{ stat: string, mapping?: MergedStatMapping }> {
        let result: Array<{ stat: string, mapping?: MergedStatMapping }> = [];

        for (const mapping of GLOBAL_MERGED_STATS_MAPPING) {
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

    private isDamageStat(stat: string): boolean {
        return stat === 'damage' || stat === 'basic_damage' || stat === 'physical_damage' || stat === 'elemental_damage' || stat === 'weapon_damage';
    }
    
    private addConfigValues(config: CharacterConfig, stats: ExtractedStats) {
        this.addStat(stats.stats, 'all_level', config.all_characters_level);
        this.addStat(stats.stats, 'damage_stored', config.damage_stored);
        this.addStat(stats.stats, 'victims_reaper_104', config.victims_reaper_104);
    }

    private addAncestralLegacyValues(character: Character, stats: ExtractedStats) {
        for (const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {
            const active = ancestralLegacy.rank > 0 && character.ancestralLegacies.activeAncestralLegacies.indexOf(ancestralLegacy.id) !== -1;

            for (const effectValue of ancestralLegacy.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (active && !this.isDamageStat(effectValue.stat)) {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.synergy, { ancestralLegacy }, this.getSynergyStatsItWillUpdate(effectValue.stat)));
                    } else {                        
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.synergy, { ancestralLegacy }));
                    }
                } else if (active) {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value);
                }
            }
            for (const effectValue of ancestralLegacy.nextRankValues) {
                if (isEffectValueSynergy(effectValue)) {                      
                    stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.synergy, { ancestralLegacy }));
                }
            }
            for (const effectValue of ancestralLegacy.maxRankValues) {
                if (isEffectValueSynergy(effectValue)) {                      
                    stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.synergy, { ancestralLegacy }));
                }
            }
        }
    }

    private addAttributesValues(character: Character, stats: ExtractedStats) {
        const disableGreaterTraits = stats.stats['disable_greater_traits'] !== undefined;
        for (const attribute of ALL_ATTRIBUTES) {
            const attributeTraits = character.attributes.allocated[attribute];

            for (const trait of attributeTraits.traits) {
                if (!disableGreaterTraits || trait.traitLevel !== TraitLevel.Greater) {
                    for (const effectValue of trait.values) {
                        if (isEffectValueSynergy(effectValue)) {
                            if (!trait.unlocked || this.isDamageStat(effectValue.stat)) {                            
                                stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.synergy, { attribute: attributeTraits }));
                            } else {
                                stats.synergies.push(synergyResolveData(effectValue, effectValue.synergy, { attribute: attributeTraits }, this.getSynergyStatsItWillUpdate(effectValue.stat)));
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

    private addReaperValues(character: Character, stats: ExtractedStats) {
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
                    if (this.isDamageStat(effectValue.stat)) {
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.synergy, { reaper: character.reaper }));
                    } else {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.synergy, { reaper: character.reaper }, this.getSynergyStatsItWillUpdate(effectValue.stat)));
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

    private addGearValues(character: Character, stats: ExtractedStats) {
        const items = ALL_GEAR_SLOT_VALUES
            .map(slot => character.gear[slot])
            .filter(isNotNullOrUndefined);

        this.addStat(stats.stats, 'number_equipped_legendaries', items.filter(item => item.legendaryEffect !== null).length);

        for (const item of items) {
            const effectValues = [
                    ...item.affixes.map(affix => affix.craftedEffect.effect),
                    ...(item.legendaryEffect !== null ? item.legendaryEffect.effects.map(c => c.effect) : []),
                    ...(item.legendaryEffect !== null && item.legendaryEffect.activable !== null ? item.legendaryEffect.activable.values : [])
                ]
                .flat();
                
            for (const effectValue of effectValues) {
                if (isEffectValueSynergy(effectValue)) {
                    if (this.isDamageStat(effectValue.stat)) {
                        stats.isolatedSynergies.push(synergyResolveData(effectValue, effectValue.synergy, { item }));
                    } else {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.synergy, { item }, this.getSynergyStatsItWillUpdate(effectValue.stat)));
                    }
                } else {
                    this.addStat(stats.stats, effectValue.stat, effectValue.value);
                }
            }
        }
    }

    private addAdditionalItemValues(additionalItem: EquipableItem | null, stats: ExtractedStats) {
        if (additionalItem !== null) {
            const effectValues = [
                    ...(additionalItem.legendaryEffect !== null ? additionalItem.legendaryEffect.effects.map(c => c.effect) : []),
                    ...(additionalItem.legendaryEffect !== null && additionalItem.legendaryEffect.activable !== null ? additionalItem.legendaryEffect.activable.values : [])
                ]
                .flat()
                .filter(isEffectValueSynergy);
            
            for (const synergy of effectValues) {            
                stats.isolatedSynergies.push(synergyResolveData(synergy, synergy.synergy, { item: additionalItem }, this.getSynergyStatsItWillUpdate(synergy.stat)));
            }
        }
    }

    private addPassiveValues(character: Character, stats: ExtractedStats) {
        for (const sau of character.skills) {
            const skillEquiped = character.supportSkill === sau.skill || character.primarySkill === sau.skill || character.secondarySkill === sau.skill;
            
            for (const skillValue of sau.skill.values) {
                if (isEffectValueSynergy(skillValue)) {
                    stats.isolatedSynergies.push(synergyResolveData(skillValue, skillValue.synergy, { skill: sau.skill }));
                }
            }

            for (const upgrade of sau.upgrades) {
                const equipped = skillEquiped && sau.selectedUpgrades.includes(upgrade.id);
                for (const upgradeValue of upgrade.values) {
                    if (upgradeValue.valueType !== EffectValueValueType.Upgrade) {
                        if (isEffectValueSynergy(upgradeValue)) {
                            if (equipped && !this.isDamageStat(upgradeValue.stat)) {
                                stats.synergies.push(synergyResolveData(upgradeValue, upgradeValue.synergy, { upgrade }, this.getSynergyStatsItWillUpdate(upgradeValue.stat)));
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

    public addActivableValues(character: Character, stats: ExtractedStats) {
        const activables = [character.activable1, character.activable2, character.activable3, character.activable4]
            .filter(isNotNullOrUndefined)
            .filter(a => 'level' in a) as Array<Activable>;
        for (const activable of activables) {
            for (const effectValue of activable.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (!this.isDamageStat(effectValue.stat)) {
                        stats.synergies.push(synergyResolveData(effectValue, effectValue.synergy, { activable }, this.getSynergyStatsItWillUpdate(effectValue.stat)));
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

    public extractCharacterStats(character: Character, config: CharacterConfig, additionalItem: EquipableItem | null = null): ExtractedStats {
        const result: ExtractedStats = {
            synergies:  [],
            isolatedSynergies:  [],
            stats: { },
        }

        this.addConfigValues(config, result);
        this.addReaperValues(character, result);
        this.addBaseValues(character, result);
        this.addAncestralLegacyValues(character, result);
        this.addAttributesValues(character, result);
        this.addGearValues(character, result);
        this.addAdditionalItemValues(additionalItem, result);
        this.addInventoryValues(character, result);
        this.addPassiveValues(character, result);
        this.addActivableValues(character, result);
        
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
        extractedStats.stats['mana_cost_add'] = [skillAndUpgrades.skill.initialCost];
    }

    private addSkillValues(skillAndUpgrades: CharacterSkillAndUpgrades, extractedStats: ExtractedStats) {
        for (const skillValue of skillAndUpgrades.skill.values) {
            if (isEffectValueSynergy(skillValue)) {
                if (!this.isDamageStat(skillValue.stat)) {
                    extractedStats.synergies.push(synergyResolveData(skillValue, skillValue.synergy, { skill: skillAndUpgrades.skill }, this.getSynergyStatsItWillUpdate(skillValue.stat)));
                } else {
                    extractedStats.isolatedSynergies.push(synergyResolveData(skillValue, skillValue.synergy, { skill: skillAndUpgrades.skill }));
                }
            } else {
                this.addStat(extractedStats.stats, skillValue.stat, skillValue.value);
            }
        }
    }

    private addUpgradeValues(skillAndUpgrades: CharacterSkillAndUpgrades, extractedStats: ExtractedStats) {
        for (const upgrade of skillAndUpgrades.upgrades) {
            const equipped = skillAndUpgrades.selectedUpgrades.includes(upgrade.id);
            for (const upgradeValue of upgrade.values) {
                if (upgradeValue.valueType === EffectValueValueType.Upgrade) {
                    if (isEffectValueSynergy(upgradeValue)) {
                        if (equipped && !this.isDamageStat(upgradeValue.stat)) {
                            extractedStats.synergies.push(synergyResolveData(upgradeValue, upgradeValue.synergy, { upgrade }, this.getSynergyStatsItWillUpdate(upgradeValue.stat)));
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

    public extractSkillStats(character: Character, skillAndUpgrades: CharacterSkillAndUpgrades, config: CharacterConfig, extractedStats: ExtractedStatMap): ExtractedStats {
        const result: ExtractedStats = {
            synergies:  [],
            isolatedSynergies:  [],
            stats: { ...extractedStats },
        }

        this.addSkillInfoValues(character, skillAndUpgrades, result);
        this.addSkillValues(skillAndUpgrades, result)
        this.addUpgradeValues(skillAndUpgrades, result)
        
        return result;
    }
}