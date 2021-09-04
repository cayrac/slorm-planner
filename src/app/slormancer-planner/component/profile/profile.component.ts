import { Component, OnInit } from '@angular/core';

import { Character } from '../../../slormancer/model/character';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { SlormancerCharacterService } from '../../../slormancer/services/slormancer-character.service';
import { valueOrNull } from '../../../slormancer/util/utils';
import { SAVE } from '../../save';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class SlormancerProfileComponent implements OnInit {

    public character: Character | null = null;

    constructor(private slormancerCharacterService: SlormancerCharacterService) { }

    public ngOnInit() {
        this.character = this.slormancerCharacterService.getCharacterFromSave(SAVE, HeroClass.Huntress);

        console.log(this.character);

        
    }

    public getSkillName(id: number | null): string {
        let name: string = '';

        if (this.character !== null && id !== null) {
            const skill = valueOrNull(this.character.skills.map(data => data.skill).find(skill => skill.id === id));
            if (skill !== null) {
                name = skill.name;
            }
        }

        return name;
    }

}
