import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { SharedData } from '../../../shared/model/shared-data';
import { PlannerService } from '../../../shared/services/planner.service';

@Component({
    selector: 'app-create-build-from-export',
    templateUrl: './create-build-from-export.component.html',
    styleUrls: ['./create-build-from-export.component.scss']
})
export class CreateBuildFromExportComponent {
    
    constructor(private router: Router,
                private plannerService: PlannerService) {
    }
    
    public createBuild(sharedData: SharedData) {
        if (sharedData.character !== null) {
            this.plannerService.createNewPlanner(sharedData.character.heroClass, 'New build', sharedData.character);
            this.router.navigate(['/build']);
        } else if (sharedData.layer !== null) {
            this.plannerService.createNewPlanner(sharedData.layer.character.heroClass, 'New build', sharedData.layer.character, sharedData.layer.name);
            this.router.navigate(['/build']);
        } else if (sharedData.planner !== null) {
            this.plannerService.addPlanner(sharedData.planner);
            this.router.navigate(['/build']);
        }
    }
}
