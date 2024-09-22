import { Injectable } from '@angular/core';

import { MAX_HERO_LEVEL, MAX_REAPER_AFFINITY_BONUS, PERCENT_STATS } from '../constants/common';
import { DATA_HERO_BASE_STATS } from '../constants/content/data/data-hero-base-stats';
import { AncestralLegacyType, MergedStat, SkillType } from '../model';
import { Character, CharacterMight } from '../model/character';
import { CharacterConfig } from '../model/character-config';
import { Activable } from '../model/content/activable';
import { AncestralLegacy } from '../model/content/ancestral-legacy';
import { ALL_ATTRIBUTES, Attribute } from '../model/content/enum/attribute';
import { ALL_GEAR_SLOT_VALUES } from '../model/content/enum/gear-slot';
import { ReaperSmith } from '../model/content/enum/reaper-smith';
import { SkillGenre } from '../model/content/enum/skill-genre';
import { EquipableItem } from '../model/content/equipable-item';
import { Reaper } from '../model/content/reaper';
import { Rune } from '../model/content/rune';
import { SkillElement } from '../model/content/skill-element';
import { round } from '../util';
import { isEffectValueSynergy, isFirst, isNotNullOrUndefined, valueOrDefault } from '../util/utils';
import { SlormancerAncestralLegacyNodesService, SlormancerMightService } from './content';
import { SlormancerActivableService } from './content/slormancer-activable.service';
import { SlormancerAncestralLegacyService } from './content/slormancer-ancestral-legacy.service';
import { SlormancerAttributeService } from './content/slormancer-attribute.service';
import { SlormancerClassMechanicService } from './content/slormancer-class-mechanic.service';
import { SlormancerItemService } from './content/slormancer-item.service';
import { SlormancerMechanicService } from './content/slormancer-mechanic.service';
import { SlormancerReaperService } from './content/slormancer-reaper.service';
import { SlormancerRuneService } from './content/slormancer-rune.service';
import { SlormancerSkillService } from './content/slormancer-skill.service';
import { ExtractedStatMap } from './content/slormancer-stats-extractor.service';
import { CharacterStatsBuildResult, SlormancerStatsService } from './content/slormancer-stats.service';
import { SlormancerSynergyResolverService } from './content/slormancer-synergy-resolver.service';
import { SlormancerTranslateService } from './content/slormancer-translate.service';
import { SlormancerValueUpdaterService } from './content/slormancer-value-updater.service';

@Injectable()
export class SlormancerCharacterUpdaterService {

    private readonly LEVEL_LABEL = this.slormancerTranslateService.translate('level').toLowerCase();

    constructor(private slormancerAttributeService: SlormancerAttributeService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerStatsService: SlormancerStatsService,
                private slormancerSkillService: SlormancerSkillService,
                private slormancerReaperService: SlormancerReaperService,
                private slormancerItemService: SlormancerItemService,
                private slormancerActivableService: SlormancerActivableService,
                private slormancerMechanicService: SlormancerMechanicService,
                private slormancerClassMechanicService: SlormancerClassMechanicService,
                private slormancerRuneService: SlormancerRuneService,
                private slormancerValueUpdater: SlormancerValueUpdaterService,
                private slormancerSynergyResolverService: SlormancerSynergyResolverService,
                private slormancerAncestralLegacyNodesService: SlormancerAncestralLegacyNodesService,
                private slormancerMightService: SlormancerMightService,
        ) { }

    private applyReaperAffinities(character: Character, reaper: Reaper, config: CharacterConfig) {
        const items = ALL_GEAR_SLOT_VALUES.map(slot => character.gear[slot]).filter(isNotNullOrUndefined);

        let bonusAffinity = 0;
        for (const item of items) {
            if (item.reaperEnchantment !== null && item.reaperEnchantment.craftedReaperSmith == reaper.smith.id) {
                bonusAffinity += item.reaperEnchantment.craftedValue;
            }
        }

        if (bonusAffinity > MAX_REAPER_AFFINITY_BONUS) {
            bonusAffinity = MAX_REAPER_AFFINITY_BONUS;
        }

        // applying fulgurorn's reaper bonuses
        if (reaper.id === 53) {
            let fulgurornBonuses = 0;
            for (const item of items) {
                if (item.reaperEnchantment !== null && item.reaperEnchantment.craftedReaperSmith == ReaperSmith.Fulgurorn) {
                    fulgurornBonuses += item.reaperEnchantment.craftedValue;
                }
            }

            const maxStacks = reaper.templates.base
                .map(base => base.values)
                .flat()
                .find(stat => stat.stat === 'fulgurorn_dedication_max_stacks');

            if (maxStacks !== undefined && isEffectValueSynergy(maxStacks)) {
                let extractedStats: ExtractedStatMap = {};
                extractedStats['reapersmith_5'] = [{ value: fulgurornBonuses, source: { character } }];
                this.slormancerSynergyResolverService.resolveSyngleSynergy(maxStacks, [], extractedStats, { reaper })
    
                bonusAffinity += Math.min(<number>maxStacks.displaySynergy, config.fulgurorn_dedication_stacks);
            }
        }

        if (reaper.bonusAffinity !== bonusAffinity) {
            reaper.bonusAffinity = bonusAffinity;
            this.slormancerReaperService.updateReaperModel(reaper);
            this.slormancerReaperService.updateReaperView(reaper);
        }
    }

