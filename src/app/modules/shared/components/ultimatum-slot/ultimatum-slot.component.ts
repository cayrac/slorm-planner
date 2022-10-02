import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchService } from '@shared/services/search.service';
import { Ultimatum } from '@slormancer/model/content/ultimatum';
import { takeUntil } from 'rxjs';

import { ItemMoveService } from '../../services/item-move.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { UltimatumEditModalComponent, UltimatumEditModalData } from '../ultimatum-edit-modal/ultimatum-edit-modal.component';

@Component({
  selector: 'app-ultimatum-slot',
  templateUrl: './ultimatum-slot.component.html',
  styleUrls: ['./ultimatum-slot.component.scss']
})
export class UltimatumSlotComponent extends AbstractUnsubscribeComponent implements OnChanges {

    @Input()
    public readonly ultimatum: Ultimatum | null = null;

    @Input()
    public readonly overlay: boolean = true;

    @Input()
    public readonly readonly: boolean = false;

    @Output()
    public readonly changed = new EventEmitter<Ultimatum>();

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
                private itemMoveService: ItemMoveService,
                private searchService: SearchService) {
        super();
        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.updateSearch());
    }

    public ngOnChanges() {
        this.updateSearch();
    }

    private updateSearch() {
        this.hiddenBySearch = this.ultimatum !== null && this.searchService.hasSearch() && !this.searchService.ultimatumMatchSearch(this.ultimatum)
    }

    public edit() {
        if (!this.readonly) {
            const data: UltimatumEditModalData = { ultimatum: this.ultimatum };
            this.dialog.open(UltimatumEditModalComponent, { data })
            .afterClosed().subscribe((ultimatum: Ultimatum | null | undefined) => {
                if (ultimatum) {
                    this.changed.emit(ultimatum);
                }
            });
        }
    }
}
