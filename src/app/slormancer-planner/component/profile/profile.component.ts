import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { Character } from '../../../slormancer/model/character';
import { Activable } from '../../../slormancer/model/content/activable';
import { AncestralLegacy } from '../../../slormancer/model/content/ancestral-legacy';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { Skill } from '../../../slormancer/model/content/skill';
import { SlormancerCharacterService } from '../../../slormancer/services/slormancer-character.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class SlormancerProfileComponent implements OnInit {

    public character: Character | null = null;

    constructor(private slormancerCharacterService: SlormancerCharacterService,
                private httpClient: HttpClient) {
    }

    public ngOnInit() {
        this.httpClient.get('assets/save', { responseType: 'text' })
        .subscribe(save => this.loadSave(save, HeroClass.Huntress));
    }

    private loadSave(save: string, heroclass: HeroClass) {
        this.character = this.slormancerCharacterService.getCharacterFromSave(save, heroclass);
        console.log(this.character);
        console.log(this.character.ancestralLegacies.activeNodes);
    }

    public getSkillName(skill: Skill | null): string {
        return skill === null ? '' : skill.name;
    }

    public getActivableName(activable: Activable | AncestralLegacy | null): string {
        return activable === null ? '' : activable.name;
    }

    public getAncestralLegacyName(id: number): string {
        let name: string = '';

        if (this.character !== null) {
            const ancestralLegacy = this.character.ancestralLegacies.ancestralLegacies.find(node => node.id === id);
            if (ancestralLegacy) {
                name = ancestralLegacy.name + '(' + ancestralLegacy.rank + ')';
            }
        }

        return name;
    }

}