    private updateEquipmentBonuses(character: Character, config: CharacterConfig) {
        const items = ALL_GEAR_SLOT_VALUES.map(slot => character.gear[slot]).filter(isNotNullOrUndefined);
        const attributeBonuses = {
            [Attribute.Toughness]: 0,
            [Attribute.Savagery]: 0,
            [Attribute.Fury]: 0,
            [Attribute.Determination]: 0,
            [Attribute.Zeal]: 0,
            [Attribute.Willpower]: 0,
            [Attribute.Dexterity]: 0,
            [Attribute.Bravery]: 0,
        };
        const skillBonuses: {[key: number]: number} = {};
        let ancestralLegacyBonuses = 0;

        for (const item of items) {
            if (item.attributeEnchantment !== null) {
                attributeBonuses[item.attributeEnchantment.craftedAttribute] += item.attributeEnchantment.craftedValue;
            }
            if (item.skillEnchantment !== null) {
                skillBonuses[item.skillEnchantment.craftedSkill] = valueOrDefault(skillBonuses[item.skillEnchantment.craftedSkill], 0) + item.skillEnchantment.craftedValue;
            }
            if (item.legendaryEffect !== null) {
                ancestralLegacyBonuses += item.legendaryEffect.effects
                    .filter(effect => effect.effect.stat === 'ancestral_rank_add')
                    .reduce((total, effect) => total + effect.effect.value, 0);
            }
        }

        this.applyReaperAffinities(character, character.reaper, config);

        for (const attribute of ALL_ATTRIBUTES) {
            if (character.attributes.allocated[attribute].bonusRank !== attributeBonuses[attribute]) {
                character.attributes.allocated[attribute].bonusRank = attributeBonuses[attribute];
                this.slormancerAttributeService.updateAttributeTraits(character.attributes.allocated[attribute]);
            }
        }

        for (const skill of character.skills) {
            let bonus = valueOrDefault(skillBonuses[skill.skill.id], 0);

            if (character.primarySkill === skill.skill && [7, 8, 9].includes(character.reaper.id)) {
                bonus += character.reaper.templates.base.map(effect => effect.values).flat()
                    .filter(value => value.stat === 'primary_skill_level_bonus')
                    .reduce((total, value) => total + value.value, 0);
            }

            if (skill.skill.bonusLevel !== bonus) {
                skill.skill.bonusLevel = bonus;
                this.slormancerSkillService.updateSkillModel(skill.skill);
            }
        }

        const ancestralLegaciesToUpdate = character.ancestralLegacies.ancestralLegacies.filter(al => al.bonusRank !== ancestralLegacyBonuses);
        for (const ancestralLegacy of ancestralLegaciesToUpdate) {
            this.slormancerAncestralLegacyService.updateAncestralLegacyModel(ancestralLegacy, ancestralLegacy.rank, ancestralLegacyBonuses);
            this.slormancerAncestralLegacyService.updateAncestralLegacyView(ancestralLegacy);
        }
    }

    private updateChangedEntities(statsResult: CharacterStatsBuildResult) {
        for (const item of statsResult.changed.items.filter(isFirst)) {
            this.slormancerItemService.updateEquipableItemView(item);
        }
        for (const ancestralLegacy of statsResult.changed.ancestralLegacies.filter(isFirst)) {
            this.slormancerAncestralLegacyService.updateAncestralLegacyView(ancestralLegacy); 
        }
        for (const reaper of statsResult.changed.reapers.filter(isFirst)) {
            this.slormancerReaperService.updateReaperView(reaper);
        }
        for (const skill of statsResult.changed.skills.filter(isFirst)) {
            this.slormancerSkillService.updateSkillView(skill);
        }
        for (const upgrade of statsResult.changed.upgrades.filter(isFirst)) {
            this.slormancerSkillService.updateUpgradeView(upgrade);
        }
        for (const attribute of statsResult.changed.attributes.filter(isFirst)) {
            this.slormancerAttributeService.updateAttributeTraits(attribute);
        }
        for (const activable of statsResult.changed.activables) {
            this.slormancerActivableService.updateActivableView(activable);
        }
        for (const mechanic of statsResult.changed.mechanics) {
            this.slormancerMechanicService.updateMechanicView(mechanic);
        }
        for (const classMechanic of statsResult.changed.classMechanic) {
            this.slormancerClassMechanicService.updateClassMechanicView(classMechanic);
        }
        for (const rune of statsResult.changed.runes) {
            this.slormancerRuneService.updateRuneView(rune);
        }
    }

