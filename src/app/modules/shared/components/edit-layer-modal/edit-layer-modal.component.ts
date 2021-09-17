import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EditLayerModalData {
    title: string,
    name: string | null;   
}

@Component({
    selector: 'app-edit-layer-modal',
    templateUrl: './edit-layer-modal.component.html',
    styleUrls: ['./edit-layer-modal.component.scss']
})
export class EditLayerModalComponent {

    public form: FormGroup;

    public title: string;

    constructor(private dialog: MatDialogRef<EditLayerModalComponent>,
                @Inject(MAT_DIALOG_DATA) data: EditLayerModalData) {
        this.title = data.title;
        this.form = new FormGroup({
            name: new FormControl(data.name, Validators.required)
        });
    }

    public submit() {
        this.form.markAllAsTouched();

        if (this.form.valid) {
            const name = this.form.value.name;
            this.dialog.close(name);
        }
    }
}