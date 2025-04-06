import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Skill, SKILL_MAX_MASTERY, SkillType, SlormancerTranslateService } from '@slorm-api';

import { MatDialog } from '@angular/material/dialog';
import { BuildStorageService } from '../../services/build-storage.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { ViewData, ViewModalComponent } from '../view-modal/view-modalcomponent';


@Component({
  selector: 'app-skill-slot',
  templateUrl: './skill-slot.component.html',
  styleUrls: ['./skill-slot.component.scss']
})
export class SkillSlotComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly SKILL_MAX_MASTERY = SKILL_MAX_MASTERY;

    public readonly MASTERY_LABEL: string;

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
                private slormancerTranslateService: SlormancerTranslateService,
                private dialog: MatDialog) {
        super();
        this.MASTERY_LABEL = this.slormancerTranslateService.translate('tt_mastery');
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
                        
    public showModalTooltip(event: MouseEvent, skill: Skill | null) {
        let skip = false;

        if (event.ctrlKey && skill !== null) {
            skip = true;
            event.stopPropagation();
            event.stopImmediatePropagation();
            const data: ViewData = { entity: { skill } };
            this.dialog.open(ViewModalComponent, { data });
        }

        return skip;
    }
}
