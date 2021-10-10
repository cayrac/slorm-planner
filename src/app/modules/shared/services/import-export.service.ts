import { Injectable } from '@angular/core';

import { Character } from '../../slormancer/model/character';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { SlormancerSaveParserService } from '../../slormancer/services/parser/slormancer-save-parser.service';
import { SlormancerCharacterBuilderService } from '../../slormancer/services/slormancer-character-builder.service';
import { valueOrNull } from '../../slormancer/util/utils';
import { Layer } from '../model/layer';
import { Planner } from '../model/planner';
import { SharedData } from '../model/shared-data';
import { JsonConverterService } from './json-converter.service';
import { OnlinePasteService } from './online-paste.service';

@Injectable({ providedIn: 'root' })
export class ImportExportService {

    private readonly VIEW_PATH = window.origin + '/view/';

    constructor(private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private slormancerSaveParserService: SlormancerSaveParserService,
                private pastebinService: OnlinePasteService,
                private jsonConverterService: JsonConverterService) {
    }

    private parseSaveData(content: string, heroClass: HeroClass): Character {
        const save = this.slormancerSaveParserService.parseSaveFile(content);
        return this.slormancerCharacterBuilderService.getCharacterFromSave(save, heroClass);
    }

    private parseUrlData(path: string): Promise<SharedData> {
        return new Promise(resolve => {
            const defaultResult: SharedData = {
                character: null,
                layer: null,
                planner: null
            }
            let key: string | null = null;

            try {
                const url = new URL(path);
                const fragments = url.pathname.split('/');
                key = valueOrNull(fragments[fragments.length - 1]);
            } catch (e) { }

            if (key == null) {
                resolve(defaultResult);
            } else {
                this.importFromOnlinePaste(key).then(data => resolve(data));
            }
        });
    }

    private parseJsonData(content: string): SharedData {
        const json = JSON.parse(content);
        return this.jsonConverterService.jsonToSharedData(json);
    }

    public importFromOnlinePaste(key: string): Promise<SharedData> {
        return new Promise(resolve => {
            this.pastebinService.getPaste(key)
            .subscribe(result => {
                if (result !== null) {
                    this.import(result).then(sharedData => resolve(sharedData));
                } else {
                    resolve({
                        character: null,
                        layer: null,
                        planner: null
                    });
                }
            });
        });
    }

    public import(content: string, heroClass: HeroClass | null = null): Promise<SharedData> {
        return new Promise(resolve => {
            let data: SharedData = {
                character: null,
                layer: null,
                planner: null
            };

            if (heroClass !== null) {
                try {
                    data.character = this.parseSaveData(content, heroClass);
                    resolve(data);
                } catch (e) {
                    console.error('Error when parsing save file : ', e);
                }
            }

            try {
                data = this.parseJsonData(atob(content));
                resolve(data);
            } catch (e) {}
    
            try {
                data = this.parseJsonData(content);
                resolve(data);
            } catch (e) { }
    
            this.parseUrlData(content)
                .then(result => resolve(result));
        });
    }

    public exportCharacter(character: Character): string {
        return btoa(JSON.stringify(this.jsonConverterService.characterToJson(character)));
    }

    public exportLayer(layer: Layer): string {
        return btoa(JSON.stringify(this.jsonConverterService.layerToJson(layer)));
    }

    public exportPlanner(planner: Planner): string {
        return btoa(JSON.stringify(this.jsonConverterService.plannerToJson(planner)));
    }

    public exportCharacterAsLink(character: Character): Promise<string | null> {
        const content = this.exportCharacter(character);
        return new Promise(resolve => {
            this.pastebinService.createPaste(content)
            .subscribe(result => resolve(result === null ? null : this.VIEW_PATH + result));
        });
    }
}