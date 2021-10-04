import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import {
    SlormancerCharacterModifierService,
} from 'src/app/modules/slormancer/services/slormancer-character.modifier.service';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character, CharacterSkillAndUpgrades } from '../../../slormancer/model/character';
import { SkillType } from '../../../slormancer/model/content/skill-type';
import { SkillUpgrade } from '../../../slormancer/model/content/skill-upgrade';
import { SlormancerSkillService } from '../../../slormancer/services/content/slormancer-skill.service';
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
                private slormancerCharacterModifierService: SlormancerCharacterModifierService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => {
                this.character = character;
                this.updateSelectedSkill();
                if (character !== null) {
                    this.selectSkill(<CharacterSkillAndUpgrades>character.skills[10]);
                }
            });
    }

    private updateSelectedSkill() {
        const character = this.character;
        const selectedSkill = this.selectedSkill;
        let newSelectedSkill: CharacterSkillAndUpgrades | null = null;

        if (character === null) {
            newSelectedSkill = null;
        } else if (selectedSkill === null) {
            newSelectedSkill = character.supportSkill !== null
                ? valueOrNull(character.skills.find(s => s.skill === character.supportSkill))
                : valueOrNull(character.skills[0]);
        } else {
            newSelectedSkill = valueOrNull(character.skills.find(skill => skill.skill.id === selectedSkill.skill.id));
            if (newSelectedSkill === null) {
                newSelectedSkill = valueOrNull(character.skills[0]);
            }
        }
            
        this.selectSkill(newSelectedSkill);
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
        if (this.selectedSkill !== skill) {
            this.selectedSkill = skill;
            this.selectedSkillLines = skill === null ? [] : skill.upgrades.map(passive => passive.line).filter(isFirst).sort();
            this.selectedUpgrade = skill === null ? null : valueOrNull(skill.upgrades[0]);
        }
    }

    public incrementSkill(skill: CharacterSkillAndUpgrades): boolean {
        if (this.selectedSkill === skill) {
            if (skill.skill.baseLevel < skill.skill.maxLevel) {
                skill.skill.baseLevel++;
                this.slormancerSkillService.updateSkillModel(skill.skill);
                this.plannerService.updateCurrentCharacter();
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
                this.slormancerSkillService.updateSkillModel(skill.skill);
                this.plannerService.updateCurrentCharacter();
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
        if (this.selectedSkill !== null && this.character !== null) {
            let selectionChanged = false;
            if (this.selectedUpgrade !== selectedUpgrade) {
                this.selectedUpgrade = selectedUpgrade;
                selectionChanged = true;
            }

            if (!this.isUpgradeEquipped(selectedUpgrade)) {
                this.slormancerCharacterModifierService.selectUpgrade(this.character, selectedUpgrade);
    
                if (selectedUpgrade.baseRank === 0) {
                    selectedUpgrade.baseRank = 1;
                    this.slormancerSkillService.updateUpgrade(selectedUpgrade);
                    this.plannerService.updateCurrentCharacter();
                }
            } else if (!selectionChanged && selectedUpgrade.baseRank < selectedUpgrade.maxRank) {
                selectedUpgrade.baseRank++;
                this.slormancerSkillService.updateUpgrade(selectedUpgrade);
                this.plannerService.updateCurrentCharacter();
            }
        }
        return false;
    }

    public decrementUpgrade(selectedUpgrade: SkillUpgrade): boolean {
        if (this.selectedSkill !== null && this.character !== null) {
            let selectionChanged = false;
            if (this.selectedUpgrade !== selectedUpgrade) {
                this.selectedUpgrade = selectedUpgrade;
                selectionChanged = true;
            }

            if (!this.isUpgradeEquipped(selectedUpgrade)) {
                this.slormancerCharacterModifierService.selectUpgrade(this.character, selectedUpgrade);
            } else if (!selectionChanged && selectedUpgrade.baseRank > 1) {
                selectedUpgrade.baseRank--;
                this.slormancerSkillService.updateUpgrade(selectedUpgrade);
                this.plannerService.updateCurrentCharacter();
            }
        }
        return false;
    }

    public isSupport(skill: CharacterSkillAndUpgrades): boolean {
        return skill.skill.type === SkillType.Support;
    }

    public equipSupport(skill: CharacterSkillAndUpgrades) {
        if (this.character !== null) {
            this.slormancerCharacterModifierService.setSupportSkill(this.character, skill.skill);
        }
    }

    public equipPrimary(skill: CharacterSkillAndUpgrades) {
        if (this.character !== null) {
            this.slormancerCharacterModifierService.setPrimarySkill(this.character, skill.skill);
        }
    }

    public equipSecondary(skill: CharacterSkillAndUpgrades) {
        if (this.character !== null) {
            this.slormancerCharacterModifierService.setSecondarySkill(this.character, skill.skill);
        }
    }
}
