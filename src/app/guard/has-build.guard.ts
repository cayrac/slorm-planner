import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { BuildService } from '../modules/shared/services/build.service';

@Injectable({
    providedIn: 'root'
})
export class HasPlannerGuard implements CanActivate {
    constructor(private plannerService: BuildService, private router: Router) {}

    canActivate() {
        if (this.plannerService.getBuild() === null) {
            this.router.navigate(['/create']);
            return false;
        } else {
            return true;
        }
    }
}