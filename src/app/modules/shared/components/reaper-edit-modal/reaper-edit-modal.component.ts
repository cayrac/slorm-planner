import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Reaper } from '../../../slormancer/model/content/reaper';
import { SlormancerReaperService } from '../../../slormancer/services/content/slormancer-reaper.service';

export interface ReaperEditModalData {
    reaper: Reaper;
}

@Component({
  selector: 'app-reaper-edit-modal',
  templateUrl: './reaper-edit-modal.component.html',
  styleUrls: ['./reaper-edit-modal.component.scss']
})
export class ReaperEditModalComponent {

    private readonly originalReaper: Reaper;

    public reaper: Reaper;

    public form: FormGroup;

    constructor(private dialogRef: MatDialogRef<ReaperEditModalComponent>,
                private slormancerReaperService: SlormancerReaperService,
                // private slormancerDataService: SlormancerDataService,
                // private slormancerAffixService: SlormancerAffixService,
                // private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                // private formOptionsService: FormOptionsService,
                @Inject(MAT_DIALOG_DATA) data: ReaperEditModalData
                ) {
        this.originalReaper = data.reaper;

        this.reaper = this.slormancerReaperService.getReaperClone(this.originalReaper);
        this.form = this.buildForm();

        console.log(this.reaper);
        console.log(this.form);
    }
    
    public reset() {
        this.reaper = this.slormancerReaperService.getReaperClone(this.originalReaper);
        this.form = this.buildForm();
    }

    public submit() {
        this.dialogRef.close(this.reaper);
    }

    private updatePreview(form: FormGroup) {
        const reaper = this.reaper;
        if (form.valid) {
            const value = form.value;

            reaper.id = value.id;
            reaper.primordial = value.primordial;
            reaper.baseInfo.level = value.baseLevel;
            reaper.primordialInfo.level = value.primordialLevel;
            reaper.baseInfo.kills = value.baseKills;
            reaper.primordialInfo.kills = value.primordialKills;

            this.slormancerReaperService.updateReaper(reaper);

            if (value.level !== reaper.baseLevel) {
                form.patchValue({ level: reaper.baseLevel }, { emitEvent: false });
            }
        }
    }

    private getReaperMaxLevelValidator(): ValidatorFn {
        return control => Validators.max(this.reaper.maxLevel)(control)
    }

    private buildForm(): FormGroup {      
        const newForm = new FormGroup({
            baseLevel: new FormControl(this.reaper.baseInfo.level, [Validators.required, Validators.min(1), this.getReaperMaxLevelValidator()]),
            baseKills: new FormControl(this.reaper.baseInfo.kills, [Validators.required, Validators.min(1)]),
            primordialLevel: new FormControl(this.reaper.primordialInfo.level, [Validators.required, Validators.min(1), this.getReaperMaxLevelValidator()]),
            primordialKills: new FormControl(this.reaper.primordialInfo.kills, [Validators.required, Validators.min(1)]),
            primordial: new FormControl(this.reaper.primordial, Validators.required),
            reaper: new FormControl(this.reaper.id, Validators.required),
        });

        newForm.valueChanges.subscribe(() => {
            this.updatePreview(newForm);
        });
        this.updatePreview(newForm);

        return newForm;
    }
}
