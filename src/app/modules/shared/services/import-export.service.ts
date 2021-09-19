import { Injectable } from '@angular/core';

import { Character } from '../../slormancer/model/character';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { SlormancerSaveParserService } from '../../slormancer/services/parser/slormancer-save-parser.service';
import { SlormancerCharacterBuilderService } from '../../slormancer/services/slormancer-character-builder.service';
import { Layer } from '../model/layer';
import { Planner } from '../model/planner';
import { SharedData } from '../model/shared-data';
import { JsonCompresserService } from './json-compresser.service';
import { JsonConverterService } from './json-converter.service';

@Injectable()
export class ImportExportService {

    constructor(private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private slormancerSaveParserService: SlormancerSaveParserService,
                private jsonConverterService: JsonConverterService,
                private jsonCompresserService: JsonCompresserService) {
    }

    private parseSaveData(content: string, heroClass: HeroClass): Character {
        const save = this.slormancerSaveParserService.parseSaveFile(content);
        return this.slormancerCharacterBuilderService.getCharacterFromSave(save, heroClass);
    }

    private parseUrlData(content: string, heroClass: HeroClass): SharedData {
        const url = new URL(content);
        return this.parseJsonData(<string>url.searchParams.get('data'), heroClass);
    }

    private parseJsonData(content: string, heroClass: HeroClass): SharedData {
        const json = this.jsonCompresserService.decompress(content);
        return this.jsonConverterService.jsonToSharedData(json);
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
        } catch (e) { }

        if (!found) {
            try {
                data = this.parseUrlData(content, heroClass);
                found = true;
            } catch (e) { }
        }

        if (!found) {
            try {
                data = this.parseJsonData(content, heroClass);
                found = true;
            } catch (e) { }
        }

        console.log('import : ', data);

        return data;
    }

    public exportMinimalCharacter(character: Character): string {
        return this.jsonCompresserService.compressCharacter(this.jsonConverterService.characterToMinimalJson(character));
    }

    public exportLayer(layer: Layer): string {
        return this.jsonCompresserService.compressLayer(this.jsonConverterService.layerToJson(layer));
    }

    public exportPlanner(planner: Planner): string {
        console.log('export : ', this.jsonConverterService.plannerToJson(planner));
        return this.jsonCompresserService.compressPlanner(this.jsonConverterService.plannerToJson(planner));
    }
}