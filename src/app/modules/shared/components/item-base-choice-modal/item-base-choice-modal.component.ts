import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EQUIPABLE_ITEM_BASE_VALUES, EquipableItemBase } from '@slorm-api';

@Component({
  selector: 'app-item-base-choice-modal',
  templateUrl: './item-base-choice-modal.component.html',
  styleUrls: ['./item-base-choice-modal.component.scss']
})
export class ItemBaseChoiceModalComponent {

    public readonly EQUIPABLE_ITEM_BASE_VALUES = EQUIPABLE_ITEM_BASE_VALUES;

    constructor(private dialogRef: MatDialogRef<ItemBaseChoiceModalComponent>) {
    }
    
    public selectBase(base: EquipableItemBase) {
        this.dialogRef.close(base);
    }
}
