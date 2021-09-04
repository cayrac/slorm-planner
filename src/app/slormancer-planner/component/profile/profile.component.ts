import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { Character } from '../../../slormancer/model/character';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { SlormancerCharacterService } from '../../../slormancer/services/slormancer-character.service';
import { valueOrNull } from '../../../slormancer/util/utils';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class SlormancerProfileComponent implements OnInit {

    public character: Character | null = null;

    constructor(private slormancerCharacterService: SlormancerCharacterService,
                private httpClient: HttpClient) { }

    public ngOnInit() {
        this.httpClient.get('assets/save', { responseType: 'text' })
        .subscribe(save => this.loadSave(save, HeroClass.Huntress));
    }

    private loadSave(save: string, heroclass: HeroClass) {
        this.character = this.slormancerCharacterService.getCharacterFromSave(save, heroclass);
        console.log(this.character);
        console.log(this.character.ancestralLegacies.activeNodes);
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
