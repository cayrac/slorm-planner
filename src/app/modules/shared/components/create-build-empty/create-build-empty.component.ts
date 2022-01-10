import { Component, EventEmitter, Input, Output } from '@angular/core';

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

    @Input()
    public readonly name: string = 'Default name';

    public selectedClass: HeroClass | null = null;

    constructor(private buildService: BuildService,
                private buildStorageService: BuildStorageService) {}

    public createBuild() {
        if (this.selectedClass !== null) {
            const build = this.buildService.createBuild(this.selectedClass, this.name);
            this.buildService.addLayer(build, this.name);
            this.buildStorageService.addBuild(build);
            this.created.emit();
        }
    }
}
