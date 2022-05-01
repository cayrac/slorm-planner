import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Ultimatum } from '@slormancer/model/content/ultimatum';

import { ItemMoveService } from '../../services/item-move.service';
import { UltimatumEditModalComponent, UltimatumEditModalData } from '../ultimatum-edit-modal/ultimatum-edit-modal.component';

@Component({
  selector: 'app-ultimatum-slot',
  templateUrl: './ultimatum-slot.component.html',
  styleUrls: ['./ultimatum-slot.component.scss']
})
export class UltimatumSlotComponent {

    @Input()
    public readonly ultimatum: Ultimatum | null = null;

    @Input()
    public readonly overlay: boolean = true;

    @Input()
    public readonly readonly: boolean = false;

    @Output()
    public readonly changed = new EventEmitter<Ultimatum>();

    public showOverlay = false;

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
                private itemMoveService: ItemMoveService) { }

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
