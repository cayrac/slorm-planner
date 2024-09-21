import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Trait, TraitLevel } from '@slorm-api';
import { takeUntil } from 'rxjs/operators';

import { SearchService } from '../../services/search.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';

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
            .subscribe(() => this.isHiddenBySearch = this.trait !== null && !this.searchService.traitMatchSearch(this.trait));
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
