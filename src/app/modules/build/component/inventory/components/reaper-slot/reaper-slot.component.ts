import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

import {
    ReaperEditModalComponent,
    ReaperEditModalData,
} from '../../../../../shared/components/reaper-edit-modal/reaper-edit-modal.component';
import { HeroClass } from '../../../../../slormancer/model/content/enum/hero-class';
import { Reaper } from '../../../../../slormancer/model/content/reaper';
import { SlormancerDataService } from '../../../../../slormancer/services/content/slormancer-data.service';
import { SlormancerReaperService } from '../../../../../slormancer/services/content/slormancer-reaper.service';
import { itemMoveService } from '../../services/item-move.service';


@Component({
  selector: 'app-reaper-slot',
  templateUrl: './reaper-slot.component.html',
  styleUrls: ['./reaper-slot.component.scss']
})
export class ReaperSlotComponent implements OnInit {

    @Input()
    public readonly reaper: Reaper | null = null;

    @Input()
    public readonly heroClass: HeroClass = HeroClass.Warrior;

    @Output()
    public readonly changed = new EventEmitter<Reaper>();

    @ViewChild(MatMenuTrigger, { static: true })
    private menu: MatMenuTrigger | null = null; 

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
        this.itemMoveService.releaseHoldItem();
        if (this.menu !== null) {
            this.menu.openMenu();
        }
        return false;
    }
    
    constructor(private dialog: MatDialog,
                private slormancerDataService: SlormancerDataService,
                private slormancerReaperService: SlormancerReaperService,
                private itemMoveService: itemMoveService) { }

    public ngOnInit() { }

    public edit() {
        let reaper = this.reaper;

        if (reaper === null) {
            const reaperId = this.slormancerDataService.getGameDataAvailableReaper()[0];
            
            if (reaperId) {
                reaper = this.slormancerReaperService.getReaper(reaperId.REF, this.heroClass, false, 1, 1, 0, 0, 0);
            }
        }

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
