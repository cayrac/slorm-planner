import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Skill, SKILL_MAX_MASTERY, SkillType, SlormancerTranslateService } from 'slormancer-api';

import { BuildStorageService } from '../../services/build-storage.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';


@Component({
  selector: 'app-skill-slot',
  templateUrl: './skill-slot.component.html',
  styleUrls: ['./skill-slot.component.scss']
})
export class SkillSlotComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly SKILL_MAX_MASTERY = SKILL_MAX_MASTERY;

    public readonly MASTERY_LABEL = this.slormancerTranslateService.translate('tt_mastery');

    @Input()
    public readonly skill: Skill | null = null;

    @Input()
    public readonly support: boolean = false;

    @Input()
    public readonly readonly: boolean = false;

    @Output()
    public readonly changed = new EventEmitter<Skill>();

    @ViewChild(MatMenuTrigger, { static: true })
    private menu: MatMenuTrigger | null = null; 

    public showOverlay = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }
    
    constructor(private buildStorageService: BuildStorageService,
                private slormancerTranslateService: SlormancerTranslateService) {
        super();
    }

    public ngOnInit() {}

    public getAvailableSkills(): Array<Skill> {
        const layer = this.buildStorageService.getLayer();
        let skills: Array<Skill> = [];

        if (layer !== null && layer.character !== null) {
            const requiredSkillType = this.support ? SkillType.Support : SkillType.Active;
            skills = layer.character.skills
                .map(skillAndPassive => skillAndPassive.skill)
                .filter(skill => requiredSkillType === skill.type);
        }

        return skills;
    }

    public isSelectedSkill(skill: Skill): boolean {
        const layer = this.buildStorageService.getLayer();
        return layer !== null && layer.character !== null && (
                layer.character.primarySkill === skill
             || layer.character.secondarySkill === skill
             || layer.character.supportSkill === skill); 
    }

    public updateSkill(skill: Skill) {
        if (this.skill !== skill) {
            this.changed.emit(skill);
        }
    }

    public openMenu() {
        if (this.menu !== null && !this.readonly) {
            this.menu.openMenu();
        }
        return false;
    }
}
