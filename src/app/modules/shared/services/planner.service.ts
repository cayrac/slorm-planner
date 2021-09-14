import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Character } from '../../slormancer/model/character';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { GameSave } from '../../slormancer/model/parser/game/game-save';
import { SlormancerSaveParserService } from '../../slormancer/services/parser/slormancer-save-parser.service';
import { SlormancerCharacterService } from '../../slormancer/services/slormancer-character.service';
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
                private slormancerSaveParserService: SlormancerSaveParserService,
                private httpClient: HttpClient) {
        console.log('NEW PlannerService Instance');
        
        this.httpClient.get('assets/save', { responseType: 'text' })
        .subscribe(save => this.loadSave(save, HeroClass.Huntress));
    }

    private initPlanner(heroClass: HeroClass) {
        this.planner = { heroClass, layers: [] };
        this.layersChanged.next(this.planner.layers);
    }

    public setLayer(index: number) {
        if (this.planner !== null) {
            const newIndex = Math.min(this.planner.layers.length - 1, index);

            if (newIndex !== this.selectedLayerIndex) {
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

    public getLayers(): Array<Layer> {
        return this.planner === null ? [] : this.planner.layers;
    }

    public addLayerFromSave(save: GameSave) {
        if (this.planner !== null) {
            const character = this.slormancerCharacterService.getCharacterFromSave(save, this.planner.heroClass);
            const name = 'Layer ' + (this.planner.layers.length + 1);

            this.planner.layers.push({ name, character });
            this.layersChanged.next(this.planner.layers);
            
            this.setLayer(this.planner.layers.length - 1);
        }
    }

    public loadSave(saveContent: string, heroClass: HeroClass) {
        const save = this.slormancerSaveParserService.parseSaveFile(saveContent);
        
        this.initPlanner(heroClass);
        this.addLayerFromSave(save);

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