import { Injectable } from '@angular/core';

import { DATA_HERO_BASE_STATS } from '../constants/content/data/data-hero-base-stats';
import { Character } from '../model/character';
import { CharacterConfig } from '../model/character-config';
import { ALL_ATTRIBUTES, Attribute } from '../model/content/enum/attribute';
import { ALL_GEAR_SLOT_VALUES } from '../model/content/enum/gear-slot';
import { Reaper } from '../model/content/reaper';
import { Skill } from '../model/content/skill';
import { SkillUpgrade } from '../model/content/skill-upgrade';
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

@Injectable()
export class SlormancerCharacterService {

    public readonly CHARACTER_CONFIG: CharacterConfig = {
        percent_missing_health: 0,
        percent_missing_mana: 0,
        percent_lock_mana: 50,
        overall_reputation: 100,
        seconds_since_last_crit: 100,
        seconds_since_last_dodge: 100,
        hits_taken_recently: 0,
        skill_cast_recently: 0,
        elites_in_radius: {
            10: 0
        },
        ennemies_in_radius: {
            2: 0,
            3: 0
        },
        took_elemental_damage_recently: false,
        took_damage_before_next_cast: false,
        cast_support_before_next_cast: false,
        controlled_minions: 0,
        elemental_prowess_stacks: 0,
        totem_dexterity_stacks: 0,
        greed_stacks: 0,
        strider_stacks: 0,
        merchant_stacks: 0,
        distance_with_target: 0,
        has_aura_air_conditionner: true,
        has_aura_neriya_shield: true,
        has_aura_elemental_swap: true,
        has_aura_risk_of_pain: true,
        has_elemental_temper_buff: true,
        has_burning_shadow_buff: true,
        has_gold_armor_buff: true,
        has_soul_bound_buff: true,
        has_adam_blessing_buff: true,
        all_characters_level: 120,
        iddle: false,
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
                private slormancerActivableService: SlormancerActivableService
        ) { }

    private resetAttributes(character: Character) {
        for (const attribute of ALL_ATTRIBUTES) {
            character.attributes.allocated[attribute].rank = 0;
            this.slormancerAttributeService.updateAttributeTraits(character.attributes.allocated[attribute]);
        }
    }

    public applyReaperBonuses(character: Character, reaper: Reaper) {
        const items = ALL_GEAR_SLOT_VALUES.map(slot => character.gear[slot]).filter(isNotNullOrUndefined);

        let bonus = 0;
        for (const item of items) {
            if (item.reaperEnchantment !== null && item.reaperEnchantment.craftedReaperSmith == reaper.smith.id) {
                bonus += item.reaperEnchantment.craftedValue;
            }
        }

        if (reaper.bonusLevel !== bonus) {
            reaper.bonusLevel = bonus;
            this.slormancerReaperService.updateReaper(reaper);
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
                this.slormancerSkillService.updateSkill(skill.skill);
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
            this.slormancerItemService.updateEquippableItem(item);
        }
        for (const ancestralLegacy of statsResult.changed.ancestralLegacies.filter(isFirst)) {
            this.slormancerAncestralLegacyService.updateAncestralLegacyView(ancestralLegacy); 
            // console.log('Updating ancestral legacy : ' + ancestralLegacy.name);
        }
        for (const reaper of statsResult.changed.reapers.filter(isFirst)) {
            this.slormancerReaperService.updateReaper(reaper);
            // console.log('Updating reaper : ' + reaper.name);
        }
        for (const skill of statsResult.changed.skills.filter(isFirst)) {
            this.slormancerSkillService.updateSkill(skill);
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
            this.slormancerActivableService.updateActivable(activable);
            // console.log('Updating attribute : ' + attribute.attributeName);
        }
    }

    public updateCharacter(character: Character, config: CharacterConfig = this.CHARACTER_CONFIG) {
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

        const stats = DATA_HERO_BASE_STATS[character.heroClass];

        this.updateBonuses(character);

        character.baseStats = stats.baseStats.map(baseStat => ({ stat: baseStat.stat, values: [ baseStat.base + character.level * baseStat.perLevel] }));
        const levelStats = valueOrDefault(stats.levelonlyStat[character.level], []);
        for (const levelStat of levelStats) {
            character.baseStats.push({ stat: levelStat.stat, values: [levelStat.value]});
        }

        const statsResult = this.slormancerStatsService.getStats(character, config);
        character.stats = statsResult.stats;
        this.updateChangedItems(statsResult);
        console.log(character);
    }

    public setPrimarySkill(character: Character, skill: Skill): boolean {
        let result = false;

        if (character.primarySkill !== skill) {
            if (character.secondarySkill === skill) {
                character.secondarySkill = character.primarySkill;
            }
            character.primarySkill = skill;

            this.updateCharacter(character);

            result = true;
        }

        return result;
    }

    public setSecondarySkill(character: Character, skill: Skill): boolean {
        let result = false;

        if (character.secondarySkill !== skill) {
            if (character.primarySkill === skill) {
                character.primarySkill = character.secondarySkill;
            }
            character.secondarySkill = skill;
            this.updateCharacter(character);

            result = true;
        }

        return result;
    }

    public setSupportSkill(character: Character, skill: Skill): boolean {
        let result = false;

        if (character.supportSkill !== skill) {
            character.supportSkill = skill;
            this.updateCharacter(character);

            result = true;
        }

        return result;
    }
    
    public selectUpgrade(character: Character, selectedUpgrade: SkillUpgrade): boolean {
        let changed = false;
        
        const skill = character.skills.find(skill => skill.skill.id === selectedUpgrade.skillId);

        if (skill) {
            const sameLineId = skill.selectedUpgrades
                .map(id => skill.upgrades.find(upgrade => upgrade.id === id))
                .filter(isNotNullOrUndefined)
                .filter(upgrade => upgrade.line === selectedUpgrade.line)
                .map(upgrade => upgrade.id)[0];
    
            if (sameLineId !== undefined && sameLineId !== selectedUpgrade.id) {
                const sameLineIndex = skill.selectedUpgrades.indexOf(sameLineId);
                skill.selectedUpgrades.splice(sameLineIndex, 1);    
            }

            skill.selectedUpgrades.push(selectedUpgrade.id);

            this.updateCharacter(character);
            changed = true;    
        }


        return changed;
    }

    public activateAncestralLegacyNode(character: Character, nodeId: number): boolean {
        let changed = false;

        if (character.ancestralLegacies.activeNodes.indexOf(nodeId) === -1
            && character.ancestralLegacies.activeNodes.length < character.ancestralLegacies.maxAncestralLegacy
            && this.slormancerAncestralLegacyService.isNodeConnectedTo(nodeId, character.ancestralLegacies.activeNodes)) {
            character.ancestralLegacies.activeNodes.push(nodeId);
            this.updateCharacter(character);
            changed = true;
        }

        return changed;
    }
    
    public disableAncestralLegacyNode(character: Character, nodeId: number): boolean {
        let changed = false;

        if (character.ancestralLegacies.activeNodes.indexOf(nodeId) !== -1) {
            character.ancestralLegacies.activeNodes = this.slormancerAncestralLegacyService.getValidNodes(character.ancestralLegacies.activeNodes.filter(id => id !== nodeId));
            this.updateCharacter(character);
            changed = true;
        }

        return changed;
    }
}