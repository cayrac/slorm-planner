import { Component, OnInit } from '@angular/core';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { takeUntil } from 'rxjs/operators';
import { MergedStat } from 'slormancer-api';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent extends AbstractUnsubscribeComponent implements OnInit {

    public stats: Array<MergedStat> | null = null;

    public selectedMergedStat: MergedStat | null = null;

    constructor(private buildStorageService: BuildStorageService) {
        super();
    }

    public ngOnInit() {
        this.buildStorageService.layerChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => {
                this.stats = layer === null ? null : layer.character.stats;
            });
    }

    public selectMergedStat(mergedStat: MergedStat) {
        console.log('selectMergedStat : ', mergedStat);
        this.selectedMergedStat = mergedStat;
    }
}
