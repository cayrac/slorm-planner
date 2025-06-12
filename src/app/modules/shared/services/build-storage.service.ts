import { Injectable } from '@angular/core';
import { Character, SlormancerCharacterUpdaterService, valueOrDefault, valueOrNull } from '@slorm-api';
import { BehaviorSubject, debounceTime, Subject } from 'rxjs';

import { CrashReport } from '@shared/model/crash-report';
import { environment } from '../../../../environments/environment';
import { Build } from '../model/build';
import { BuildPreview } from '../model/build-preview';
import { Layer } from '../model/layer';
import { BuildRetrocompatibilityService } from './build-retrocompatibility.service';
import { JsonConverterService } from './json-converter.service';

@Injectable({ providedIn: 'root' })
export class BuildStorageService {

    private readonly MAX_LAYERS = 10;

    private readonly BUILDS_STORAGE_KEY = 'builds';

    private readonly BETA_BUILDS_STORAGE_KEY = 'beta-builds';
    
    private readonly CURRENT_BUILD_STORAGE_KEY = 'current-build';

    private readonly CURRENT_LAYER_STORAGE_KEY = 'current-layer';

    private builds: Array<BuildPreview> = [];

    private build: Build | null = null;

    private layer: Layer | null = null;

    private crash: CrashReport | null = null;

    public readonly buildChanged = new BehaviorSubject<Build | null>(null);

    public readonly layerChanged = new BehaviorSubject<Layer | null>(null);

    public readonly errorChanged = new BehaviorSubject<CrashReport | null>(null);

    public readonly saveTrigger = new Subject<void>();


    constructor(private jsonConverterService: JsonConverterService,
                private buildRetrocompatibilityService: BuildRetrocompatibilityService,
                private slormancerCharacterUpdaterService: SlormancerCharacterUpdaterService) {
        this.reload();

        this.oldFormatTransition();

        this.saveTrigger
            .pipe(debounceTime(500)) // retirer le debounce, et voir si je peux pas faire mieux
            .subscribe(() => this.saveToStorage());
    }

    private getCurrentLayerIndex(): number {
        const storageData = localStorage.getItem(this.CURRENT_LAYER_STORAGE_KEY);
        const index = storageData === null ? 0 : parseInt(storageData, 10);
        return Number.isNaN(index) ? 0 : index;
    }

    private oldFormatTransition() {
        const oldKey = 'slorm-planner-build';
        const oldData = localStorage.getItem(oldKey);

        if (oldData !== null && this.builds.length === 0) {
            let build: Build | null = null;

            try {
                build = this.jsonConverterService.jsonToBuild(JSON.parse(oldData))
            } catch (e) {
                console.error('Failed to convert build from old format : ', e);
            }

            if (build !== null) {

                this.addBuild(build);
                
                localStorage.removeItem(oldKey);

                this.saveToStorage();

            }
        }
    }

    private reload() {
        this.builds = [];
        this.build = null;
        this.layer = null;
        this.crash = null;
        let buildsData: string | null = null;
        let buildStorageKey: string | null = null;
        let buildData: string | null = null;
        let layerIndex: number | null = null;
        try {
            buildsData = localStorage.getItem(this.BUILDS_STORAGE_KEY);
            buildStorageKey = localStorage.getItem(this.CURRENT_BUILD_STORAGE_KEY);
            layerIndex = this.getCurrentLayerIndex();

            if (buildsData !== null) {
                this.builds = JSON.parse(buildsData);
            }

            const betaBuildsData = localStorage.getItem(this.BETA_BUILDS_STORAGE_KEY);
            if (betaBuildsData) {
                this.builds.push(...JSON.parse(betaBuildsData));
                this.saveToStorage();
                localStorage.removeItem(this.BETA_BUILDS_STORAGE_KEY);
            }

            if (buildStorageKey !== null) {
                buildData = localStorage.getItem(buildStorageKey);
                if (buildData !== null) {
                    this.build = this.jsonConverterService.jsonToBuild(JSON.parse(buildData));
                    this.buildRetrocompatibilityService.updateToLatestVersion(this.build);
                }
            }

            if (this.build !== null) {
                let layer = valueOrDefault(this.build.layers[layerIndex], this.build.layers[0]);

                if (layer !== undefined) {
                    this.layer = layer;
                }
   
                for (const layer of this.build.layers) {
                    this.slormancerCharacterUpdaterService.updateCharacter(layer.character, this.build.configuration);
                }
            }

        } catch (e) {
            console.error('Failed to reload build : ', e);
            this.crash = this.buildCrashReport(e, buildsData, buildStorageKey, buildData, layerIndex);
        }

        this.pushChanges(this.build, this.layer, this.crash);
    }

    private buildCrashReport(error: any, builds: string | null, buildKey: string | null, build: string | null, layerIndex: number | null): CrashReport {
        let message = 'unknown error';
        let stack = null;

        if (error) {
            if (error instanceof Error) {
                message = error.message;
                stack = error.stack ?? null;
            } else if (typeof error === 'object' && 'constructor' in error) {
                message = 'unknown error of type ' + error.constructor.name;
            }
        }

        return {
            message,
            stack,
            builds,
            buildKey,
            build,
            layerIndex
        };
    }

