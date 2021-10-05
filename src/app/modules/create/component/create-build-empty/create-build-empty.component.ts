import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { PlannerService } from '../../../shared/services/planner.service';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';

@Component({
    selector: 'app-create-build-empty',
    templateUrl: './create-build-empty.component.html',
    styleUrls: ['./create-build-empty.component.scss']
})
export class CreateBuildEmptyComponent {

    public readonly HERO_CLASSES = [HeroClass.Warrior, HeroClass.Huntress, HeroClass.Mage];

    public selectedClass: HeroClass | null = null;

    constructor(private router: Router,
                private plannerService: PlannerService) {}

    public createBuild() {
        if (this.selectedClass !== null) {
            this.plannerService.createNewPlanner(this.selectedClass);
            this.router.navigate(['/build']);
        }
    }
}
