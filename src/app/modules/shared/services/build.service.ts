import { Injectable } from '@angular/core';
import { Character, DEFAULT_CONFIG, HeroClass, SlormancerCharacterBuilderService } from 'slormancer-api';

import { environment } from '../../../../environments/environment';
import { Build } from '../model/build';
import { Layer } from '../model/layer';

@Injectable({ providedIn: 'root' })
export class BuildService {

    constructor(private slormancerCharacterBuilderService: SlormancerCharacterBuilderService) {
    }

    public createBuild(heroClass: HeroClass, name: string): Build {
        return {
            version: environment.version,
            name,
            heroClass,
            layers: [],
            configuration: DEFAULT_CONFIG
        };
    }

    public createBuildWithCharacter(buildName: string, layerName: string, character: Character): Build {
        const build: Build = {
            version: environment.version,
            name: buildName,
            heroClass: character.heroClass,
            layers: [],
            configuration: DEFAULT_CONFIG
        };

        const clone = this.slormancerCharacterBuilderService.getCharacterClone(character);
        clone.importVersion = null;
        this.addLayer(build, layerName, clone);

        return build;
    }

    public addLayer(build: Build, name: string, character: Character | null = null): Layer {
        const layer = {
            name,
            character: character !== null ? character : this.slormancerCharacterBuilderService.getCharacter(build.heroClass)
        }
        build.layers.push(layer);
        return layer;
    }

    public duplicateLayer(build: Build, layer: Layer, name: string): Layer {
        return this.addLayer(build, name, this.slormancerCharacterBuilderService.getCharacterClone(layer.character));
    }

    public deleteLayer(build: Build, layer: Layer) {
        const index = build.layers.indexOf(layer);
        if (index !== -1) {
            build.layers.splice(index, 1);
        }
    }
}