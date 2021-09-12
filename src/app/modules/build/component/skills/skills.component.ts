import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character, CharacterSkillAndUpgrades } from '../../../slormancer/model/character';
import { SkillType } from '../../../slormancer/model/content/skill-type';
import { SkillUpgrade } from '../../../slormancer/model/content/skill-upgrade';
import { SlormancerCharacterService } from '../../../slormancer/services/slormancer-character.service';
import { isFirst, isNotNullOrUndefined, valueOrNull } from '../../../slormancer/util/utils';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent extends AbstractUnsubscribeComponent implements OnInit {

    public character: Character | null = null;

    public selectedSkill: CharacterSkillAndUpgrades | null = null;

    public selectedUpgrade: SkillUpgrade | null = null;

    public selectedSkillLines: Array<number> = [];

    constructor(private plannerService: PlannerService,
                private slormancerCharacterService: SlormancerCharacterService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => {
                this.character = character;
                this.updateSelectedSkill();
            });

        this.updateSelectedSkill();
    }

    private updateSelectedSkill() {
        const character = this.character;
        if (character === null) {
            this.selectSkill(null)
        } else if (this.selectedSkill === null) {
            this.selectSkill(character.supportSkill !== null
                ? valueOrNull(character.skills.find(s => s.skill === character.supportSkill))
                : valueOrNull(character.skills[0]));
        }
    }

    public getSupportSkills(character: Character): Array<CharacterSkillAndUpgrades> {
        return character.skills.filter(skill => skill.skill.type === SkillType.Support);
    }

    public getActiveSkills(character: Character): Array<CharacterSkillAndUpgrades> {
        return character.skills.filter(skill => skill.skill.type === SkillType.Active);
    }

    public isSkillEquipped(skill: CharacterSkillAndUpgrades): boolean {
        return this.character !== null && (
            this.character.primarySkill === skill.skill
            || this.character.secondarySkill === skill.skill
            || this.character.supportSkill === skill.skill
        );
    }    
    
    public isEquippedSupportSkill(skill: CharacterSkillAndUpgrades): boolean {
        return this.character !== null && this.character.supportSkill === skill.skill;
    }
    
    public isEquippedPrimarySkill(skill: CharacterSkillAndUpgrades): boolean {
        return this.character !== null && this.character.primarySkill === skill.skill;
    }
    
    public isEquippedSecondarySkill(skill: CharacterSkillAndUpgrades): boolean {
        return this.character !== null && this.character.secondarySkill === skill.skill;
    }

    public isSkillSelected(skill: CharacterSkillAndUpgrades): boolean {
        return this.selectedSkill === skill
    }

    public selectSkill(skill: CharacterSkillAndUpgrades | null) {
        this.selectedSkill = skill;
        this.selectedSkillLines = skill === null ? [] : skill.upgrades.map(passive => passive.line).filter(isFirst).sort();
        this.selectedUpgrade = skill === null ? null : valueOrNull(skill.upgrades[0]);
    }

    public getLineUpgrades(line: number): Array<SkillUpgrade> {
        let result: Array<SkillUpgrade> = [];

        if (this.selectedSkill !== null) {
            result = this.selectedSkill.upgrades.filter(passive => passive.line === line);
        }

        return result;
    }

    public isUpgradeEquipped(upgrade: SkillUpgrade) {
        let result: boolean = false;

        if (this.selectedSkill !== null) {
            result = this.selectedSkill.selectedUpgrades.find(id => upgrade.id === id) !== undefined;
        }

        return result;
    }

    public selectUpgrade(selectedUpgrade: SkillUpgrade) {
        const character = this.character;
        const selectedSkill = this.selectedSkill;
        if (character !== null && selectedSkill !== null) {
            if (this.selectedUpgrade === selectedUpgrade) {
                
                const sameLineId = selectedSkill.selectedUpgrades
                    .map(id => selectedSkill.upgrades.find(upgrade => upgrade.id === id))
                    .filter(isNotNullOrUndefined)
                    .filter(upgrade => upgrade.line === selectedUpgrade.line)
                    .map(upgrade => upgrade.id)
                    .splice(0, 1)[0];
    
                if (sameLineId !== undefined) {
                    if (sameLineId) {
                        const sameLineIndex = selectedSkill.selectedUpgrades.indexOf(sameLineId);
                        selectedSkill.selectedUpgrades.splice(sameLineIndex, 1);
                    }
                }

                if (sameLineId !== selectedUpgrade.id) {
                    selectedSkill.selectedUpgrades.push(selectedUpgrade.id);
                }

                this.slormancerCharacterService.updateCharacter(character);
            } else {
                this.selectedUpgrade = selectedUpgrade;
            }
        }
    }

    public isPassive(upgrade: SkillUpgrade): boolean {
        return upgrade.type === SkillType.Passive;
    }

    public isSupport(skill: CharacterSkillAndUpgrades): boolean {
        return skill.skill.type === SkillType.Support;
    }

    public equipSupport(skill: CharacterSkillAndUpgrades) {
        if (this.character !== null) {
            this.slormancerCharacterService.setSupportSkill(this.character, skill.skill);
        }
    }

    public equipPrimary(skill: CharacterSkillAndUpgrades) {
        if (this.character !== null) {
            this.slormancerCharacterService.setPrimarySkill(this.character, skill.skill);
        }
    }

    public equipSecondary(skill: CharacterSkillAndUpgrades) {
        if (this.character !== null) {
            this.slormancerCharacterService.setSecondarySkill(this.character, skill.skill);
        }
    }
}
