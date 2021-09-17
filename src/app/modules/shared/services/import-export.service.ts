import { Injectable } from '@angular/core';

import { Character } from '../../slormancer/model/character';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { SlormancerSaveParserService } from '../../slormancer/services/parser/slormancer-save-parser.service';
import { SlormancerCharacterService } from '../../slormancer/services/slormancer-character.service';
import { Layer } from '../model/layer';
import { Planner } from '../model/planner';
import { SharedData } from '../model/shared-data';
import { JsonConverterService } from './json-converter.service';

@Injectable()
export class ImportExportService {

    constructor(private slormancerCharacterService: SlormancerCharacterService,
                private slormancerSaveParserService: SlormancerSaveParserService,
                private jsonConverterService: JsonConverterService) {
    }

    private parseSaveData(content: string, heroClass: HeroClass): Character {
        const save = this.slormancerSaveParserService.parseSaveFile(content);
        return this.slormancerCharacterService.getCharacterFromSave(save, heroClass);
    }

    private parseUrlData(content: string, heroClass: HeroClass): Character {
        const url = new URL(content);
        throw new Error('not done yet' + url);
    }

    private parseJsonData(content: string, heroClass: HeroClass): SharedData {
        const url = new URL(content);
        throw new Error('not done yet' + url);
    }

    public import(content: string, heroClass: HeroClass): SharedData {
        let data: SharedData = {
            character: null,
            layer: null,
            planner: null
        };
        let found = false;
        
        try {
            data.character = this.parseSaveData(content, heroClass);
            found = true;
        } catch (e) {
            console.log('save file parsing error : ');
            console.error(e);
        }

        if (!found) {
            try {
                data.character = this.parseUrlData(content, heroClass);
                found = true;
            } catch (e) {
                console.log('url data parsing error : ');
                console.error(e);
            }
        }

        if (!found) {
            try {
                data = this.parseJsonData(content, heroClass);
                found = true;
            } catch (e) {
                console.log('json parsing error : ');
                console.error(e);
            }
        }

        return data;
    }

    public exportCharacter(character: Character, minimal: boolean): string {
        return JSON.stringify(this.jsonConverterService.characterToJson(character));
    }

    public exportLayer(layer: Layer): string {
        return JSON.stringify(this.jsonConverterService.layerToJson(layer));
    }

    public exportPlanner(planner: Planner): string {
        return JSON.stringify(this.jsonConverterService.plannerToJson(planner));
    }
}