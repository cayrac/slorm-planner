import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildService } from '../../../shared/services/build.service';
import { MergedStat } from '../../../slormancer/model/content/character-stats';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent extends AbstractUnsubscribeComponent implements OnInit {

    public stats: Array<MergedStat> | null = null;

    public selectedMergedStat: MergedStat | null = null;

    constructor(private plannerService: BuildService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => {
                this.stats = character === null ? null : character.stats;
            });
    }

    public selectMergedStat(mergedStat: MergedStat) {
        this.selectedMergedStat = mergedStat;
    }
}
