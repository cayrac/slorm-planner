import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AncestralLegacy, SlormancerAncestralLegacyService } from '@slorm-api';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { BuildStorageService } from '../../services/build-storage.service';
import { SearchService } from '../../services/search.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { ViewData, ViewModalComponent } from '../view-modal/view-modalcomponent';


@Component({
  selector: 'app-ancestral-legacy-slot',
  templateUrl: './ancestral-legacy-slot.component.html',
  styleUrls: ['./ancestral-legacy-slot.component.scss']
})
export class AncestralLegacySlotComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public readonly ancestralLegacy: AncestralLegacy | null = null;

    @Input()
    public readonly equipped: boolean = false;
    
    @Input()
    public readonly selected: boolean = false;

    @Input()
    public readonly readonly: boolean = false;

    @Input()
    public readonly overlay: boolean = false;
    
    @Output()
    public readonly changed = new EventEmitter<AncestralLegacy>();

    public showOverlay = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }

    public hiddenBySearch: boolean = false;

    constructor(private searchService: SearchService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private buildStorageService: BuildStorageService,
                private dialog: MatDialog) {
        super();
    }

    public ngOnInit() {
        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(search => this.hiddenBySearch = search !== null && this.ancestralLegacy !== null && !this.searchService.ancestralLegacyMatchSearch(this.ancestralLegacy))
    }

    private setRank(ancestralLegacy: AncestralLegacy, newRank: number) {
        if (ancestralLegacy.baseRank !== newRank && this.selected) {
            this.slormancerAncestralLegacyService.updateAncestralLegacyModel(ancestralLegacy, newRank);
            this.slormancerAncestralLegacyService.updateAncestralLegacyView(ancestralLegacy);
            this.buildStorageService.saveLayer();
        }
    }

    public increasesRank(): boolean {
        if (this.ancestralLegacy !== null) {
            this.setRank(this.ancestralLegacy, Math.max(0, this.ancestralLegacy.baseRank + 1));
            this.changed.emit(this.ancestralLegacy);
        }
        return false;
    }
 
    public decreasesRank(): boolean {
        if (this.ancestralLegacy !== null) {
            this.setRank(this.ancestralLegacy, Math.max(0, this.ancestralLegacy.baseRank - 1));
            this.changed.emit(this.ancestralLegacy);
        }
        return false;
    }
    
    public showModalTooltip(event: MouseEvent, ancestralLegacy: AncestralLegacy) {
        let skip = false;

        if (event.ctrlKey) {
            skip = true;
            event.stopPropagation();
            event.stopImmediatePropagation();
            const data: ViewData = { entity: { ancestralLegacy } };
            this.dialog.open(ViewModalComponent, { data });
        }

        return skip;
    }
}
    
