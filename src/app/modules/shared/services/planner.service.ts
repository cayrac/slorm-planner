import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Character } from '../../slormancer/model/character';
import { Activable } from '../../slormancer/model/content/activable';
import { AncestralLegacy } from '../../slormancer/model/content/ancestral-legacy';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { SlormancerCharacterService } from '../../slormancer/services/slormancer-character.service';
import { compare, isFirst, isNotNullOrUndefined } from '../../slormancer/util/utils';

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
        .subscribe(save => this.loadSave(save, HeroClass.Huntress));
    }

    public loadSave(save: string, heroclass: HeroClass) {
        this.character = this.slormancerCharacterService.getCharacterFromSave(save, heroclass);
        console.log(this.character);
        this.characterChanged.next(this.character);
    }

    public getAvailableActivables(): Array<Activable | AncestralLegacy> {
        let result: Array<Activable | AncestralLegacy> = [];

        const character = this.character;
        if (character !== null) {
            const legendaryActivables = [
                character.gear.amulet,
                character.gear.belt,
                character.gear.body,
                character.gear.boot,
                character.gear.bracer,
                character.gear.cape,
                character.gear.glove,
                character.gear.helm,
                character.gear.ring_l,
                character.gear.ring_r,
                character.gear.shoulder
                ]
                .map(item => item !== null && item.legendaryEffect !== null ? item.legendaryEffect.activable : null)
                .filter(isNotNullOrUndefined)
                .sort((a, b) => -compare(a.level, b.level))
                .filter((value, index, values) => isFirst(value, index, values, (a, b) => a.id === b.id));
            const reaperActivables = character.reaper === null ? [] : character.reaper.activables;
            const ancestralLegacies = character.ancestralLegacies.activeAncestralLegacies
                .map(ancestralLegacy => character.ancestralLegacies.ancestralLegacies[ancestralLegacy])
                .filter(isNotNullOrUndefined)
                .filter(ancestralLegacy => ancestralLegacy.isActivable);

            result = [
                ...legendaryActivables,
                ...reaperActivables,
                ...ancestralLegacies
            ];

        }

        return result;
    }
}