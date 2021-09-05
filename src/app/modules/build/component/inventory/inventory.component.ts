import { Component, HostListener, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { Character } from '../../../slormancer/model/character';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent extends AbstractUnsubscribeComponent implements OnInit {

    public character: Character | null = null;

    public idle: number = 0;

    @HostListener('window:keydown', ['$event'])
    spaceEvent(event: any) {
        if (event.keyCode == 81) { // left
            this.idle--;
        } else if (event.keyCode == 68) {
            this.idle++;
        }

        this.idle = (this.idle + 10) % 10;

    }

    constructor(private plannerService: PlannerService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }
    
}
