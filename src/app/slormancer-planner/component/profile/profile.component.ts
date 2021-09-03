import { Component, OnInit } from '@angular/core';

import { Character } from '../../../slormancer/model/character';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { SlormancerCharacterService } from '../../../slormancer/services/slormancer-character.service';
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
    }

}
