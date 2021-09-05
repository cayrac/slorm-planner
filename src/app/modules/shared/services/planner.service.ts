import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Character } from '../../slormancer/model/character';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { SlormancerCharacterService } from '../../slormancer/services/slormancer-character.service';

@Injectable()
export class PlannerService {

    private character: Character | null = null;

    public readonly characterChanged: BehaviorSubject<Character | null>;

    constructor(private slormancerCharacterService: SlormancerCharacterService,
                private httpClient: HttpClient
        ) {
            console.log('NEW PlannerService Instance')

        this.characterChanged = new BehaviorSubject<Character | null>(this.character);
        
        this.httpClient.get('assets/save', { responseType: 'text' })
        .subscribe(save => this.loadSave(save, HeroClass.Warrior));
    }

    public loadSave(save: string, heroclass: HeroClass) {
        this.character = this.slormancerCharacterService.getCharacterFromSave(save, heroclass);
        console.log(this.character);
        this.characterChanged.next(this.character);
    }
}