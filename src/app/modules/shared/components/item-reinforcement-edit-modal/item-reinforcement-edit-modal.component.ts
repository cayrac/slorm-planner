import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_HERO_LEVEL } from '@slorm-api';

export interface ItemReinforcementEditData {
    reinforcement: number;   
}

@Component({
  selector: 'app-item-reinforcement-edit-modal',
  templateUrl: './item-reinforcement-edit-modal.component.html',
  styleUrls: ['./item-reinforcement-edit-modal.component.scss']
})
export class ItemReinforcementEditModalComponent {

    public readonly form: FormGroup;

    public readonly MAX_HERO_LEVEL = MAX_HERO_LEVEL;

    constructor(private dialogRef: MatDialogRef<ItemReinforcementEditModalComponent>,
                @Inject(MAT_DIALOG_DATA) data: ItemReinforcementEditData) {
        
        this.form = new FormGroup({
            reinforcement: new FormControl(data.reinforcement, [Validators.min(0)])
        })
    }

    public submit() {
        this.form.markAllAsTouched();

        if (this.form.valid) {
            this.dialogRef.close(this.form.value.reinforcement);
        }
    }
}
