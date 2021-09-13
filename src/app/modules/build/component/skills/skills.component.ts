import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character, CharacterSkillAndUpgrades } from '../../../slormancer/model/character';
import { SkillType } from '../../../slormancer/model/content/skill-type';
import { SkillUpgrade } from '../../../slormancer/model/content/skill-upgrade';
import { SlormancerSkillService } from '../../../slormancer/services/content/slormancer-skill.service';
import { SlormancerCharacterService } from '../../../slormancer/services/slormancer-character.service';
import { isFirst, valueOrNull } from '../../../slormancer/util/utils';

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
                private slormancerSkillService: SlormancerSkillService,
                private slormancerCharacterService: SlormancerCharacterService) {
        super();

        // passifs rond

        // upgrade:  click = equip + upgrade
        // upgrade : click droit = downdgrade

        // skill : click = upgrade
        // skill : click droit = downdgrade

        // settings sur skill : upgrade all,equip skill
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

    private selectSkill(skill: CharacterSkillAndUpgrades | null) {
        this.selectedSkill = skill;
        this.selectedSkillLines = skill === null ? [] : skill.upgrades.map(passive => passive.line).filter(isFirst).sort();
        this.selectedUpgrade = skill === null ? null : valueOrNull(skill.upgrades[0]);
    }

    public incrementSkill(skill: CharacterSkillAndUpgrades): boolean {
        if (this.selectedSkill === skill) {
            if (skill.skill.baseLevel < skill.skill.maxLevel) {
                skill.skill.baseLevel++;
                this.slormancerSkillService.updateSkill(skill.skill);
            }
        } else {
            this.selectSkill(skill);
        }
        return false;
    }

    public decrementSkill(skill: CharacterSkillAndUpgrades): boolean {
        if (this.selectedSkill === skill) {
            if (skill.skill.baseLevel > 1) {
                skill.skill.baseLevel--;
                this.slormancerSkillService.updateSkill(skill.skill);
            }
        } else {
            this.selectSkill(skill);
        }
        return false;
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

    public incrementUpgrade(selectedUpgrade: SkillUpgrade): boolean {
        if (this.selectedSkill !== null) {
            if (this.selectedUpgrade !== selectedUpgrade) {
                this.selectedUpgrade = selectedUpgrade;
            }

            if (!this.isUpgradeEquipped(selectedUpgrade)) {
                this.slormancerCharacterService.selectUpgrade(this.selectedSkill, selectedUpgrade);
    
                if (selectedUpgrade.baseRank === 0) {
                    selectedUpgrade.baseRank = 1;
                    this.slormancerSkillService.updateUpgrade(selectedUpgrade);
                    this.slormancerSkillService.updateSkill(this.selectedSkill.skill);
                }
            } else if (selectedUpgrade.baseRank < selectedUpgrade.maxRank) {
                selectedUpgrade.baseRank++;
                this.slormancerSkillService.updateUpgrade(selectedUpgrade);
                this.slormancerSkillService.updateSkill(this.selectedSkill.skill);
            }
        }
        return false;
    }

    public decrementUpgrade(selectedUpgrade: SkillUpgrade): boolean {
        if (this.selectedSkill !== null) {
            if (this.selectedUpgrade !== selectedUpgrade) {
                this.selectedUpgrade = selectedUpgrade;
            }

            if (!this.isUpgradeEquipped(selectedUpgrade)) {
                this.slormancerCharacterService.selectUpgrade(this.selectedSkill, selectedUpgrade);
            } else if (selectedUpgrade.baseRank > 1) {
                selectedUpgrade.baseRank--;
                this.slormancerSkillService.updateUpgrade(selectedUpgrade);
                this.slormancerSkillService.updateSkill(this.selectedSkill.skill);
            }
        }
        return false;
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