    private updateIssues(character: Character, statsResult: CharacterStatsBuildResult) {
        character.issues = [];
        if (statsResult.unresolvedSynergies.length > 1) {
            let issue: string | null = null;
            const hasSavagery60 = statsResult.unresolvedSynergies
                .some(resolveData => 'attribute' in resolveData.objectSource && resolveData.objectSource.attribute.attribute === Attribute.Savagery && resolveData.objectSource.attribute.rank >= 60);
            const convertReaperToElemental = statsResult.unresolvedSynergies
                .some(resolveData => ['weapon_to_elemental_damage'].includes(resolveData.effect.stat));
            if (hasSavagery60 && convertReaperToElemental) {
                issue = 'Your build is using the Savagery rank 60 trait and convert reaper damage to elemental damage leading to a synergy loop.'
            } else {
                const names = statsResult.unresolvedSynergies
                    .map(unresolvedSynergy => {
                        let result: string | null = null;
    
                        if ('activable' in unresolvedSynergy.objectSource) {
                            result = unresolvedSynergy.objectSource.activable.name;
                        } else if ('ancestralLegacy' in unresolvedSynergy.objectSource) {
                            result = unresolvedSynergy.objectSource.ancestralLegacy.name;
                        } else if ('attribute' in unresolvedSynergy.objectSource) {
                            result = unresolvedSynergy.objectSource.attribute.attributeName;
                        } else if ('item' in unresolvedSynergy.objectSource) {
                            result = unresolvedSynergy.objectSource.item.name;
                        } else if ('reaper' in unresolvedSynergy.objectSource) {
                            result = unresolvedSynergy.objectSource.reaper.name;
                        } else if ('skill' in unresolvedSynergy.objectSource) {
                            result = unresolvedSynergy.objectSource.skill.name;
                        } else if ('upgrade' in unresolvedSynergy.objectSource) {
                            result = unresolvedSynergy.objectSource.upgrade.name;
                        } else if ('mechanic' in unresolvedSynergy.objectSource) {
                            result = unresolvedSynergy.objectSource.mechanic.name;
                        } else if ('classMechanic' in unresolvedSynergy.objectSource) {
                            result = unresolvedSynergy.objectSource.classMechanic.name;
                        } else if ('rune' in unresolvedSynergy.objectSource) {
                            result = unresolvedSynergy.objectSource.rune.name;
                        }
    
                        return result;
                    }).filter(isNotNullOrUndefined)
                      .filter(isFirst);
                issue = 'Your build contain an unresolved synergy loop between : ' + names.join(', ')
            }

            if (issue !== null) {
                character.issues.push(issue + "\n\n" + 'Stats from synergy loops cannot be statically computed.');
            }
        }

        if (character.fromCorrupted) {
            character.issues.push('This build has been recovered from a corrupted version of the slorm planner, data may be incomplete');
        }
        
        // déplacer dans le updateIssues avec stats au dessus du max ?
        const noMaxManaLock = 'ungifted_mana_lock_no_max' in statsResult.extractedStats
        const manaLockpercentStat = statsResult.extractedStats['mana_lock_percent'];
        const percentLockedHealthStat = statsResult.extractedStats['percent_locked_health'];

        const manaLockpercent = manaLockpercentStat && manaLockpercentStat[0] ? manaLockpercentStat[0] : null;
        const lifeLockpercent = percentLockedHealthStat && percentLockedHealthStat[0] ? percentLockedHealthStat[0] : null;
        if (manaLockpercent && manaLockpercent.value > 100 && !noMaxManaLock) {
            character.issues.push('Mana locked is over your maximum mana');
        }
        if (lifeLockpercent && lifeLockpercent.value > 100) {
            character.issues.push('Life locked is over your maximum life');
        }

        if (character.attributes.remainingPoints < 0) {
            character.issues.push('More than ' + MAX_HERO_LEVEL + ' attribute points allocated');
        }
    }

    private getCharacterStatsResult(character: Character, config: CharacterConfig, additionalItem: EquipableItem | null, additionalRunes: Array<Rune> = [], additionalStats: ExtractedStatMap = {}): CharacterStatsBuildResult {
        const stats = DATA_HERO_BASE_STATS[character.heroClass];
        
        character.baseStats = stats.baseStats.map(baseStat => ({
            stat: baseStat.stat,
            values: [ baseStat.perLevel !== 0 ? Math.round(baseStat.base + character.level * baseStat.perLevel) : baseStat.base ]
        }));
        const levelStats = valueOrDefault(stats.levelonlyStat[character.level], []);
        for (const levelStat of levelStats) {
            character.baseStats.push({ stat: levelStat.stat, values: [levelStat.value]});
        }

        return this.slormancerStatsService.updateCharacterStats(character, config, additionalItem, additionalRunes, additionalStats);
    }

