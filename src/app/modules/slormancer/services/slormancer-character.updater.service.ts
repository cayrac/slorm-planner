import { Injectable } from '@angular/core';
import { MessageService } from '@shared/services/message.service';
import { MAX_REAPER_AFFINITY_BONUS } from '@slormancer/constants/common';
import { Rune } from '@slormancer/model/content/rune';

import { DATA_HERO_BASE_STATS } from '../constants/content/data/data-hero-base-stats';
import { Character } from '../model/character';
import { CharacterConfig } from '../model/character-config';
import { Activable } from '../model/content/activable';
import { AncestralLegacy } from '../model/content/ancestral-legacy';
import { ALL_ATTRIBUTES, Attribute } from '../model/content/enum/attribute';
import { ALL_GEAR_SLOT_VALUES } from '../model/content/enum/gear-slot';
import { ReaperSmith } from '../model/content/enum/reaper-smith';
import { SkillGenre } from '../model/content/enum/skill-genre';
import { EquipableItem } from '../model/content/equipable-item';
import { Reaper } from '../model/content/reaper';
import { SkillElement } from '../model/content/skill-element';
import { isEffectValueSynergy, isFirst, isNotNullOrUndefined, valueOrDefault } from '../util/utils';
import { SlormancerActivableService } from './content/slormancer-activable.service';
import { SlormancerAncestralLegacyService } from './content/slormancer-ancestral-legacy.service';
import { SlormancerAttributeService } from './content/slormancer-attribute.service';
import { SlormancerClassMechanicService } from './content/slormancer-class-mechanic.service';
import { SlormancerDataService } from './content/slormancer-data.service';
import { SlormancerItemService } from './content/slormancer-item.service';
import { SlormancerMechanicService } from './content/slormancer-mechanic.service';
import { SlormancerReaperService } from './content/slormancer-reaper.service';
import { SlormancerRuneService } from './content/slormancer-rune.service';
import { SlormancerSkillService } from './content/slormancer-skill.service';
import { ExtractedStatMap } from './content/slormancer-stats-extractor.service';
import { CharacterStatsBuildResult, SlormancerStatsService } from './content/slormancer-stats.service';
import { SlormancerSynergyResolverService } from './content/slormancer-synergy-resolver.service';
import { SlormancerTranslateService } from './content/slormancer-translate.service';
import { SlormancerValueUpdater } from './content/slormancer-value-updater.service';

@Injectable()
export class SlormancerCharacterUpdaterService {

