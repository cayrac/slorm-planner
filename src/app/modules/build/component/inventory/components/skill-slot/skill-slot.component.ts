import { Component, HostListener, Input, OnInit } from '@angular/core';

import { Skill } from '../../../../../slormancer/model/content/skill';


@Component({
  selector: 'app-skill-slot',
  templateUrl: './skill-slot.component.html',
  styleUrls: ['./skill-slot.component.scss']
})
export class SkillSlotComponent implements OnInit {

    @Input()
    public readonly skill: Skill | null = null;

    @Input()
    public readonly support: boolean = false;

    public showOverlay = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }
    
    constructor() { }

    public ngOnInit() { }
    
}
