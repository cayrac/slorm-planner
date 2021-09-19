import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { CharacterStat, CharacterStats } from '../../../slormancer/model/content/character-stats';
import { SlormancerTranslateService } from '../../../slormancer/services/content/slormancer-translate.service';
import { isFirst } from '../../../slormancer/util/utils';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent extends AbstractUnsubscribeComponent implements OnInit {

    public stats: CharacterStats | null = null;

    constructor(private plannerService: PlannerService,
                private slormancerTranslateService: SlormancerTranslateService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => {
                this.stats = character === null ? null : character.stats;
            });
    }

    public getSections(stats: Array<CharacterStat>): Array<string> {
        return stats.map(stat => stat.section).filter(isFirst);
    }

    public getSectionStats(stats: Array<CharacterStat>, section: string): Array<CharacterStat> {
        return stats.filter(stat => stat.section === section);
    }

    public getValue(stat: CharacterStat): string {
        if (typeof stat.total === 'number') {
            return (stat.total < 0 ? '-' : (stat.sign ? '+' : '')) + stat.total + stat.type;
        } else {
            return (stat.total.min < 0 ? '-' : (stat.sign ? '+' : '')) + stat.total.min + stat.type
             + ' - ' + (stat.total.max < 0 ? '-' : (stat.sign ? '+' : '')) + stat.total.max + stat.type;
        }

    }

    public translate(key: string): string {
        return this.slormancerTranslateService.translate(key);
    }
}
