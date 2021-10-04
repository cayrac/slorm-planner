import { Component, Input, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { SearchService } from '../../../../../shared/services/search.service';
import { SkillType } from '../../../../../slormancer/model/content/skill-type';
import { SkillUpgrade } from '../../../../../slormancer/model/content/skill-upgrade';


@Component({
  selector: 'app-upgrade-slot',
  templateUrl: './upgrade-slot.component.html',
  styleUrls: ['./upgrade-slot.component.scss']
})
export class UpgradeSlotComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public readonly upgrade: SkillUpgrade | null = null;

    @Input()
    public readonly selected: boolean = false;

    @Input()
    public readonly equipped: boolean = false;

    public hiddenBySearch: boolean = false;

    constructor(private searchService: SearchService) {
        super();
    }

    public ngOnInit() {
        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(search => this.hiddenBySearch = search !== null && this.upgrade !== null && !this.searchService.upgradeMatchSearch(this.upgrade))
    }

    public isPassive(upgrade: SkillUpgrade): boolean {
        return upgrade.type === SkillType.Passive;
    }
}
    
