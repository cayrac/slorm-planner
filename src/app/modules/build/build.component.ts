import { Component } from '@angular/core';

import { PlannerService } from '../shared/services/planner.service';
import { HeroClass } from '../slormancer/model/content/enum/hero-class';

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

    constructor(private plannerService: PlannerService) { }
    
    public uploadSave(file: Event) {
        if (file.target !== null) {
            const files = (<HTMLInputElement>file.target).files;
            if (files !== null && files[0]) {
                this.upload(files[0]);
            }
        }
    }

    public upload(file: File) {
        var reader: FileReader | null = new FileReader();

        reader.onerror = () => {
            reader = null;
            alert('Failed to upload file');
        };
        reader.onloadend = () => {
            if (reader !== null && reader.result !== null) {
                this.plannerService.loadSave(reader.result.toString(), HeroClass.Mage);
                reader = null;
            }
        };

        reader.readAsText(file);
    }
}
