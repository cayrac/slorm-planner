import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SlormancerCharacterBuilderService } from 'src/app/modules/slormancer/services/slormancer-character-builder.service';

import { Character } from '../../../slormancer/model/character';
import { Reaper } from '../../../slormancer/model/content/reaper';
import { ItemMoveService } from '../../services/item-move.service';
import { ReaperEditModalComponent, ReaperEditModalData } from '../reaper-edit-modal/reaper-edit-modal.component';

@Component({
  selector: 'app-reaper-slot',
  templateUrl: './reaper-slot.component.html',
  styleUrls: ['./reaper-slot.component.scss']
})
export class ReaperSlotComponent implements OnInit {

    @Input()
    public readonly character: Character | null = null;

    @Input()
    public readonly readonly: boolean = false;

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

    @HostListener('contextmenu')
    public onMouseContextMenu() {
        if (!this.readonly) {
            this.itemMoveService.releaseHoldItem();
        }
        return false;
    }
    
    constructor(private dialog: MatDialog,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private itemMoveService: ItemMoveService) { }

    public ngOnInit() { }

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
    
}
