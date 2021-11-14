import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ULTIMATUM_MAX_LEVEL } from '../../../slormancer/constants/common';
import { UltimatumType } from '../../../slormancer/model/content/enum/ultimatum-type';
import { Ultimatum } from '../../../slormancer/model/content/ultimatum';
import { SlormancerUltimatumService } from '../../../slormancer/services/content/slormancer-ultimatum.service';
import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';

export interface UltimatumEditModalData {
    ultimatum: Ultimatum | null;
}

@Component({
  selector: 'app-ultimatum-edit-modal',
  templateUrl: './ultimatum-edit-modal.component.html',
  styleUrls: ['./ultimatum-edit-modal.component.scss']
})
export class UltimatumEditModalComponent {

    private readonly originalUltimatum: Ultimatum;

    public readonly ULTIMATUM_MAX_LEVEL = ULTIMATUM_MAX_LEVEL;

    public readonly options: Array<SelectOption<number>> = [];

    public ultimatum: Ultimatum;

    public form!: FormGroup;

    constructor(private dialogRef: MatDialogRef<UltimatumEditModalComponent>,
                private slormancerUltimatumService: SlormancerUltimatumService,
                private formOptionsService: FormOptionsService,
                @Inject(MAT_DIALOG_DATA) data: UltimatumEditModalData
                ) {
        this.originalUltimatum = data.ultimatum === null
            ? this.slormancerUltimatumService.getUltimatum(UltimatumType.AdamantAbundance, 1)
            : this.slormancerUltimatumService.getUltimatumClone(data.ultimatum);
        this.ultimatum = this.originalUltimatum;
        this.options = this.formOptionsService.getUltimatumOptions();
        this.reset();
    }
    
    public reset() {
        Object.assign(this.ultimatum, this.originalUltimatum);
        this.form = this.buildForm();
    }

    public submit() {
        if (this.form.valid) {
            this.dialogRef.close(this.ultimatum);
        }
    }

    private updatePreview(form: FormGroup) {
        if (form.valid) {
            const value = form.value;
            this.ultimatum = this.slormancerUltimatumService.getUltimatum(value.type, value.level);
        }
    }

    private buildForm(): FormGroup {      
        const newForm = new FormGroup({
            level: new FormControl(this.ultimatum.level, [Validators.required, Validators.min(1), Validators.max(ULTIMATUM_MAX_LEVEL)]),
            type: new FormControl(this.ultimatum.type, [Validators.required]),
        });
        
        newForm.valueChanges.subscribe(() => {
            this.updatePreview(newForm);
        });
        this.updatePreview(newForm);

        return newForm;
    }
}
