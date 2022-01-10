import { Component, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-first-build',
    templateUrl: './create-first-build.component.html',
    styleUrls: ['./create-first-build.component.scss']
})
export class CreateFirstBuildComponent {

    public readonly created = new EventEmitter();

    constructor(private router: Router) {}
    
    public redirectToBuild() {
        this.router.navigate(['/build']);
    }
}
