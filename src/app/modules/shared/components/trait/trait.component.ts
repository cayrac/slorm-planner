import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Trait, TraitLevel } from '@slorm-api';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { SearchService } from '../../services/search.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { ViewData, ViewModalComponent } from '../view-modal/view-modalcomponent';

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

    constructor(private searchService: SearchService,
                private dialog: MatDialog
    ) {
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
                            
    public showModalTooltip(event: MouseEvent, trait: Trait) {
        let skip = false;

        if (event.ctrlKey) {
            skip = true;
            event.stopPropagation();
            event.stopImmediatePropagation();
            const data: ViewData = { entity: { trait } };
            this.dialog.open(ViewModalComponent, { data });
        }

        return skip;
    }
}
