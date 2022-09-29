import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Character } from '@slormancer/model/character';
import { Reaper } from '@slormancer/model/content/reaper';
import { SlormancerCharacterBuilderService } from 'src/app/modules/slormancer/services/slormancer-character-builder.service';

import { ReaperEditModalComponent, ReaperEditModalData } from '../reaper-edit-modal/reaper-edit-modal.component';

@Component({
  selector: 'app-runes-slot',
  templateUrl: './runes-slot.component.html',
  styleUrls: ['./runes-slot.component.scss']
})
export class RunesSlotComponent implements OnInit {

    @Input()
    public readonly character: Character | null = null;

    @Input()
    public readonly readonly: boolean = false;

    @Output()
    public readonly changed = new EventEmitter<Reaper>();
    
    constructor(private dialog: MatDialog,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService) { }

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
