import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Character } from '../../slormancer/model/character';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { GameSave } from '../../slormancer/model/parser/game/game-save';
import { SlormancerSaveParserService } from '../../slormancer/services/parser/slormancer-save-parser.service';
import { SlormancerCharacterBuilderService } from '../../slormancer/services/slormancer-character-builder.service';
import { SlormancerCharacterService } from '../../slormancer/services/slormancer-character.service';
import { valueOrNull } from '../../slormancer/util/utils';
import { Layer } from '../model/layer';
import { Planner } from '../model/planner';

@Injectable()
export class PlannerService {

    private planner: Planner | null = null;

    private selectedLayerIndex: number = -1;

    public readonly characterChanged = new BehaviorSubject<Character | null>(null);

    public readonly layersChanged = new BehaviorSubject<Array<Layer>>([]);

    public readonly selectedLayerIndexChanged = new BehaviorSubject<number>(this.selectedLayerIndex);

    constructor(private slormancerCharacterService: SlormancerCharacterService,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private slormancerSaveParserService: SlormancerSaveParserService,
                private httpClient: HttpClient) {
        this.httpClient.get('assets/save', { responseType: 'text' })
        .subscribe(save => this.loadSave(save, HeroClass.Huntress));
    }

    public getPlanner(): Planner | null {
        return this.planner;
    }

    public setPlanner(planner: Planner | null) {
        this.planner = planner;
        console.log(this.planner);
        this.layersChanged.next(this.planner === null ? [] : this.planner.layers);
        this.setLayerIndex(this.planner === null ? -1 : 0, true);
    }

    public getPlannerclass(): HeroClass | null {
        let result: HeroClass | null = null;

        if (this.planner !== null) {
            result = this.planner.heroClass;
        }

        return result;
    }

    private initPlanner(heroClass: HeroClass) {
        this.planner = { heroClass, layers: [] };
        this.layersChanged.next(this.planner.layers);
    }

    public setLayerIndex(index: number, forceUpdate: boolean = false) {
        if (this.planner !== null) {
            const newIndex = Math.min(this.planner.layers.length - 1, index);

            if (newIndex !== this.selectedLayerIndex || forceUpdate) {
                this.selectedLayerIndex = newIndex;
                const layer = this.planner.layers[this.selectedLayerIndex];
    
                this.selectedLayerIndexChanged.next(this.selectedLayerIndex);
                this.characterChanged.next(layer ? layer.character : null);
            }
        }
    }

    public getSelectedLayerIndex(): number {
        return this.selectedLayerIndex;
    }

    public getSelectedLayer(): Layer | null {
        return valueOrNull(this.getLayers()[this.selectedLayerIndex]);
    }


    public getLayers(): Array<Layer> {
        return this.planner === null ? [] : this.planner.layers;
    }

    public setLayerName(index: number, name: string) {

        if (this.planner !== null) {

            const layer = this.planner.layers[index];

            if (layer) {
                layer.name = name;
                this.layersChanged.next(this.planner.layers);
            }
        }
    }

    public addLayer(name: string, character: Character | null = null) {
        if (this.planner !== null) {
            const index = this.planner.layers.push({
                name,
                character: character !== null ? character : this.slormancerCharacterBuilderService.getCharacter(this.planner.heroClass)
            });
            this.layersChanged.next(this.planner.layers);
            this.setLayerIndex(index);
        }
    }

    public removeLayer(index: number) {
        if (this.planner !== null && this.planner.layers.length > 1) {
            this.planner.layers.splice(index, 1);
            this.layersChanged.next(this.planner.layers);
            this.setLayerIndex(Math.min(this.planner.layers.length - 1, index), true);
        }
    }

    public copyLayer(index: number, name: string) {
        if (this.planner !== null) {
            const layer = this.planner.layers[index];
            if (layer) {
                const index = this.planner.layers.push({
                    name,
                    character: this.slormancerCharacterBuilderService.getCharacterClone(layer.character)
                })
                this.layersChanged.next(this.planner.layers);
                this.setLayerIndex(index);
            }
        }
    }

    public addLayerFromSave(save: GameSave) {
        if (this.planner !== null) {
            const character = this.slormancerCharacterBuilderService.getCharacterFromSave(save, this.planner.heroClass);
            const name = 'Layer ' + (this.planner.layers.length + 1);

            this.planner.layers.push({ name, character });
            this.layersChanged.next(this.planner.layers);
            
            this.setLayerIndex(this.planner.layers.length - 1);
        }
    }

    public loadSave(saveContent: string, heroClass: HeroClass) {
        const save = this.slormancerSaveParserService.parseSaveFile(saveContent);

        
        this.initPlanner(heroClass);
        this.addLayerFromSave(save);

        console.log(save);
        console.log(this.planner);
    }

    public updateCurrentCharacter() {
        if (this.planner !== null) {
            const layer = this.planner.layers[this.selectedLayerIndex];

            if (layer) {
                this.slormancerCharacterService.updateCharacter(layer.character);
                
            }
        }
    }
}