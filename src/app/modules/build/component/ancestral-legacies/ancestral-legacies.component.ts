import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
  AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character } from '../../../slormancer/model/character';

@Component({
  selector: 'app-ancestral-legacies',
  templateUrl: './ancestral-legacies.component.html',
  styleUrls: ['./ancestral-legacies.component.scss']
})
export class AncestralLegaciesComponent extends AbstractUnsubscribeComponent implements OnInit {

    public character: Character | null = null;

    constructor(private plannerService: PlannerService) {
        super()
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }
}
