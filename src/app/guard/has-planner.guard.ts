import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { PlannerService } from '../modules/shared/services/planner.service';

@Injectable({
    providedIn: 'root'
})
export class HasPlannerGuard implements CanActivate {
    constructor(private plannerService: PlannerService, private router: Router) {}

    canActivate() {
        if (this.plannerService.getPlanner() === null) {
            this.router.navigate(['/create']);
            return false;
        } else {
            return true;
        }
    }
}