    private saveToStorage() {
        localStorage.setItem(this.BUILDS_STORAGE_KEY, JSON.stringify(this.builds));

        const currentKey = localStorage.getItem(this.CURRENT_BUILD_STORAGE_KEY);
        if (currentKey !== null && this.build !== null) {
            
            localStorage.setItem(currentKey, JSON.stringify(this.jsonConverterService.buildToJson(this.build)));

            let layerIndex = 0;
            if (this.layer !== null) {
                layerIndex = this.build.layers.indexOf(this.layer);
            }
            localStorage.setItem(this.CURRENT_LAYER_STORAGE_KEY, layerIndex < 0 ? '0' : layerIndex.toString());
        }
    }

    private pushChanges(build: Build | null, layer: Layer | null, error: CrashReport | null) {
        this.buildChanged.next(build);
        this.layerChanged.next(layer);
        this.errorChanged.next(error);
    }

    public pushCrashReport(error: any) {
        if (this.crash === null) {
            const buildsData = localStorage.getItem(this.BUILDS_STORAGE_KEY);
            const buildStorageKey = localStorage.getItem(this.CURRENT_BUILD_STORAGE_KEY);
            const layerIndex = this.getCurrentLayerIndex();
            const buildData = buildStorageKey === null ? null : localStorage.getItem(buildStorageKey)
            this.crash = this.buildCrashReport(error, buildsData, buildStorageKey, buildData, layerIndex);
            this.errorChanged.next(this.crash);
        }
    }

    public saveBuild(instantSave: boolean = false) {
        if (this.build !== null) {
            for (const layer of this.build.layers) {
                this.slormancerCharacterUpdaterService.updateCharacter(layer.character, this.build.configuration);
            }

            const buildPreview = this.getBuildPreview();
            if (buildPreview !== null) {
                buildPreview.name = this.build.name;
            }

            if (this.build !== null) {
                let layerIndex = this.getCurrentLayerIndex();
                const currentLayerIndex = this.layer === null ? -1 : this.build.layers.indexOf(this.layer);

                layerIndex = currentLayerIndex !== -1 ? currentLayerIndex : Math.min(layerIndex, this.build.layers.length - 1);

                this.layer = valueOrNull(this.build.layers[layerIndex]);
            }
            

            if (instantSave) {
                this.saveToStorage();
            } else {
                this.saveTrigger.next();
            }

            
            this.pushChanges(this.build, this.layer, this.crash);
        }
    }

    public saveLayer() {
        if (this.build !== null && this.layer !== null) {
            this.slormancerCharacterUpdaterService.updateCharacter(this.layer.character, this.build.configuration);
            this.saveTrigger.next();
        }
    }

    public loadBuild(preview: BuildPreview) {
        localStorage.setItem(this.CURRENT_BUILD_STORAGE_KEY, preview.storageKey);
        localStorage.setItem(this.CURRENT_LAYER_STORAGE_KEY, '0');
        this.reload();
    }

    public deleteBuild() {
        const currentKey = localStorage.getItem(this.CURRENT_BUILD_STORAGE_KEY);
        if (currentKey !== null) {
            const index = this.builds.findIndex(preview => preview.storageKey === currentKey);
            if (index !== -1) {
                this.builds.splice(index, 1);
                localStorage.removeItem(currentKey)
                localStorage.removeItem(this.CURRENT_BUILD_STORAGE_KEY)
                this.saveToStorage();

                const newIndex = Math.min(index, this.builds.length - 1);
                const preview = this.builds[newIndex];

                if (preview) {
                    this.loadBuild(preview);
                } else {
                    this.reload();
                }
            }
        }
    }

    public loadLayer(layer: Layer) {
        if (this.build !== null) {
            const layerIndex = this.build.layers.indexOf(layer);

            if (layerIndex !== -1) {
                this.layer = layer;

                this.saveBuild();
            }
        }
    }

    public addBuild(build: Build) {
        if (build !== null) {
            this.buildRetrocompatibilityService.updateToLatestVersion(build);
        }

        const preview: BuildPreview = {
            heroClass: build.heroClass,
            name: build.name,
            storageKey: 'build-' + new Date().getTime(),
            version: environment.version
        }

        this.builds.push(preview);
        this.build = build;
        this.layer = valueOrDefault(build.layers[0], null);

        localStorage.setItem(this.CURRENT_BUILD_STORAGE_KEY, preview.storageKey);
        this.saveBuild(true);
    }

    public getBuilds(): Array<BuildPreview> {
        return this.builds;
    }

    public getBuild(): Build | null {
        return this.build;
    }

    public getBuildPreview(): BuildPreview | null {
        const currentKey = localStorage.getItem(this.CURRENT_BUILD_STORAGE_KEY);
        return valueOrNull(this.builds.find(preview => preview.storageKey === currentKey));
    }

    public getLayer(): Layer | null {
        return this.layer;
    }

    public hasRoomForAnotherLayer(character: Character | null = null): boolean {
        return this.build === null
            || (this.build.layers.length < this.MAX_LAYERS
                && (character === null || this.build.heroClass === character.heroClass));
    }

}