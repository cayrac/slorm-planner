import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { BuildStorageService } from '@shared/services/build-storage.service';

@Injectable()
export class HasNoBuildGuard implements CanActivate {
    constructor(private buildStorageService: BuildStorageService, private router: Router) {}

    canActivate() {
        if (this.buildStorageService.getBuilds().length > 0) {
            this.router.navigate(['slorm-planner', 'build']);
            return false;
        } else {
            return true;
        }
    }
}