import { Injectable } from '@angular/core';

import { MessageService } from '../../shared/services/message.service';
import { DATA_HERO_BASE_STATS } from '../constants/content/data/data-hero-base-stats';
import { Character } from '../model/character';
import { CharacterConfig } from '../model/character-config';
import { Activable } from '../model/content/activable';
import { AncestralLegacy } from '../model/content/ancestral-legacy';
import { ALL_ATTRIBUTES, Attribute } from '../model/content/enum/attribute';
import { ALL_GEAR_SLOT_VALUES } from '../model/content/enum/gear-slot';
import { SkillGenre } from '../model/content/enum/skill-genre';
import { EquipableItem } from '../model/content/equipable-item';
import { Reaper } from '../model/content/reaper';
import { isFirst, isNotNullOrUndefined, valueOrDefault } from '../util/utils';
import { SlormancerActivableService } from './content/slormancer-activable.service';
import { SlormancerAncestralLegacyService } from './content/slormancer-ancestral-legacy.service';
import { SlormancerAttributeService } from './content/slormancer-attribute.service';
import { SlormancerDataService } from './content/slormancer-data.service';
import { SlormancerItemService } from './content/slormancer-item.service';
import { SlormancerReaperService } from './content/slormancer-reaper.service';
import { SlormancerSkillService } from './content/slormancer-skill.service';
import { CharacterStatsBuildResult, SlormancerStatsService } from './content/slormancer-stats.service';
import { SlormancerTranslateService } from './content/slormancer-translate.service';
import { SlormancerValueUpdater } from './content/slormancer-value-updater.service';
import { SlormancerConfigurationService } from './slormancer-configuration.service';

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
                private slormancerValueUpdater: SlormancerValueUpdater,
                private slormancerConfigurationService: SlormancerConfigurationService,
                private messageService: MessageService,
        ) { }

    private resetAttributes(character: Character) {
        for (const attribute of ALL_ATTRIBUTES) {
            character.attributes.allocated[attribute].rank = 0;
            this.slormancerAttributeService.updateAttributeTraits(character.attributes.allocated[attribute]);
        }
    }

    private applyReaperBonuses(character: Character, reaper: Reaper) {
        const items = ALL_GEAR_SLOT_VALUES.map(slot => character.gear[slot]).filter(isNotNullOrUndefined);

        let bonus = 0;
        for (const item of items) {
            if (item.reaperEnchantment !== null && item.reaperEnchantment.craftedReaperSmith == reaper.smith.id) {
                bonus += item.reaperEnchantment.craftedValue;
            }
        }

        if (reaper.bonusLevel !== bonus) {
            reaper.bonusLevel = bonus;
            this.slormancerReaperService.updateReaperModel(reaper);
            this.slormancerReaperService.updateReaperView(reaper);
        }
    }

    private updateBonuses(character: Character) {
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

        if (character.reaper !== null) {
            this.applyReaperBonuses(character, character.reaper);
        }

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

    private updateChangedItems(statsResult: CharacterStatsBuildResult) {
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
            this.slormancerSkillService.updateUpgrade(upgrade);
        }
        for (const attribute of statsResult.changed.attributes.filter(isFirst)) {
            this.slormancerAttributeService.updateAttributeTraits(attribute);
        }
        for (const activable of statsResult.changed.activables) {
            this.slormancerActivableService.updateActivableView(activable);
        }
    }

    private displaySynergyLoopError(statsResult: CharacterStatsBuildResult) {
        if (statsResult.unresolvedSynergies.length > 1) {
            const names = statsResult.unresolvedSynergies
                .map(unresolvedSynergy => {
                    let result = null;

                    if (unresolvedSynergy.objectSource.activable) {
                        result = unresolvedSynergy.objectSource.activable.name;
                    } else if (unresolvedSynergy.objectSource.ancestralLegacy) {
                        result = unresolvedSynergy.objectSource.ancestralLegacy.name;
                    } else if (unresolvedSynergy.objectSource.attribute) {
                        result = unresolvedSynergy.objectSource.attribute.attributeName;
                    } else if (unresolvedSynergy.objectSource.item) {
                        result = unresolvedSynergy.objectSource.item.name;
                    } else if (unresolvedSynergy.objectSource.reaper) {
                        result = unresolvedSynergy.objectSource.reaper.name;
                    } else if (unresolvedSynergy.objectSource.skill) {
                        result = unresolvedSynergy.objectSource.skill.name;
                    } else if (unresolvedSynergy.objectSource.upgrade) {
                        result = unresolvedSynergy.objectSource.upgrade.name;
                    }

                    return result;
                }).filter(isNotNullOrUndefined);
            this.messageService.error('Your build contain a synergy loop between : ' + names.join(', '));
        }
    }

    private getCharacterStatsResult(character: Character, config: CharacterConfig, additionalItem: EquipableItem | null): CharacterStatsBuildResult {
        const stats = DATA_HERO_BASE_STATS[character.heroClass];
        
        character.baseStats = stats.baseStats.map(baseStat => ({ stat: baseStat.stat, values: [ baseStat.base + character.level * baseStat.perLevel] }));
        const levelStats = valueOrDefault(stats.levelonlyStat[character.level], []);
        for (const levelStat of levelStats) {
            character.baseStats.push({ stat: levelStat.stat, values: [levelStat.value]});
        }

        return this.slormancerStatsService.updateCharacterStats(character, config, additionalItem);
    }

    private updateCharacterActivables(character: Character, statsResult: CharacterStatsBuildResult, additionalItem: EquipableItem | null, auraOnly: boolean): { items: Array<EquipableItem>, ancestralLegacies: Array<AncestralLegacy> } {
        const ancestralLegacies = character.ancestralLegacies.ancestralLegacies.filter(ancestralLegacy => ancestralLegacy.isActivable);
        const items = <Array<EquipableItem>>[...ALL_GEAR_SLOT_VALUES.map(slot => character.gear[slot]), ...character.inventory, ...character.sharedInventory.flat(), additionalItem]
            .filter(item => item !== null && item.legendaryEffect !== null && item.legendaryEffect.activable !== null);
        const result: { items: Array<EquipableItem>, ancestralLegacies: Array<AncestralLegacy> } = { items: [], ancestralLegacies: [] };


        for (const ancestralLegacy of ancestralLegacies) {
            if (ancestralLegacy.genres.includes(SkillGenre.Aura) || !auraOnly) {
                this.slormancerValueUpdater.updateAncestralLegacyActivable(character, ancestralLegacy, statsResult);
                result.ancestralLegacies.push(ancestralLegacy);
            }
        }
        for (const item of items) {
            const activable = <Activable>item.legendaryEffect?.activable;
            if (activable.genres.includes(SkillGenre.Aura) || !auraOnly) {
                this.slormancerValueUpdater.updateActivable(character, activable, statsResult);
                result.items.push(item);
            }
        }

        return { items, ancestralLegacies };
    }

    private updateCharacterStats(character: Character, updateViews: boolean, config: CharacterConfig, additionalItem: EquipableItem | null) {

        const statResultPreAura = this.getCharacterStatsResult(character, config, additionalItem)
        const auraChanged = this.updateCharacterActivables(character, statResultPreAura, additionalItem, true);

        const statsResult = this.getCharacterStatsResult(character, config, additionalItem);
        character.stats = statsResult.stats;

        statsResult.changed.items.push(...auraChanged.items);
        statsResult.changed.items.push(...statResultPreAura.changed.items);
        statsResult.changed.ancestralLegacies.push(...auraChanged.ancestralLegacies);
        statsResult.changed.ancestralLegacies.push(...statResultPreAura.changed.ancestralLegacies);
        statsResult.changed.activables.push(...statResultPreAura.changed.activables);
        statsResult.changed.attributes.push(...statResultPreAura.changed.attributes);
        statsResult.changed.reapers.push(...statResultPreAura.changed.reapers);
        statsResult.changed.skills.push(...statResultPreAura.changed.skills);
        statsResult.changed.upgrades.push(...statResultPreAura.changed.upgrades);


        for (const ancestralLegacyId of statsResult.unlockedAncestralLegacies) {
            const ancestralLegacy = character.ancestralLegacies.ancestralLegacies.find(ancestralLegacy => ancestralLegacy.id === ancestralLegacyId);
            if (ancestralLegacy) {
                statsResult.changed.ancestralLegacies.push(ancestralLegacy);
                this.slormancerAncestralLegacyService.updateAncestralLegacyModel(ancestralLegacy, ancestralLegacy.baseMaxRank);
                if (!character.ancestralLegacies.activeAncestralLegacies.includes(ancestralLegacyId)) {
                    character.ancestralLegacies.activeAncestralLegacies.push(ancestralLegacyId);
                }
            }
        }

        for (const skillAndUpgrades of character.skills) {
            const result = this.slormancerStatsService.updateSkillStats(character, skillAndUpgrades, config, statsResult);
            this.slormancerValueUpdater.updateSkillAndUpgradeValues(character, skillAndUpgrades, result);
            statsResult.changed.skills.push(skillAndUpgrades.skill);
            statsResult.changed.upgrades.push(...skillAndUpgrades.upgrades);
        }

        const activableChanged = this.updateCharacterActivables(character, statsResult, additionalItem, false);
        statsResult.changed.items.push(...activableChanged.items);
        statsResult.changed.ancestralLegacies.push(...activableChanged.ancestralLegacies);

        this.displaySynergyLoopError(statsResult)

        if (updateViews) {
            this.updateChangedItems(statsResult);
        }
    }

    public updateCharacter(character: Character, updateViews: boolean = true, additionalItem: EquipableItem | null = null) {
        character.ancestralLegacies.activeAncestralLegacies = this.slormancerDataService.getAncestralSkillIdFromNodes(character.ancestralLegacies.activeNodes);

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

        this.updateBonuses(character);

        this.slormancerConfigurationService.updateAuraMissingResources(character);
        this.updateCharacterStats(character, updateViews, this.slormancerConfigurationService.getConfiguration(), additionalItem);

        console.log(character);
    }
}