    private updateCharacterActivables(character: Character, statsResult: CharacterStatsBuildResult, config: CharacterConfig, additionalItem: EquipableItem | null, additionalRunes: Array<Rune> = [], preComputing: boolean): { items: Array<EquipableItem>, ancestralLegacies: Array<AncestralLegacy>, reapers: Array<Reaper>, runes: Array<Rune> } {
        const ancestralLegacies = character.ancestralLegacies.ancestralLegacies;
        const items = <Array<EquipableItem>>[...ALL_GEAR_SLOT_VALUES.map(slot => character.gear[slot]), ...character.inventory, ...character.sharedInventory.flat(), additionalItem]
            .filter(item => item !== null && item.legendaryEffect !== null && item.legendaryEffect.activable !== null);
        const runes = [character.runes.activation, character.runes.effect, character.runes.enhancement, ...additionalRunes]
            .filter(isNotNullOrUndefined)
            .filter(rune => rune.activable !== null)
        const result: { items: Array<EquipableItem>, ancestralLegacies: Array<AncestralLegacy> } = { items: [], ancestralLegacies: [] };
        const reapers = character.reaper.activables.length > 0 ? [character.reaper] : [];

        for (const ancestralLegacy of ancestralLegacies) {
            if (ancestralLegacy.genres.includes(SkillGenre.Aura) || !preComputing) {
                this.slormancerAncestralLegacyService.updateAncestralLegacyCost(ancestralLegacy)
                this.slormancerValueUpdater.updateAncestralLegacyActivable(character, config, ancestralLegacy, statsResult);
                result.ancestralLegacies.push(ancestralLegacy);
            }
        }
        for (const item of items) {
            const activable = <Activable>item.legendaryEffect?.activable;
            if (activable.genres.includes(SkillGenre.Aura) || !preComputing) {
                this.slormancerActivableService.updateActivableCost(activable);
                this.slormancerValueUpdater.updateActivable(character, activable, statsResult, config);
                result.items.push(item);
            }
        }

        for (const reaper of reapers) {
            for (const activable of reaper.activables) {
                if (activable.genres.includes(SkillGenre.Aura) || activable.id === 17 || !preComputing) {
                    this.slormancerValueUpdater.updateActivable(character, activable, statsResult, config);
                }
            }
        }

        for (const rune of runes) {
            if (rune !== null && rune.activable !== null && !preComputing) {
                this.slormancerValueUpdater.updateActivable(character, rune.activable, statsResult, config);
            }
        }
        
        return { items, ancestralLegacies, reapers, runes };
    }

    private updateSkillsElements(character: Character, stats: CharacterStatsBuildResult, config: CharacterConfig) {
        for (const skillAndUpgrades of character.skills) {
            skillAndUpgrades.skill.elements = [];

            if (skillAndUpgrades.skill.specialization === null) {
                if (stats.extractedStats['primary_secondary_skill_ice_imbued'] !== undefined) {
                    skillAndUpgrades.skill.elements.push(SkillElement.Ice);
                }
                if (stats.extractedStats['primary_secondary_skill_lightning_imbued'] !== undefined) {
                    skillAndUpgrades.skill.elements.push(SkillElement.Lightning);
                }
                if (stats.extractedStats['primary_secondary_skill_light_imbued'] !== undefined) {
                    skillAndUpgrades.skill.elements.push(SkillElement.Light);
                }
                if (stats.extractedStats['primary_secondary_skill_shadow_imbued'] !== undefined) {
                    skillAndUpgrades.skill.elements.push(SkillElement.Shadow);
                }
                if (stats.extractedStats['primary_secondary_skill_fire_imbued'] !== undefined) {
                    skillAndUpgrades.skill.elements.push(SkillElement.Fire);
                }
            }
        }
    }

    private applyReaperBonusLevel(character: Character, config: CharacterConfig): boolean {
        let changed = false;
        let minLevel = 0;

        if (character.gear.amulet !== null && character.gear.amulet.legendaryEffect !== null && character.gear.amulet.legendaryEffect.id === 83) {
            const legendaryAffix = character.gear.amulet.legendaryEffect.effects.find(effect => effect.effect.stat === 'min_reaper_level');

            if (legendaryAffix) {
                minLevel = Math.min(legendaryAffix.effect.value, config.highest_same_type_reaper_level);
            }

            const expectedBonusLevel = minLevel - character.reaper.baseLevel;
            if (expectedBonusLevel >= 0) {
                changed = character.reaper.bonusLevel !== expectedBonusLevel
                character.reaper.bonusLevel = expectedBonusLevel;
            }
        }

        if (changed) {
            this.slormancerReaperService.updateReaperModel(character.reaper);
        }

        return changed;
    }

