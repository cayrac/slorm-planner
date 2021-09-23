import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Character } from '../../../slormancer/model/character';
import { Reaper } from '../../../slormancer/model/content/reaper';
import { SlormancerReaperService } from '../../../slormancer/services/content/slormancer-reaper.service';
import { SlormancerCharacterService } from '../../../slormancer/services/slormancer-character.service';
import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';

export interface ReaperEditModalData {
    character: Character;
    reaper: Reaper;
}

@Component({
  selector: 'app-reaper-edit-modal',
  templateUrl: './reaper-edit-modal.component.html',
  styleUrls: ['./reaper-edit-modal.component.scss']
})
export class ReaperEditModalComponent {

    private readonly originalReaper: Reaper;

    public options: Array<SelectOption<number>> = [];

    private readonly character: Character;

    public reaper: Reaper;

    public form: FormGroup;

    constructor(private dialogRef: MatDialogRef<ReaperEditModalComponent>,
                private slormancerReaperService: SlormancerReaperService,
                private slormancerCharacterService: SlormancerCharacterService,
                private formOptionsService: FormOptionsService,
                @Inject(MAT_DIALOG_DATA) data: ReaperEditModalData
                ) {
        this.originalReaper = data.reaper;
        this.character = data.character;

        this.reaper = this.slormancerReaperService.getReaperClone(this.originalReaper);
        this.form = this.buildForm();

        console.log(this.reaper);
    }
    
    public reset() {
        this.reaper = this.slormancerReaperService.getReaperClone(this.originalReaper);
        this.form = this.buildForm();
    }

    public submit() {
        if (this.form.valid) {
            this.dialogRef.close(this.reaper);
        }
    }

    private updatePreview(form: FormGroup) {
        if (form.valid) {
            const value = form.value;

            if (value.reaper === this.reaper.id) {
                this.reaper.id = value.reaper;
                this.reaper.primordial = value.primordial;
                this.reaper.baseInfo.level = value.baseLevel;
                this.reaper.primordialInfo.level = value.primordialLevel;
                this.reaper.baseInfo.kills = value.baseKills;
                this.reaper.primordialInfo.kills = value.primordialKills;
    
            } else {
                const newReaper = this.slormancerReaperService.getReaper(value.reaper, this.reaper.weaponClass, value.primordial, value.baseLevel, value.primordialLevel, value.baseKills, value.primordialKills, this.reaper.bonusLevel);
                if (newReaper !== null) {
                    this.reaper = newReaper;
                }
            }

            this.slormancerReaperService.updateReaper(this.reaper);
            this.slormancerCharacterService.applyReaperBonuses(this.character, this.reaper);
            
            this.options = this.formOptionsService.getReaperOptions(this.reaper.weaponClass, this.reaper.primordial);

            if (value.baseLevel !== this.reaper.baseInfo.level) {
                form.patchValue({ baseLevel: this.reaper.baseInfo.level }, { emitEvent: false });
            }
            if (value.primordialLevel !== this.reaper.primordialInfo.level) {
                form.patchValue({ primordialLevel: this.reaper.primordialInfo.level }, { emitEvent: false });
            }
        }
    }

    private getReaperMaxLevelValidator(): ValidatorFn {
        return control => Validators.max(this.reaper.maxLevel)(control)
    }

    private buildForm(): FormGroup {      
        const newForm = new FormGroup({
            baseLevel: new FormControl(this.reaper.baseInfo.level, [Validators.required, Validators.min(1), this.getReaperMaxLevelValidator()]),
            baseKills: new FormControl(this.reaper.baseInfo.kills, [Validators.required, Validators.min(0)]),
            primordialLevel: new FormControl(this.reaper.primordialInfo.level, [Validators.required, Validators.min(1), this.getReaperMaxLevelValidator()]),
            primordialKills: new FormControl(this.reaper.primordialInfo.kills, [Validators.required, Validators.min(0)]),
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
