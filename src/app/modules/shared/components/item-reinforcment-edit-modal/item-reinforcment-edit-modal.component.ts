import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MAX_HERO_LEVEL } from '../../../slormancer/constants/common';

export interface ItemReinforcmentEditData {
    reinforcment: number;   
}

@Component({
  selector: 'app-item-reinforcment-edit-modal',
  templateUrl: './item-reinforcment-edit-modal.component.html',
  styleUrls: ['./item-reinforcment-edit-modal.component.scss']
})
export class ItemReinforcmentEditModalComponent {

    public readonly form: FormGroup;

    public readonly MAX_HERO_LEVEL = MAX_HERO_LEVEL;

    constructor(private dialogRef: MatDialogRef<ItemReinforcmentEditModalComponent>,
                @Inject(MAT_DIALOG_DATA) data: ItemReinforcmentEditData) {
        
        this.form = new FormGroup({
            reinforcment: new FormControl(data.reinforcment, [Validators.min(0)])
        })
    }

    public submit() {
        this.form.markAllAsTouched();

        if (this.form.valid) {
            this.dialogRef.close(this.form.value.reinforcment);
        }
    }
}
