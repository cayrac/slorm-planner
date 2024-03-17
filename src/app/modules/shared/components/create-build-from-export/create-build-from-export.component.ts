import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedData } from '@shared/model/shared-data';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { BuildService } from '@shared/services/build.service';
import { DEFAULT_CONFIG } from 'slormancer-api';

@Component({
    selector: 'app-create-build-from-export',
    templateUrl: './create-build-from-export.component.html',
    styleUrls: ['./create-build-from-export.component.scss']
})
export class CreateBuildFromExportComponent {

    @Output()
    public readonly created = new EventEmitter();

    @Input()
    public readonly name: string = 'Default name';
    
    constructor(private buildStorageService: BuildStorageService,
                private buildService: BuildService) {
    }
    
    public createBuild(sharedData: SharedData) {
        let config = DEFAULT_CONFIG;

        if (sharedData.configuration !== null) {
            config = { ...config, ...sharedData.configuration };
        }

        if (sharedData.character !== null) {
            const build = this.buildService.createBuildWithCharacter(this.name, 'Imported layer', sharedData.character, config);
            this.buildStorageService.addBuild(build);
            this.created.emit();
        } else if (sharedData.layer !== null) {
            const build = this.buildService.createBuildWithCharacter(this.name, sharedData.layer.name, sharedData.layer.character, config);
            this.buildStorageService.addBuild(build);
            this.created.emit();
        } else if (sharedData.planner !== null) {
            this.buildStorageService.addBuild(sharedData.planner);
            this.created.emit();
        }
    }
}
