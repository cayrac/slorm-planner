import { Component, HostListener, Input, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { TraitLevel } from '../../../../../slormancer/model/content/enum/trait-level';
import { Trait } from '../../../../../slormancer/model/content/trait';
import { SearchService } from '../../../inventory/services/search.service';

/*
export interface Trait {
    attribute: Attribute;
    requiredRank: number;
    traitLevel: TraitLevel;
    rank: number;
    unlocked: boolean;

    attributeName: string;
    cumulativeStats: string | null;
    description: string | null;
    rankLabel: string;
    traitLevelLabel: string;
    unlockLabel: string | null;
    
    template: string | null;
    values: Array<AbstractEffectValue>;
    cumulativeValues: Array<EffectValueVariable>;
}

    Minor = 'trait_minor',
    Major = 'trait_major',
    Greater = 'trait_greater',

*/

@Component({
  selector: 'app-trait',
  templateUrl: './trait.component.html',
  styleUrls: ['./trait.component.scss']
})
export class TraitComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public trait: Trait | null = null;

    @Input()
    public first: boolean = false;

    @Input()
    public last: boolean = false;

    @Input()
    public highlight: boolean = false;

    @Input()
    public unlocked: boolean = false;

    @Input()
    public bonus: boolean = false;

    public isMouseOver = false;

    public isHiddenBySearch = false;

    @HostListener('mouseenter')
    public onMouseEnter() {
        this.isMouseOver = true;
    }

    @HostListener('mouseleave')
    public onMouseLeave() {
        this.isMouseOver = false;
    }

    constructor(private searchService: SearchService) {
        super();
    }

    public ngOnInit() {
        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.isHiddenBySearch = this.trait !== null && !this.searchService.traitMatchSearch(this.trait))
    }

    public isMinor(trait: Trait): boolean {
        return trait.traitLevel === TraitLevel.Minor;
    }

    public isMajor(trait: Trait): boolean {
        return trait.traitLevel === TraitLevel.Major;
    }

    public isGreater(trait: Trait): boolean {
        return trait.traitLevel === TraitLevel.Greater;
    }
}
