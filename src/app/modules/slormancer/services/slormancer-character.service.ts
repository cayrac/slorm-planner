import { Injectable } from '@angular/core';

import { DATA_HERO_BASE_STATS } from '../constants/content/data/data-stats-mapping';
import { Character } from '../model/character';
import { ALL_ATTRIBUTES } from '../model/content/enum/attribute';
import { Skill } from '../model/content/skill';
import { SkillUpgrade } from '../model/content/skill-upgrade';
import { isNotNullOrUndefined, valueOrDefault } from '../util/utils';
import { SlormancerAncestralLegacyService } from './content/slormancer-ancestral-legacy.service';
import { SlormancerAttributeService } from './content/slormancer-attribute.service';
import { SlormancerDataService } from './content/slormancer-data.service';
import { SlormancerStatsService } from './content/slormancer-stats.service';
import { SlormancerTranslateService } from './content/slormancer-translate.service';

@Injectable()
export class SlormancerCharacterService {

    private readonly LEVEL_LABEL = this.slormancerTranslateService.translate('level').toLowerCase();

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerAttributeService: SlormancerAttributeService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerStatsService: SlormancerStatsService
        ) { }

    private resetAttributes(character: Character) {
        for (const attribute of ALL_ATTRIBUTES) {
            character.attributes.allocated[attribute].rank = 0;
            this.slormancerAttributeService.updateAttributeTraits(character.attributes.allocated[attribute]);
        }
    }

    public updateCharacter(character: Character) {
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

        character.baseStats = stats.baseStats.map(baseStat => ({ stat: baseStat.stat, values: [ baseStat.base + character.level * baseStat.perLevel] }));
        const levelStats = valueOrDefault(stats.levelonlyStat[character.level], []);
        for (const levelStat of levelStats) {
            character.baseStats.push({ stat: levelStat.stat, values: [levelStat.value]});
        }

        character.stats = this.slormancerStatsService.getStats(character);
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