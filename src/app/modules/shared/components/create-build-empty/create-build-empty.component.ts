import { Component, EventEmitter, Output } from '@angular/core';

import { BuildStorageService } from '../../../shared/services/build-storage.service';
import { BuildService } from '../../../shared/services/build.service';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';

@Component({
    selector: 'app-create-build-empty',
    templateUrl: './create-build-empty.component.html',
    styleUrls: ['./create-build-empty.component.scss']
})
export class CreateBuildEmptyComponent {

    public readonly HERO_CLASSES = [HeroClass.Warrior, HeroClass.Huntress, HeroClass.Mage];

    @Output()
    public readonly created = new EventEmitter();

    public selectedClass: HeroClass | null = null;

    constructor(private buildService: BuildService,
                private buildStorageService: BuildStorageService) {}

    public createBuild() {
        if (this.selectedClass !== null) {
            const build = this.buildService.createBuild(this.selectedClass, 'New build');
            this.buildService.addLayer(build, 'Empty layer');
            this.buildStorageService.addBuild(build);
            this.created.emit();
        }
    }
}
