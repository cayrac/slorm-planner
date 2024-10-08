import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildStorageService } from '@shared/services/build-storage.service';
import {
    CharacterSkillAndUpgrades,
    SkillType,
    SlormancerCharacterModifierService,
    SlormancerSkillService,
} from '@slorm-api';


@Component({
  selector: 'app-settings-skills',
  templateUrl: './settings-skills.component.html',
  styleUrls: ['./settings-skills.component.scss']
})
export class SettingsSkillsComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public selectedSkill: CharacterSkillAndUpgrades | null = null;

    @ViewChild(MatMenuTrigger, { static: true })
    private menu: MatMenuTrigger | null = null;

    constructor(private buildStorageService: BuildStorageService,
                private slormancerSkillService: SlormancerSkillService,
                private slormancerCharacterModifierService: SlormancerCharacterModifierService
                ) {
        super();
    }

    public ngOnInit() { }

    public openSettings(): boolean {
        if (this.menu !== null) {
            this.menu.openMenu();
        }
        return false;
    }

    public isSupport(skill: CharacterSkillAndUpgrades): boolean {
        return skill.skill.type === SkillType.Support;
    }

    public maximize(skill: CharacterSkillAndUpgrades) {
        const layer = this.buildStorageService.getLayer();
        if (layer !== null) {

            skill.skill.baseLevel = skill.skill.maxLevel;
            this.slormancerSkillService.updateSkillModel(skill.skill);
            for (const upgrade of skill.upgrades) {
                upgrade.baseRank = upgrade.maxRank;
                this.slormancerSkillService.updateUpgradeModel(upgrade);
            }

            this.buildStorageService.saveLayer();
        }
    }

    public equipSupport(skill: CharacterSkillAndUpgrades) {
        const layer = this.buildStorageService.getLayer();
        if (layer !== null) {
            if (this.slormancerCharacterModifierService.setSupportSkill(layer.character, skill.skill)) {
                this.buildStorageService.saveLayer();
            }
        }
    }

    public equipPrimary(skill: CharacterSkillAndUpgrades) {
        const layer = this.buildStorageService.getLayer();
        if (layer !== null) {
            if (this.slormancerCharacterModifierService.setPrimarySkill(layer.character, skill.skill)) {
                this.buildStorageService.saveLayer();
            }
        }
    }

    public equipSecondary(skill: CharacterSkillAndUpgrades) {
        const layer = this.buildStorageService.getLayer();
        if (layer !== null) {
            if (this.slormancerCharacterModifierService.setSecondarySkill(layer.character, skill.skill)) {
                this.buildStorageService.saveLayer();
            }
        }
    }
    
    public isEquippedSupportSkill(skill: CharacterSkillAndUpgrades): boolean {
        const layer = this.buildStorageService.getLayer();
        return layer !== null && layer.character.supportSkill === skill.skill;
    }
    
    public isEquippedPrimarySkill(skill: CharacterSkillAndUpgrades): boolean {
        const layer = this.buildStorageService.getLayer();
        return layer !== null && layer.character.primarySkill === skill.skill;
    }
    
    public isEquippedSecondarySkill(skill: CharacterSkillAndUpgrades): boolean {
        const layer = this.buildStorageService.getLayer();
        return layer !== null && layer.character.secondarySkill === skill.skill;
    }
}
    
