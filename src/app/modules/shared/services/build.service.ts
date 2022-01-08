import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { DEFAULT_CONFIG } from '../../slormancer/constants/content/data/default-configs';
import { Character } from '../../slormancer/model/character';
import { CharacterConfig } from '../../slormancer/model/character-config';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { SlormancerCharacterBuilderService } from '../../slormancer/services/slormancer-character-builder.service';
import { SlormancerCharacterUpdaterService } from '../../slormancer/services/slormancer-character.updater.service';
import { valueOrNull } from '../../slormancer/util/utils';
import { Build } from '../model/build';
import { Layer } from '../model/layer';
import { BuildRetrocompatibilityService as BuildRetrocompatibilityService } from './build-retrocompatibility.service';
import { JsonConverterService } from './json-converter.service';

@Injectable({ providedIn: 'root' })
export class BuildService {

    private readonly MAX_LAYERS = 10;

    private readonly STORAGE_KEY = 'slorm-planner-build';

    private build: Build | null = null;

    private selectedLayerIndex: number = -1;

    public readonly manualSave = new Subject<void>();

    public readonly characterChanged = new BehaviorSubject<Character | null>(null);

    public readonly layersChanged = new BehaviorSubject<Array<Layer>>([]);

    public readonly selectedLayerIndexChanged = new BehaviorSubject<number>(this.selectedLayerIndex);

    constructor(private slormancerCharacterService: SlormancerCharacterUpdaterService,
                private jsonConverterService: JsonConverterService,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private buildRetrocompatibilityService: BuildRetrocompatibilityService) {
        const data = localStorage.getItem(this.STORAGE_KEY);
        this.addBuild(data === null ? null : this.jsonConverterService.jsonToBuild(JSON.parse(data)))

        this.manualSave.pipe(debounceTime(500))
            .subscribe(() => {
                if (this.build !== null) {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.jsonConverterService.plannerToJson(this.build)));
                }
            });
    }

    public getBuild(): Build | null {
        return this.build;
    }

    public addBuild(planner: Build | null) {
        if (planner !== null) {
            this.buildRetrocompatibilityService.updateToLatestVersion(planner);
        }
        this.build = planner;
        this.layersChanged.next(this.build === null ? [] : this.build.layers);
        this.setLayerIndex(this.build === null ? -1 : 0, true);
        this.updateAllCharacters();
    }

    public getBuildClass(): HeroClass | null {
        let result: HeroClass | null = null;

        if (this.build !== null) {
            result = this.build.heroClass;
        }

        return result;
    }

    private initBuild(heroClass: HeroClass, name: string) {
        this.build = {
            version: environment.version,
            name,
            heroClass,
            layers: [],
            configuration: DEFAULT_CONFIG
        };
        this.layersChanged.next(this.build.layers);
    }

    public setLayerIndex(index: number, forceUpdate: boolean = false) {
        if (this.build !== null) {
            const newIndex = Math.min(this.build.layers.length - 1, index);

            if (newIndex !== this.selectedLayerIndex || forceUpdate) {
                this.selectedLayerIndex = newIndex;
                const layer = this.build.layers[this.selectedLayerIndex];
    
                this.selectedLayerIndexChanged.next(this.selectedLayerIndex);
                this.characterChanged.next(layer ? layer.character : null);
                this.saveBuild();
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
        return this.build === null ? [] : this.build.layers;
    }

    public setLayerName(index: number, name: string) {

        if (this.build !== null) {

            const layer = this.build.layers[index];

            if (layer) {
                layer.name = name;
                this.layersChanged.next(this.build.layers);
                this.saveBuild();
            }
        }
    }

    public addLayer(name: string, character: Character | null = null) {
        if (this.build !== null) {
            const index = this.build.layers.push({
                name,
                character: character !== null ? character : this.slormancerCharacterBuilderService.getCharacter(this.build.heroClass)
            });
            this.layersChanged.next(this.build.layers);
            this.setLayerIndex(index);
            this.saveBuild();
        }
    }

    public removeLayer(index: number) {
        if (this.build !== null && this.build.layers.length > 1) {
            this.build.layers.splice(index, 1);
            this.layersChanged.next(this.build.layers);
            this.setLayerIndex(Math.min(this.build.layers.length - 1, index), true);
            this.saveBuild();
        }
    }

    public copyLayer(index: number, name: string) {
        if (this.build !== null) {
            const layer = this.build.layers[index];
            if (layer) {
                const index = this.build.layers.push({
                    name,
                    character: this.slormancerCharacterBuilderService.getCharacterClone(layer.character)
                })
                this.layersChanged.next(this.build.layers);
                this.setLayerIndex(index);
                this.saveBuild();
            }
        }
    }

    public createNewBuild(heroClass: HeroClass, name: string = 'New build', character: Character | null = null, layerName = 'Layer 1') {
        if (character === null || heroClass === character.heroClass) {
            this.initBuild(heroClass, name);
            this.addLayer(layerName, character);
            this.setLayerIndex(0, true);
            this.updateAllCharacters();
        }
    }

    public deleteBuild() {
        this.addBuild(null);
        localStorage.removeItem(this.STORAGE_KEY);
    }

    public updateCurrentCharacter() {
        if (this.build !== null) {
            const layer = this.build.layers[this.selectedLayerIndex];

            if (layer) {
                this.slormancerCharacterService.updateCharacter(layer.character, this.build.configuration);
                this.saveBuild();
            }
        }
    }

    public updateAllCharacters() {
        if (this.build !== null) {
            for (const layer of this.build.layers) {
                this.slormancerCharacterService.updateCharacter(layer.character, this.build.configuration);
            }
            this.saveBuild();
        }
    }

    public saveBuild() {
        this.manualSave.next();
    }

    public hasRoomForMoreLayers(character: Character | null = null): boolean {
        return this.build === null
            || (this.build.layers.length < this.MAX_LAYERS
                && (character === null || this.build.heroClass === character.heroClass));
    }

    public setConfiguration(config: CharacterConfig) {
        if (this.build !== null) {
            Object.assign(this.build.configuration, config);
            this.updateAllCharacters();
        }
    }

    public getConfiguration(): CharacterConfig | null {
        return this.build === null ? null : this.build.configuration;
    }
}