    private extractAcademicianStats(character: Character, stats: CharacterStatsBuildResult): ExtractedStatMap {
        const result: ExtractedStatMap = {}; 
        const misscalculatedStats: string[] = [];
        const miscalculationTresholdStat = stats.extractedStats['miscalculation_treshold'];
        if (miscalculationTresholdStat) {
            const miscalculationTresholdEntityValue = miscalculationTresholdStat[0];
            if (miscalculationTresholdEntityValue) {
                const miscalculationTreshod = miscalculationTresholdEntityValue.value;

                const percentStats = stats.stats.filter(mergedStat => PERCENT_STATS.includes(mergedStat.stat)) as MergedStat<number>[];
                for(const percentStat of percentStats) {
                    if (percentStat.total < miscalculationTreshod) {
                        result['academician_' + percentStat.stat + '_mult'] = [ { value: -100, source: { reaper: character.reaper } } ];
                        misscalculatedStats.push(percentStat.stat);
                    }
                }
            }
        }

        const probabilityChangedStats: string[] = [];
        let probabilityFinalValue = 0;
        const probabilityTresholdStat = stats.extractedStats['probability_treshold']
        const probabilityDefaultValueStat = stats.extractedStats['probability_default_value']
        const probabilityDefaultValueIncreasedPercentStat = stats.extractedStats['probability_default_value_increased_percent'];
        if (probabilityTresholdStat && probabilityDefaultValueStat && probabilityDefaultValueIncreasedPercentStat) {
            const probabilityTresholdEntityValue = probabilityTresholdStat[0];
            const probabilityDefaultValueEntityValue = probabilityDefaultValueStat[0];
            const probabilityDefaultValueIncreasedPercentEntityValue = probabilityDefaultValueIncreasedPercentStat[0];
            if (probabilityTresholdEntityValue && probabilityDefaultValueEntityValue && probabilityDefaultValueIncreasedPercentEntityValue) {
                const PROBABILITY_STATS = [
                    'inner_fire_chance',
                    'overdrive_chance',
                    // 'recast_chance', // currently ignored by academician reaper
                    'chance_to_pierce',
                    'fork_chance',
                    'chance_to_rebound',
                    'critical_chance',
                    'ancestral_chance',
                ];
                const probabilityDefaultValue = probabilityDefaultValueEntityValue.value;
                const probabilityDefaultValueIncreasedPercent = probabilityDefaultValueIncreasedPercentEntityValue.value;
                probabilityFinalValue = round(probabilityDefaultValue * (100 + probabilityDefaultValueIncreasedPercent) / 100, 3);

                const probabilityStats = stats.stats.filter(mergedStat => PROBABILITY_STATS.includes(mergedStat.stat)) as MergedStat<number>[];
                for(const probabilityStat of probabilityStats) {
                    if (probabilityStat.total === 0 || misscalculatedStats.includes(probabilityStat.stat)) {
                        result['academician_' + probabilityStat.stat + '_extra'] = [ { value: probabilityFinalValue, source: { reaper: character.reaper } } ];
                        probabilityChangedStats.push(probabilityStat.stat);
                    }
                }
            }
        }

        const criticalChanceStat = stats.stats.find(mergedStat => mergedStat.stat === 'critical_chance');
        const ancestralChanceStat = stats.stats.find(mergedStat => mergedStat.stat === 'ancestral_chance');

        if (criticalChanceStat && ancestralChanceStat) {
            let totalCritical = criticalChanceStat.total as number;
            let totalAncestral = ancestralChanceStat.total as number;

            if (probabilityChangedStats.includes('critical_chance')){
                totalCritical = probabilityFinalValue;
            }
            if (probabilityChangedStats.includes('ancestral_chance')){
                totalAncestral = probabilityFinalValue;
            }

            if (totalCritical === totalAncestral) {
                result['critical_chance_equal_ancestral_chance'] = [ { value: 0, source: { reaper: character.reaper } } ];
                if (!result['academician_critical_damage_mult']) {
                    result['academician_critical_damage_mult'] = [ { value: -100, source: { reaper: character.reaper } } ];
                }
            }
        }

        return result;
    }

