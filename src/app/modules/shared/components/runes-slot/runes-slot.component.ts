import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Character, RunesCombination, SlormancerCharacterBuilderService } from 'slormancer-api';

import { RunesEditModalComponent, RunesEditModalData } from '../runes-edit-modal/runes-edit-modal.component';

@Component({
  selector: 'app-runes-slot',
  templateUrl: './runes-slot.component.html',
  styleUrls: ['./runes-slot.component.scss']
})
export class RunesSlotComponent {

    @Input()
    public readonly character: Character | null = null;

    @Input()
    public readonly readonly: boolean = false;

    @Output()
    public readonly changed = new EventEmitter<RunesCombination>();
    
    constructor(private dialog: MatDialog,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService) { }

    public edit() {
        if (this.character !== null && !this.readonly) {
            const character = this.slormancerCharacterBuilderService.getCharacterClone(this.character);
            const data: RunesEditModalData = { character };
            this.dialog.open(RunesEditModalComponent, { data })
            .afterClosed().subscribe((runes: RunesCombination | null | undefined) => {
                if (runes) {
                    this.changed.emit(runes);
                }
            });
        }
    }
    
}
