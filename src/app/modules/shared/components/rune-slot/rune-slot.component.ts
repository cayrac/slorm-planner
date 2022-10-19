import { Component, HostListener, Input, OnChanges } from '@angular/core';
import { SearchService } from '@shared/services/search.service';
import { takeUntil } from 'rxjs';
import { Rune, RuneType } from 'slormancer-api';

import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';

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
    
    constructor(private searchService: SearchService) {
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
    
}
