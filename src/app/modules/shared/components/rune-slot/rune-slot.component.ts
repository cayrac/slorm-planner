import { Component, HostListener, Input, OnChanges } from '@angular/core';
import { SearchService } from '@shared/services/search.service';
import { Rune, RuneType } from '@slorm-api';
import { takeUntil } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { ViewData, ViewModalComponent } from '../view-modal/view-modalcomponent';

@Component({
  selector: 'app-rune-slot',
  templateUrl: './rune-slot.component.html',
  styleUrls: ['./rune-slot.component.scss']
})
export class RuneSlotComponent extends AbstractUnsubscribeComponent implements OnChanges {

    @Input()
    public readonly rune: Rune | null = null;

    @Input()
    public readonly showLevel: boolean = true;

    @Input()
    public readonly selected: boolean = false;

    public showOverlay = false;

    public hiddenBySearch = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }
    
    constructor(
        private searchService: SearchService,
        private dialog: MatDialog
    ) {
        super()
        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.updateSearch());
    }

    public ngOnChanges() {
        this.updateSearch();
    }

    private updateSearch() {
        this.hiddenBySearch = this.rune !== null && this.searchService.hasSearch() && !this.searchService.runeMatchSearch(this.rune)
    }

    public hasAura(rune: Rune) {
        return rune.type === RuneType.Effect;
    }
                    
    public showModalTooltip(event: MouseEvent, rune: Rune | null) {
        let skip = false;

        if (event.ctrlKey && rune !== null) {
            skip = true;
            event.stopPropagation();
            event.stopImmediatePropagation();
            const data: ViewData = { entity: { rune } };
            this.dialog.open(ViewModalComponent, { data });
        }

        return skip;
    }
    
}
