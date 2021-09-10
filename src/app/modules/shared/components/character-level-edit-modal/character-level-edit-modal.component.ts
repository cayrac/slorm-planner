import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MAX_HERO_LEVEL } from '../../../slormancer/constants/common';

export interface CharacterLevelEditData {
    level: number;   
}

@Component({
  selector: 'app-character-level-edit-modal',
  templateUrl: './character-level-edit-modal.component.html',
  styleUrls: ['./character-level-edit-modal.component.scss']
})
export class CharacterLevelEditModalComponent {

    public readonly form: FormGroup;

    public readonly MAX_HERO_LEVEL = MAX_HERO_LEVEL;

    constructor(private dialogRef: MatDialogRef<CharacterLevelEditModalComponent>,
                @Inject(MAT_DIALOG_DATA) data: CharacterLevelEditData) {
        
        this.form = new FormGroup({
            level: new FormControl(data.level, [Validators.min(1), Validators.max(MAX_HERO_LEVEL)])
        })
    }

    public submit() {
        this.form.markAllAsTouched();

        if (this.form.valid) {
            this.dialogRef.close(this.form.value.level);
        }
    }
}