    private updateCharacterStats(character: Character, updateViews: boolean, config: CharacterConfig, additionalItem: EquipableItem | null, additionalRunes: Array<Rune> = []) {

        const reaperChanged = this.applyReaperBonusLevel(character, config);

        const statResultPreComputing = this.getCharacterStatsResult(character, config, additionalItem, additionalRunes);

        const preComputingChanged = this.updateCharacterActivables(character, statResultPreComputing, config, additionalItem, additionalRunes, true);

        this.slormancerValueUpdater.precomputeRunePowerAndEffect(character, additionalRunes, statResultPreComputing, config);

        if (character.ultimatum !== null) {
            character.ultimatum.locked = statResultPreComputing.extractedStats['disable_ultimatum'] !== undefined;
        }

        const additionalStats = this.extractAcademicianStats(character, statResultPreComputing);

        const statsResult = this.getCharacterStatsResult(character, config, additionalItem, additionalRunes, additionalStats);
        character.stats = statsResult.stats;

        if (reaperChanged) {
            statsResult.changed.reapers.push(character.reaper);
        }

        statsResult.changed.items.push(...preComputingChanged.items);
        statsResult.changed.items.push(...statResultPreComputing.changed.items);
        statsResult.changed.ancestralLegacies.push(...preComputingChanged.ancestralLegacies);
        statsResult.changed.ancestralLegacies.push(...statResultPreComputing.changed.ancestralLegacies);
        statsResult.changed.activables.push(...statResultPreComputing.changed.activables);
        statsResult.changed.attributes.push(...statResultPreComputing.changed.attributes);
        statsResult.changed.reapers.push(...statResultPreComputing.changed.reapers);
        statsResult.changed.reapers.push(...preComputingChanged.reapers);
        statsResult.changed.skills.push(...statResultPreComputing.changed.skills);
        statsResult.changed.upgrades.push(...statResultPreComputing.changed.upgrades);
        statsResult.changed.mechanics.push(...statResultPreComputing.changed.mechanics);
        statsResult.changed.classMechanic.push(...statResultPreComputing.changed.classMechanic);
        statsResult.changed.runes.push(...statResultPreComputing.changed.runes);
        statsResult.changed.runes.push(...preComputingChanged.runes);

        this.slormancerValueUpdater.updateReaper(character.reaper, statsResult);
        statsResult.changed.reapers.push(character.reaper);

        for (const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {

            if (statsResult.unlockedAncestralLegacies.includes(ancestralLegacy.id)) {
                statsResult.changed.ancestralLegacies.push(ancestralLegacy);
                this.slormancerAncestralLegacyService.updateAncestralLegacyModel(ancestralLegacy, ancestralLegacy.baseMaxRank);
                if (!character.ancestralLegacies.activeAncestralLegacies.includes(ancestralLegacy.id)) {
                    character.ancestralLegacies.activeAncestralLegacies.push(ancestralLegacy.id);
                }
            }

            for (const mechanic of ancestralLegacy.relatedMechanics) {
                this.slormancerValueUpdater.updateMechanic(mechanic, character, statsResult, config);
                statsResult.changed.mechanics.push(mechanic);
            }
        }

        const lockedSkills: Array<number> = [];
        if (statsResult.extractedStats['primary_slot_locked'] !== undefined && character.primarySkill !== null) {
            lockedSkills.push(character.primarySkill.id);
        }
        if (statsResult.extractedStats['secondary_slot_locked'] !== undefined && character.secondarySkill !== null) {
            lockedSkills.push(character.secondarySkill.id);
        }

        this.updateSkillsElements(character, statsResult, config);

        for (const skillAndUpgrades of character.skills) {
            const result = this.slormancerStatsService.updateSkillStats(character, skillAndUpgrades, config, statsResult);
            this.slormancerValueUpdater.updateSkillAndUpgradeValues(character, skillAndUpgrades, result, config);
            statsResult.changed.skills.push(skillAndUpgrades.skill);
            statsResult.changed.upgrades.push(...skillAndUpgrades.upgrades);
            skillAndUpgrades.stats = statsResult.stats;

            for (const upgrade of skillAndUpgrades.upgrades) {
                for (const classMechanic of upgrade.relatedClassMechanics) {
                    this.slormancerValueUpdater.updateClassMechanic(classMechanic, statsResult);
                    statsResult.changed.classMechanic.push(classMechanic);
                }
            }

            skillAndUpgrades.skill.locked = lockedSkills.includes(skillAndUpgrades.skill.id);

        }

        this.slormancerValueUpdater.updateRuneValues(character, additionalRunes, statsResult, config);

        const activableChanged = this.updateCharacterActivables(character, statsResult, config, additionalItem, additionalRunes, false);
        statsResult.changed.items.push(...activableChanged.items);
        statsResult.changed.ancestralLegacies.push(...activableChanged.ancestralLegacies);
        statsResult.changed.reapers.push(...activableChanged.reapers);
        statsResult.changed.runes.push(...activableChanged.runes);

        this.updateIssues(character, statsResult)

        if (updateViews) {
            this.updateChangedEntities(statsResult);
        }

    }

    private removeUnavailableActivables(character: Character) {
        const availableActivables: Array<number> = [
            ...[character.runes.activation, character.runes.effect, character.runes.enhancement]
                .map(rune => rune === null ? null : rune.activable),
            ...character.reaper.activables,
            ...character.ancestralLegacies.ancestralLegacies.filter(ancestralLegacy => ancestralLegacy.isActivable && character.ancestralLegacies.activeAncestralLegacies.includes(ancestralLegacy.id)),
            ...ALL_GEAR_SLOT_VALUES.map(slot => character.gear[slot]?.legendaryEffect?.activable)
        ].filter(isNotNullOrUndefined)
            .map(activable => activable.id);

        if (character.activable1 !== null && !availableActivables.includes(character.activable1.id)) {
            character.activable1 = null;
        }
        if (character.activable2 !== null && !availableActivables.includes(character.activable2.id)) {
            character.activable2 = null;
        }
        if (character.activable3 !== null && !availableActivables.includes(character.activable3.id)) {
            character.activable3 = null;
        }
        if (character.activable4 !== null && !availableActivables.includes(character.activable4.id)) {
            character.activable4 = null;
        }
    }

    private addAdditionalAncestralLegacySkillAtMaxRank(character: Character, ancestralLegacy: AncestralLegacy) {
        if (!character.ancestralLegacies.activeAncestralLegacies.includes(ancestralLegacy.id)) {
            character.ancestralLegacies.activeAncestralLegacies.push(ancestralLegacy.id);
        }
        
        if (ancestralLegacy.rank < ancestralLegacy.maxRank) {
            this.slormancerAncestralLegacyService.updateAncestralLegacyModel(ancestralLegacy, ancestralLegacy.baseRank, ancestralLegacy.bonusRank, ancestralLegacy.maxRank);
            this.slormancerAncestralLegacyService.updateAncestralLegacyView(ancestralLegacy);
        }
    }

    private updateAncestralLegacySkills(character: Character) {
        character.ancestralLegacies.activeAncestralLegacies = this.slormancerAncestralLegacyNodesService.getAncestralLegacyIds(character);

        for (const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {
            if (ancestralLegacy.forcedRank !== null) {
                this.slormancerAncestralLegacyService.updateAncestralLegacyModel(ancestralLegacy, ancestralLegacy.baseRank, ancestralLegacy.bonusRank);
                this.slormancerAncestralLegacyService.updateAncestralLegacyView(ancestralLegacy);
            }
        }

        if (character.reaper.id === 77 && character.reaper.primordial) {
            const activeImbues = character.ancestralLegacies.ancestralLegacies
                .filter(ancestralLegacy => character.ancestralLegacies.activeAncestralLegacies.includes(ancestralLegacy.id) && ancestralLegacy.types.includes(AncestralLegacyType.Imbue));
            const elements = activeImbues.map(ancestralLegacy => ancestralLegacy.element).filter(isFirst);

            for(const element of elements) {
                const elementImbues = activeImbues.filter(ancestralLegacy => ancestralLegacy.element === element);

                if (elementImbues.length === 2) {
                    const elementImbues = character.ancestralLegacies.ancestralLegacies
                        .filter(ancestralLegacy => ancestralLegacy.element === element && ancestralLegacy.types.includes(AncestralLegacyType.Imbue));
                    if (elementImbues.length > 0) {
                        const highestImbueId = Math.max(...elementImbues.map(ancestralLegacy => ancestralLegacy.id));
                        const highestImbue = elementImbues.find(ancestralLegacy => ancestralLegacy.id === highestImbueId) as AncestralLegacy;

                        this.addAdditionalAncestralLegacySkillAtMaxRank(character, highestImbue);
                    }
                }
            }

        }

        if (character.reaper.id === 86) {
            const adjacentRealmIds = this.slormancerAncestralLegacyNodesService.getAdjacentRealms(character)
                .map(realm => realm.realm);

            const adjacentAncestralStrikes = character.ancestralLegacies.ancestralLegacies
                .filter(ancestralLegacy => adjacentRealmIds.includes(ancestralLegacy.realm) && ancestralLegacy.types.includes(AncestralLegacyType.Ancestral))
        
            for (const ancestralStrike of adjacentAncestralStrikes) {
                this.addAdditionalAncestralLegacySkillAtMaxRank(character, ancestralStrike);
            }
        }

        if (character.reaper.id === 108) {
            const judgeOfLight = character.ancestralLegacies.ancestralLegacies.find(ancestralLegacy => ancestralLegacy.id === 54);
            if (judgeOfLight) {
                this.addAdditionalAncestralLegacySkillAtMaxRank(character, judgeOfLight);
            }
        }

        if (character.reaper.id === 109) {
            const blackPact = character.ancestralLegacies.ancestralLegacies.find(ancestralLegacy => ancestralLegacy.id === 68);
            if (blackPact) {
                this.addAdditionalAncestralLegacySkillAtMaxRank(character, blackPact);
            }
        }

        if (character.reaper.id === 116) {
            const windsOfWinter = character.ancestralLegacies.ancestralLegacies.find(ancestralLegacy => ancestralLegacy.id === 27);
            if (windsOfWinter) {
                this.addAdditionalAncestralLegacySkillAtMaxRank(character, windsOfWinter);
            }
        }

        if (character.reaper.id === 119) {
            const blormUp = character.ancestralLegacies.ancestralLegacies.find(ancestralLegacy => ancestralLegacy.id === 63);
            if (blormUp) {
                this.addAdditionalAncestralLegacySkillAtMaxRank(character, blormUp);
            }
        }

        if (character.reaper.id === 115 && character.reaper.primordial) {
            const fieryWeapon = character.ancestralLegacies.ancestralLegacies.find(ancestralLegacy => ancestralLegacy.id === 8);
            if (fieryWeapon) {
                this.addAdditionalAncestralLegacySkillAtMaxRank(character, fieryWeapon);
            }
            const moreFire = character.ancestralLegacies.ancestralLegacies.find(ancestralLegacy => ancestralLegacy.id === 9);
            if (moreFire) {
                this.addAdditionalAncestralLegacySkillAtMaxRank(character, moreFire);
            }

            const normalOrFireAncestralLegacies = character.ancestralLegacies.ancestralLegacies
                .filter(ancestralLegacy => ancestralLegacy.element === SkillElement.Neutral || ancestralLegacy.element === SkillElement.Fire)
                .map(ancestralLegacy => ancestralLegacy.id);
            character.ancestralLegacies.activeAncestralLegacies = character.ancestralLegacies.activeAncestralLegacies
                .filter(ancestralLegacyId => normalOrFireAncestralLegacies.includes(ancestralLegacyId));
        }
    }

    private updateActiveSkillUpgrades(character: Character) {
        const addOtherNonEquippedSpecPassives = character.reaper.primordial && character.reaper.templates.benediction
            .map(be => be.values).flat()
            .find(value => value.stat === 'add_other_non_equipped_spec_passives') !== undefined;
        const removeEquippedSpecPassives = character.reaper.primordial && character.reaper.templates.malediction
            .map(ma => ma.values).flat()
            .find(value => value.stat === 'remove_equipped_spec_passives') !== undefined;

        for(const skill of character.skills) {
            const equipped = character.supportSkill === skill.skill
                || character.primarySkill === skill.skill
                || character.secondarySkill === skill.skill;

            skill.activeUpgrades = [ ...skill.selectedUpgrades ];

            if (skill.skill.type === SkillType.Support) {
                if (equipped) {
                    if (removeEquippedSpecPassives) {  
                        skill.activeUpgrades = skill.activeUpgrades
                            .map(id => skill.upgrades.find(upgrade => upgrade.id === id))
                            .filter(isNotNullOrUndefined)
                            .filter(upgrade => upgrade.type !== SkillType.Passive)
                            .map(upgrade => upgrade.id);
                    }
                } else if(addOtherNonEquippedSpecPassives) {
                    skill.activeUpgrades = skill.upgrades
                        .filter(upgrade => skill.selectedUpgrades.includes(upgrade.id) && upgrade.type === SkillType.Passive)
                        .map(upgrade => upgrade.id);
                }
            }
        }
    }

    private updateInvestedSlorm(character: Character) {
        character.skillInvestedSlorm = 0;
        for(const skill of character.skills) {
            for (const upgrade of skill.upgrades) {
                character.skillInvestedSlorm += upgrade.investedSlorm;
            }
        }
    }

    public updateCharacter(character: Character, config: CharacterConfig, updateViews: boolean = true, additionalItem: EquipableItem | null = null, additionalRunes: Array<Rune> = [], forcedMight: CharacterMight | null = null) {
        character.issues = [];

        character.name = this.slormancerTranslateService.translate('hero_' + character.heroClass);
        const specialization = character.supportSkill !== null ? character.supportSkill.specializationName : null;
        let fullName = [character.name, specialization].filter(isNotNullOrUndefined).join(', ');
        character.fullName = fullName + ' ' + this.LEVEL_LABEL + ' ' + character.level;

        character.attributes.maxPoints = character.level;
        let allocatedPoints = ALL_ATTRIBUTES.map(attribute => character.attributes.allocated[attribute].baseRank).reduce((p, c) => p + c, 0);

        character.attributes.remainingPoints = character.attributes.maxPoints - allocatedPoints;

        this.slormancerAncestralLegacyNodesService.stabilize(character);

        if (forcedMight === null) {
            this.slormancerMightService.updateMight(character);
        } else {
            this.slormancerMightService.forceMight(character, forcedMight);
        }

        this.updateInvestedSlorm(character);

        this.updateAncestralLegacySkills(character);

        this.removeUnavailableActivables(character);

        this.updateActiveSkillUpgrades(character);

        this.updateEquipmentBonuses(character, config);

        this.updateCharacterStats(character, updateViews, config, additionalItem, additionalRunes);

        console.log(character);
        console.log(character.reaper.templates);
    }
}