    private readonly LEVEL_LABEL = this.slormancerTranslateService.translate('level').toLowerCase();

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerAttributeService: SlormancerAttributeService,
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
                private slormancerValueUpdater: SlormancerValueUpdater,
                private slormancerSynergyResolverService: SlormancerSynergyResolverService,
                private messageService: MessageService,
        ) { }

    private resetAttributes(character: Character) {
        for (const attribute of ALL_ATTRIBUTES) {
            character.attributes.allocated[attribute].rank = 0;
            this.slormancerAttributeService.updateAttributeTraits(character.attributes.allocated[attribute]);
        }
    }

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

    private updateBonuses(character: Character, config: CharacterConfig) {
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
            const bonus = valueOrDefault(skillBonuses[skill.skill.id], 0);
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

    private displaySynergyLoopError(statsResult: CharacterStatsBuildResult) {
        if (statsResult.unresolvedSynergies.length > 1) {
            const names = statsResult.unresolvedSynergies
                .map(unresolvedSynergy => {
                    let result = null;

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
                }).filter(isNotNullOrUndefined);
            this.messageService.error('Your build contain a synergy loop between : ' + names.join(', '));
        }
    }

    private getCharacterStatsResult(character: Character, config: CharacterConfig, additionalItem: EquipableItem | null, additionalRunes: Array<Rune> = []): CharacterStatsBuildResult {
        const stats = DATA_HERO_BASE_STATS[character.heroClass];
        
        character.baseStats = stats.baseStats.map(baseStat => ({
            stat: baseStat.stat,
            values: [ baseStat.perLevel !== 0 ? Math.round(baseStat.base + character.level * baseStat.perLevel) : baseStat.base ]
        }));
        const levelStats = valueOrDefault(stats.levelonlyStat[character.level], []);
        for (const levelStat of levelStats) {
            character.baseStats.push({ stat: levelStat.stat, values: [levelStat.value]});
        }

        return this.slormancerStatsService.updateCharacterStats(character, config, additionalItem, additionalRunes);
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
                this.slormancerValueUpdater.updateAncestralLegacyActivable(character, config, ancestralLegacy, statsResult);
                result.ancestralLegacies.push(ancestralLegacy);
            }
        }
        for (const item of items) {
            const activable = <Activable>item.legendaryEffect?.activable;
            if (activable.genres.includes(SkillGenre.Aura) || !preComputing) {
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

    private updateCharacterStats(character: Character, updateViews: boolean, config: CharacterConfig, additionalItem: EquipableItem | null, additionalRunes: Array<Rune> = []) {

        const statResultPreComputing = this.getCharacterStatsResult(character, config, additionalItem, additionalRunes);

        const preComputingChanged = this.updateCharacterActivables(character, statResultPreComputing, config, additionalItem, additionalRunes, true);

        this.slormancerValueUpdater.precomputeRunePowerAndEffect(character, additionalRunes, statResultPreComputing, config);

        if (character.ultimatum !== null) {
            character.ultimatum.locked = statResultPreComputing.extractedStats['disable_ultimatum'] !== undefined;
        }

        const statsResult = this.getCharacterStatsResult(character, config, additionalItem, additionalRunes);
        character.stats = statsResult.stats;


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

        for (const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {

            if (statsResult.unlockedAncestralLegacies.includes(ancestralLegacy.id)) {
                statsResult.changed.ancestralLegacies.push(ancestralLegacy);
                this.slormancerAncestralLegacyService.updateAncestralLegacyModel(ancestralLegacy, ancestralLegacy.baseMaxRank);
                if (!character.ancestralLegacies.activeAncestralLegacies.includes(ancestralLegacy.id)) {
                    character.ancestralLegacies.activeAncestralLegacies.push(ancestralLegacy.id);
                }
            }

            for (const mechanic of ancestralLegacy.relatedMechanics) {
                this.slormancerValueUpdater.updateMechanic(mechanic, character, statsResult);
                statsResult.changed.mechanics.push(mechanic);
            }
        }

        const lockedSkills = [];
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

        this.displaySynergyLoopError(statsResult)

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

    public updateCharacter(character: Character, config: CharacterConfig, updateViews: boolean = true, additionalItem: EquipableItem | null = null, additionalRunes: Array<Rune> = []) {
        character.ancestralLegacies.activeAncestralLegacies = this.slormancerDataService.getAncestralSkillIdFromNodes(character.ancestralLegacies.activeNodes);

        this.removeUnavailableActivables(character);

        character.name = this.slormancerTranslateService.translate('hero_' + character.heroClass);
        const specialization = character.supportSkill !== null ? character.supportSkill.specializationName : null;
        let fullName = [character.name, specialization].filter(isNotNullOrUndefined).join(', ');
        character.fullName = fullName + ' ' + this.LEVEL_LABEL + ' ' + character.level;

        character.attributes.maxPoints = character.level;
        let allocatedPoints = ALL_ATTRIBUTES.map(attribute => character.attributes.allocated[attribute].rank).reduce((p, c) => p + c, 0);

        if (allocatedPoints > character.attributes.maxPoints) {
            this.resetAttributes(character);
            allocatedPoints = 0;
        }
        character.attributes.remainingPoints = character.attributes.maxPoints - allocatedPoints;

        this.updateBonuses(character, config);

        this.updateCharacterStats(character, updateViews, config, additionalItem, additionalRunes);

        console.log(character);
    }
}