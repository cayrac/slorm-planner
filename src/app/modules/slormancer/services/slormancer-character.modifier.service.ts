import { Injectable } from '@angular/core';

import { Character } from '../model/character';
import { Skill } from '../model/content/skill';
import { SkillUpgrade } from '../model/content/skill-upgrade';
import { isNotNullOrUndefined } from '../util/utils';
import { SlormancerAncestralLegacyService } from './content/slormancer-ancestral-legacy.service';
import { SlormancerCharacterUpdaterService } from './slormancer-character.updater.service';

@Injectable()
export class SlormancerCharacterModifierService {

    constructor(private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private slormancerCharacterService: SlormancerCharacterUpdaterService,
        ) { }

    public setPrimarySkill(character: Character, skill: Skill): boolean {
        let result = false;

        if (character.primarySkill !== skill) {
            if (character.secondarySkill === skill) {
                character.secondarySkill = character.primarySkill;
            }
            character.primarySkill = skill;

            this.slormancerCharacterService.updateCharacter(character);

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
            this.slormancerCharacterService.updateCharacter(character);

            result = true;
        }

        return result;
    }

    public setSupportSkill(character: Character, skill: Skill): boolean {
        let result = false;

        if (character.supportSkill !== skill) {
            character.supportSkill = skill;
            this.slormancerCharacterService.updateCharacter(character);

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

            this.slormancerCharacterService.updateCharacter(character);
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
            this.slormancerCharacterService.updateCharacter(character);
            changed = true;
        }

        return changed;
    }
    
    public disableAncestralLegacyNode(character: Character, nodeId: number): boolean {
        let changed = false;

        if (character.ancestralLegacies.activeNodes.indexOf(nodeId) !== -1) {
            character.ancestralLegacies.activeNodes = this.slormancerAncestralLegacyService.getValidNodes(character.ancestralLegacies.activeNodes.filter(id => id !== nodeId));
            this.slormancerCharacterService.updateCharacter(character);
            changed = true;
        }

        return changed;
    }
}