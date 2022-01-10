import { Component, EventEmitter, Output } from '@angular/core';

import { SharedData } from '../../../shared/model/shared-data';
import { BuildStorageService } from '../../../shared/services/build-storage.service';
import { BuildService } from '../../../shared/services/build.service';

@Component({
    selector: 'app-create-build-from-export',
    templateUrl: './create-build-from-export.component.html',
    styleUrls: ['./create-build-from-export.component.scss']
})
export class CreateBuildFromExportComponent {

    @Output()
    public readonly created = new EventEmitter();
    
    constructor(private buildStorageService: BuildStorageService,
                private buildService: BuildService) {
    }
    
    public createBuild(sharedData: SharedData) {
        if (sharedData.character !== null) {
            const build = this.buildService.createBuildWithCharacter('Imported build', 'Imported layer', sharedData.character);
            this.buildStorageService.addBuild(build);
            this.created.emit();
        } else if (sharedData.layer !== null) {
            const build = this.buildService.createBuildWithCharacter('Imported build', sharedData.layer.name, sharedData.layer.character);
            this.buildStorageService.addBuild(build);
            this.created.emit();
        } else if (sharedData.planner !== null) {
            this.buildStorageService.addBuild(sharedData.planner);
            this.created.emit();
        }
    }
}
