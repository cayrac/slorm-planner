import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { BuildStorageService } from '../modules/shared/services/build-storage.service';

@Injectable({
    providedIn: 'root'
})
export class HasNoBuildGuard implements CanActivate {
    constructor(private buildStorageService: BuildStorageService, private router: Router) {}

    canActivate() {
        if (this.buildStorageService.getBuilds().length > 0) {
            this.router.navigate(['/build']);
            return false;
        } else {
            return true;
        }
    }
}