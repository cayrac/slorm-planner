import { Component, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchService } from '@shared/services/search.service';
import { Character, Reaper, SlormancerCharacterBuilderService } from '@slorm-api';
import { takeUntil } from 'rxjs';

import { ItemMoveService } from '../../services/item-move.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { ReaperEditModalComponent, ReaperEditModalData } from '../reaper-edit-modal/reaper-edit-modal.component';
import { ReaperViewComponent } from '../reaper-view/reaper-view.component';

@Component({
  selector: 'app-reaper-slot',
  templateUrl: './reaper-slot.component.html',
  styleUrls: ['./reaper-slot.component.scss']
})
export class ReaperSlotComponent extends AbstractUnsubscribeComponent implements OnChanges {

    @Input()
    public readonly character: Character | null = null;

    @Input()
    public readonly readonly: boolean = false;

    @ViewChild('reaperView')
    private reaperView: ReaperViewComponent | null = null; 

    @Output()
    public readonly changed = new EventEmitter<Reaper>();

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

    @HostListener('contextmenu')
    public onMouseContextMenu() {
        if (!this.readonly) {
            this.itemMoveService.releaseHoldItem();
        }
        return false;
    }
    
    constructor(private dialog: MatDialog,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private searchService: SearchService,
                private itemMoveService: ItemMoveService) {
        super();
        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.updateSearch());
    }

    public ngOnChanges() {
        this.updateSearch();
    }

    private updateSearch() {
        this.hiddenBySearch = this.character !== null && this.searchService.hasSearch() && !this.searchService.reaperMatchSearch(this.character.reaper)
    }

    public edit() {
        if (this.character !== null && !this.readonly) {
            const character = this.slormancerCharacterBuilderService.getCharacterClone(this.character);
            const data: ReaperEditModalData = { reaper: character.reaper, character };
            this.dialog.open(ReaperEditModalComponent, { data })
            .afterClosed().subscribe((reaper: Reaper | null | undefined) => {
                if (reaper) {
                    this.changed.emit(reaper);
                }
            });
        }
    }

    public handlescroll(event: WheelEvent): boolean {
        if (this.reaperView) {
            this.reaperView.scroll(event);
        }
        return false;
    }
    
}
