import { Injectable } from '@angular/core';

import { MessageService } from '../../shared/services/message.service';
import { DATA_HERO_BASE_STATS } from '../constants/content/data/data-hero-base-stats';
import { Character } from '../model/character';
import { CharacterConfig } from '../model/character-config';
import { ALL_ATTRIBUTES, Attribute } from '../model/content/enum/attribute';
import { ALL_GEAR_SLOT_VALUES } from '../model/content/enum/gear-slot';
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

@Injectable()
export class SlormancerCharacterUpdaterService {

    public readonly CHARACTER_CONFIG: CharacterConfig = {
        totems_under_control: 10,
        traps_nearby: 5,
        serenity: 0,
        last_cast_tormented: true,
        last_cast_delighted: true,
        enemy_percent_missing_health: 0,
        percent_missing_health: 0,
        percent_missing_mana: 0,
        percent_lock_mana: 50,
        overall_reputation: 100,
        seconds_since_last_crit: 100,
        seconds_since_last_dodge: 100,
        hits_taken_recently: 0,
        skill_cast_recently: 80,
        frostbold_shot_recently: 10,
        slormocide_60: 1500,
        goldbane_5: 1666,
        rebounds_before_hit: 1,
        pierces_before_hit: 0,
        enemies_in_aoe: 10,
        target_is_isolated: true,
        target_is_tracked: true,
        enemy_is_poisoned: true,
        target_has_negative_effect: true,
        is_first_hit: true,
        is_last_volley: false,
        elites_in_radius: {
            10: 0
        },
        ennemies_in_radius: {
            2: 0,
            3: 0
        },
        negative_effects_on_ennemies_in_radius: {
            2: 10,
        },
        poison_enemies: 5,
        trap_triggered_recently: true,
        took_elemental_damage_recently: false,
        took_damage_before_next_cast: false,
        cast_support_before_next_cast: false,
        victims_reaper_104: 12345,
        controlled_minions: 0,
        elemental_prowess_stacks: 0,
        totem_dexterity_stacks: 100,
        greed_stacks: 0,
        strider_stacks: 0,
        merchant_stacks: 0,
        nimble_champion_stacks: 100,
        ancestral_legacy_stacks: 35,
        conquest_stacks: 35,
        stability_stacks: 35,
        enlightenment_stacks: 852,
        delightful_rain_stack: 25,
        distance_with_target: 5,
        has_aura_air_conditionner: true,
        has_aura_neriya_shield: true,
        has_aura_elemental_swap: true,
        has_aura_risk_of_pain: true,
        has_aura_inextricable_torment: true,
        has_elemental_temper_buff: true,
        has_burning_shadow_buff: true,
        has_gold_armor_buff: true,
        has_soul_bound_buff: true,
        has_adam_blessing_buff: true,
        has_manabender_buff: true,
        has_nimble_buff: true,
        has_ancient_recognition_buff: true,
        has_elemental_fervor_buff: true,
        has_ancestral_fervor_buff: true,
        has_assassin_haste_buff: true,
        has_smoke_screen_buff: false,
        all_characters_level: 120,
        idle: true,
        damage_stored: 1000,
        overdrive_bounces_left: 5,
        overdrive_last_bounce: true,
        hero_close_to_turret_syndrome: true,
        turret_syndrome_on_cooldown: true,
    }

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
            // console.log('Updating item : ' + item.name);
            this.slormancerItemService.updateEquipableItemView(item);
        }
        for (const ancestralLegacy of statsResult.changed.ancestralLegacies.filter(isFirst)) {
            this.slormancerAncestralLegacyService.updateAncestralLegacyView(ancestralLegacy); 
            // console.log('Updating ancestral legacy : ' + ancestralLegacy.name);
        }
        for (const reaper of statsResult.changed.reapers.filter(isFirst)) {
            this.slormancerReaperService.updateReaperView(reaper);
            // console.log('Updating reaper : ' + reaper.name);
        }
        for (const skill of statsResult.changed.skills.filter(isFirst)) {
            this.slormancerSkillService.updateSkillView(skill);
            // console.log('Updating skill : ' + skill.name);
        }
        for (const upgrade of statsResult.changed.upgrades.filter(isFirst)) {
            this.slormancerSkillService.updateUpgrade(upgrade);
            // console.log('Updating upgrade : ' + upgrade.name);
        }
        for (const attribute of statsResult.changed.attributes.filter(isFirst)) {
            this.slormancerAttributeService.updateAttributeTraits(attribute);
            // console.log('Updating attribute : ' + attribute.attributeName);
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

    private updateCharacterStats(character: Character, updateViews: boolean, config: CharacterConfig, additionalItem: EquipableItem | null) {

        const stats = DATA_HERO_BASE_STATS[character.heroClass];

        character.baseStats = stats.baseStats.map(baseStat => ({ stat: baseStat.stat, values: [ baseStat.base + character.level * baseStat.perLevel] }));
        const levelStats = valueOrDefault(stats.levelonlyStat[character.level], []);
        for (const levelStat of levelStats) {
            character.baseStats.push({ stat: levelStat.stat, values: [levelStat.value]});
        }

        const statsResult = this.slormancerStatsService.updateCharacterStats(character, config, additionalItem);
        character.stats = statsResult.stats;

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
            const result = this.slormancerStatsService.updateSkillStats(character, skillAndUpgrades, config, statsResult.extractedStats);
            this.slormancerValueUpdater.updateSkillAndUpgradeValues(skillAndUpgrades, result);
            statsResult.changed.skills.push(skillAndUpgrades.skill);
            statsResult.changed.upgrades.push(...skillAndUpgrades.upgrades);
        }

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

        this.updateCharacterStats(character, updateViews, this.CHARACTER_CONFIG, additionalItem);

        console.log(character);
    }
}