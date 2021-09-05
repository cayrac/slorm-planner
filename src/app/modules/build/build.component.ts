import { Component } from '@angular/core';

@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent {

    public readonly ROUTES = [
        { name: 'Inventory', route: 'inventory'},
        { name: 'Skills', route: 'skills'},
        { name: 'Ancestral legacy', route: 'ancestral-legacy'},
    ];

    constructor() { }
}
