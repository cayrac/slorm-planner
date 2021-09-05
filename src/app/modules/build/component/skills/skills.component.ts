import { Component, OnInit } from '@angular/core';

import { Character } from '../../../slormancer/model/character';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {

    public character: Character | null = null;

    constructor() {
    }

    public ngOnInit() {
    }
}
