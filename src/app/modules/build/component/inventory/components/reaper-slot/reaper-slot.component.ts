import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
    ReaperEditModalComponent,
    ReaperEditModalData,
} from '../../../../../shared/components/reaper-edit-modal/reaper-edit-modal.component';
import { Reaper } from '../../../../../slormancer/model/content/reaper';


@Component({
  selector: 'app-reaper-slot',
  templateUrl: './reaper-slot.component.html',
  styleUrls: ['./reaper-slot.component.scss']
})
export class ReaperSlotComponent implements OnInit {

    @Input()
    public readonly reaper: Reaper | null = null;

    @Output()
    public readonly changed = new EventEmitter<Reaper>();

    public showOverlay = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }
    
    constructor(private dialog: MatDialog) { }

    public ngOnInit() { this.edit() }

    public edit() {
        const reaper = this.reaper;
        if (reaper !== null) {
            const data: ReaperEditModalData = { reaper };
            this.dialog.open(ReaperEditModalComponent, { data })
            .afterClosed().subscribe((reaper: Reaper | undefined) => {
                if (reaper) {
                    this.changed.emit(reaper);
                }
            });
        }
    }
    
}
