import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { BuildService } from '../modules/shared/services/build.service';

@Injectable({
    providedIn: 'root'
})
export class HasNoBuildGuard implements CanActivate {
    constructor(private plannerService: BuildService, private router: Router) {}

    canActivate() {
        if (this.plannerService.getBuild() !== null) {
            this.router.navigate(['/build']);
            return false;
        } else {
            return true;
        }
    }
}