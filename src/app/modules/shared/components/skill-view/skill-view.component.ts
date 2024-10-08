import { Component, Input } from '@angular/core';
import { Skill } from '@slorm-api';

@Component({
  selector: 'app-skill-view',
  templateUrl: './skill-view.component.html',
  styleUrls: ['./skill-view.component.scss']
})
export class SkillViewComponent {

    @Input()
    public readonly skill: Skill | null = null;

    constructor() { }

}
