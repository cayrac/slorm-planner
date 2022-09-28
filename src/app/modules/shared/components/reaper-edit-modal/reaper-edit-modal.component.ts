import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_REAPER_AFFINITY_BASE } from '@slormancer/constants/common';
import { DEFAULT_CONFIG } from '@slormancer/constants/content/data/default-configs';
import { Character } from '@slormancer/model/character';
import { Reaper } from '@slormancer/model/content/reaper';
import { SlormancerReaperService } from '@slormancer/services/content/slormancer-reaper.service';
import { SlormancerCharacterUpdaterService } from '@slormancer/services/slormancer-character.updater.service';

import { SelectOption } from '../../model/select-option';
import { BuildStorageService } from '../../services/build-storage.service';
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

    public readonly MAX_REAPER_AFFINITY_BASE = MAX_REAPER_AFFINITY_BASE;

    private readonly originalReaper: Reaper;

    public options: Array<SelectOption<number>> = [];

    private readonly character: Character;

    public reaper: Reaper;

    public form!: FormGroup;

    constructor(private dialogRef: MatDialogRef<ReaperEditModalComponent>,
                private slormancerReaperService: SlormancerReaperService,
                private slormancerCharacterUpdaterService: SlormancerCharacterUpdaterService,
                private formOptionsService: FormOptionsService,
                private buildStorageService: BuildStorageService,
                @Inject(MAT_DIALOG_DATA) data: ReaperEditModalData
                ) {
        this.originalReaper = this.slormancerReaperService.getReaperClone(data.reaper);
        this.character = data.character;
        this.reaper = data.reaper;
        this.reset();
    }
    
    public reset() {
        this.reaper =
        Object.assign(this.reaper, this.originalReaper);
        this.form = this.buildForm();
    }

    public submit() {
        if (this.form.valid) {
            this.dialogRef.close(this.reaper);
        }
    }

    public getReaperControl(): FormControl | null {
        return this.form.get('reaper') as FormControl;
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
                this.reaper.baseAffinity = value.affinity;
            } else {
                const newReaper = this.slormancerReaperService.getReaperById(value.reaper, this.reaper.weaponClass, value.primordial, value.baseLevel, value.primordialLevel, value.baseKills, value.primordialKills, this.reaper.baseAffinity, this.reaper.bonusAffinity);
                if (newReaper !== null) {
                    Object.assign(this.reaper, newReaper);
                }
            }

            const build = this.buildStorageService.getBuild();
            this.slormancerReaperService.updateReaperModel(this.reaper);
            this.slormancerCharacterUpdaterService.updateCharacter(this.character, build !== null ? build.configuration : DEFAULT_CONFIG, false);
            this.slormancerReaperService.updateReaperView(this.reaper);
            
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
            affinity: new FormControl(this.reaper.baseAffinity, [Validators.required, Validators.min(0), Validators.max(MAX_REAPER_AFFINITY_BASE)]),
            reaper: new FormControl(this.reaper.id, Validators.required),
        });
        
        newForm.valueChanges.subscribe(() => {
            this.updatePreview(newForm);
        });
        this.updatePreview(newForm);

        return newForm;
    }
}
