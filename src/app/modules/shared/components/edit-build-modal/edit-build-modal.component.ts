import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EditBuildModalData {
    title: string,
    name: string | null;   
}

@Component({
    selector: 'app-edit-build-modal',
    templateUrl: './edit-build-modal.component.html',
    styleUrls: ['./edit-build-modal.component.scss']
})
export class EditBuildModalComponent {

    public form: FormGroup;

    public title: string;

    constructor(private dialog: MatDialogRef<EditBuildModalComponent>,
                @Inject(MAT_DIALOG_DATA) data: EditBuildModalData) {
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