import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character } from '../../../slormancer/model/character';

@Component({
  selector: 'app-build-header',
  templateUrl: './build-header.component.html',
  styleUrls: ['./build-header.component.scss']
})
export class BuildHeaderComponent extends AbstractUnsubscribeComponent implements OnInit {

    public character: Character | null = null;

    public readonly searchControl = new FormControl('');

    constructor(private plannerService: PlannerService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }
    
}
