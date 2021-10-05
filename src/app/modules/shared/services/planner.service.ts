import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Character } from '../../slormancer/model/character';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { SlormancerCharacterBuilderService } from '../../slormancer/services/slormancer-character-builder.service';
import { SlormancerCharacterUpdaterService } from '../../slormancer/services/slormancer-character.updater.service';
import { valueOrNull } from '../../slormancer/util/utils';
import { Layer } from '../model/layer';
import { Planner } from '../model/planner';

@Injectable({ providedIn: 'root' })
export class PlannerService {

    private readonly MAX_LAYERS = 10;

    private readonly STORAGE_KEY = 'slorm-planner-build';

    private planner: Planner | null = null;

    private selectedLayerIndex: number = -1;

    public readonly manualSave = new Subject();

    public readonly characterChanged = new BehaviorSubject<Character | null>(null);

    public readonly layersChanged = new BehaviorSubject<Array<Layer>>([]);

    public readonly selectedLayerIndexChanged = new BehaviorSubject<number>(this.selectedLayerIndex);

    constructor(private slormancerCharacterService: SlormancerCharacterUpdaterService,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService) {
        const data = localStorage.getItem(this.STORAGE_KEY)
        this.setPlanner(data === null ? null : JSON.parse(data))
        console.log('Loaded planner from local storage : ', this.planner);

        this.manualSave.pipe(debounceTime(500))
            .subscribe(() => {
                console.log('attempt to save ...');
                if (this.planner !== null) {
                    console.log('saving ...');
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.planner));
                }
            });
    }

    public getPlanner(): Planner | null {
        return this.planner;
    }

    public setPlanner(planner: Planner | null) {
        this.planner = planner;
        this.layersChanged.next(this.planner === null ? [] : this.planner.layers);
        this.setLayerIndex(this.planner === null ? -1 : 0, true);
        this.savePlanner();
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
                this.savePlanner();
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
                this.savePlanner();
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
            this.savePlanner();
        }
    }

    public removeLayer(index: number) {
        if (this.planner !== null && this.planner.layers.length > 1) {
            this.planner.layers.splice(index, 1);
            this.layersChanged.next(this.planner.layers);
            this.setLayerIndex(Math.min(this.planner.layers.length - 1, index), true);
            this.savePlanner();
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
                this.savePlanner();
            }
        }
    }

    public createNewPlanner(heroClass: HeroClass, character: Character | null = null, layerName = 'Layer 1') {
        if (character === null || heroClass === character.heroClass) {
            this.initPlanner(heroClass);
            this.addLayer(layerName, character);
            this.setLayerIndex(0, true);
            this.savePlanner();
        }
    }

    public deletePlanner() {
        this.setPlanner(null);
        localStorage.removeItem(this.STORAGE_KEY);
    }

    public updateCurrentCharacter() {
        if (this.planner !== null) {
            const layer = this.planner.layers[this.selectedLayerIndex];

            if (layer) {
                this.slormancerCharacterService.updateCharacter(layer.character);
                this.savePlanner();
            }
        }
    }

    public savePlanner() {
        this.manualSave.next();
    }

    public hasRoomForMoreLayers(character: Character | null = null): boolean {
        return this.planner === null
            || (this.planner.layers.length < this.MAX_LAYERS
                && (character === null || this.planner.heroClass === character.heroClass));
    }
}