import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { takeUntil } from 'rxjs/operators';

import { SKILL_MAX_MASTERY } from '../../../slormancer/constants/common';
import { Character } from '../../../slormancer/model/character';
import { Skill } from '../../../slormancer/model/content/skill';
import { SkillType } from '../../../slormancer/model/content/skill-type';
import { SlormancerTranslateService } from '../../../slormancer/services/content/slormancer-translate.service';
import { PlannerService } from '../../services/planner.service';
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

    @Output()
    public readonly changed = new EventEmitter<Skill>();

    @ViewChild(MatMenuTrigger, { static: true })
    private menu: MatMenuTrigger | null = null; 

    private character: Character | null = null;

    public showOverlay = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }
    
    constructor(private plannerService: PlannerService,
                private slormancerTranslateService: SlormancerTranslateService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }

    public getAvailableSkills(): Array<Skill> {
        let skills: Array<Skill> = [];

        if (this.character !== null) {
            const requiredSkillType = this.support ? SkillType.Support : SkillType.Active;
            skills = this.character.skills
                .map(skillAndPassive => skillAndPassive.skill)
                .filter(skill => requiredSkillType === skill.type);
        }

        return skills;
    }

    public isSelectedSkill(skill: Skill): boolean {
        return this.character !== null && (
                this.character.primarySkill === skill
             || this.character.secondarySkill === skill
             || this.character.supportSkill === skill); 
    }

    public updateSkill(skill: Skill) {
        if (this.skill !== skill) {
            this.changed.emit(skill);
        }
    }

    public openMenu() {
        if (this.menu !== null) {
            this.menu.openMenu();
        }
        return false;
    }
}
