import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    Character,
    DEFAULT_CONFIG,
    MAX_EFFECT_AFFINITY_BASE,
    MAX_REAPER_AFFINITY_BASE,
    Reaper,
    SlormancerCharacterUpdaterService,
    SlormancerReaperService,
    SlormancerRuneService,
} from 'slormancer-api';

import { SelectOption } from '../../model/select-option';
import { BuildStorageService } from '../../services/build-storage.service';
import { FormOptionsService } from '../../services/form-options.service';

export interface ReaperEditModalData {
    character: Character;
    reaper: Reaper;
}

interface ReaperForm {
    baseLevel: FormControl<number | null>;
    baseKills: FormControl<number | null>;
    primordialKills: FormControl<number | null>;
    reaperAffinity: FormControl<number | null>;
    effectAffinity: FormControl<number | null>;
    primordial: FormControl<boolean | null>;
    reaper: FormControl<number | null>;
}

interface ReaperFormData {
    reaper: number;
    primordial: boolean;
    baseLevel: number;
    baseKills: number;
    primordialKills: number;
    reaperAffinity: number;
    effectAffinity: number;
}

@Component({
  selector: 'app-reaper-edit-modal',
  templateUrl: './reaper-edit-modal.component.html',
  styleUrls: ['./reaper-edit-modal.component.scss']
})
export class ReaperEditModalComponent {

    public readonly MAX_REAPER_AFFINITY_BASE = MAX_REAPER_AFFINITY_BASE;

    public readonly MAX_EFFECT_AFFINITY_BASE = MAX_EFFECT_AFFINITY_BASE;

    private readonly originalReaper: Reaper;

    public options: Array<SelectOption<number>> = [];

    private readonly character: Character;

    public reaper: Reaper | null = null;

    public form: FormGroup<ReaperForm> = new FormGroup({
        baseLevel: new FormControl<number | null>(null, [Validators.required, Validators.min(1), this.getReaperMaxLevelValidator()]),
        baseKills: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
        primordialKills: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
        reaperAffinity: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(MAX_REAPER_AFFINITY_BASE)]),
        effectAffinity: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(MAX_EFFECT_AFFINITY_BASE)]),
        primordial: new FormControl<boolean | null>(null, Validators.required),
        reaper: new FormControl<number | null>(null, Validators.required),
    })

    constructor(private dialogRef: MatDialogRef<ReaperEditModalComponent>,
                private slormancerReaperService: SlormancerReaperService,
                private slormancerRuneService: SlormancerRuneService,
                private slormancerCharacterUpdaterService: SlormancerCharacterUpdaterService,
                private formOptionsService: FormOptionsService,
                private buildStorageService: BuildStorageService,
                @Inject(MAT_DIALOG_DATA) data: ReaperEditModalData
                ) {
        this.originalReaper = this.slormancerReaperService.getReaperClone(data.reaper);
        this.character = data.character;
        this.reaper = data.reaper;

        this.form.valueChanges.subscribe(() => {
            this.updatePreview();
        });

        this.form.controls.primordial.valueChanges.subscribe(primordial => {
            this.options = this.formOptionsService.getReaperOptions(this.originalReaper.weaponClass, primordial === true);
        });

        this.reset();
        this.updatePreview();
    }
    
    public reset() {
        if (this.reaper !== null) {
            this.reaper = Object.assign(this.reaper, this.originalReaper);
            this.form.reset({
                baseKills: this.reaper.baseKills,
                baseLevel: this.reaper.baseLevel,
                effectAffinity: this.reaper.baseEffectAffinity,
                reaperAffinity: this.reaper.baseReaperAffinity,
                primordial: this.reaper.primordial,
                primordialKills: this.reaper.primordialKills,
                reaper: this.reaper.id
            });
        }
    }

    public submit() {
        if (this.form.valid) {
            this.dialogRef.close(this.reaper);
        }
    }

    public getReaperControl(): FormControl | null {
        return this.form.get('reaper') as FormControl;
    }

    public useDifferentAffinityForEffects(reaper: Reaper): boolean {
        return this.slormancerReaperService.useDifferentAffinityForEffects(reaper);
    }

    private updatePreview() {
        if (this.form.valid && this.reaper !== null) {

            const value = this.form.getRawValue() as ReaperFormData;

            if (value.reaper === this.reaper.id) {
                this.reaper.id = value.reaper;
                this.reaper.primordial = value.primordial;
                this.reaper.baseLevel = value.baseLevel;
                this.reaper.kills = value.baseKills;
                this.reaper.primordialKills = value.primordialKills;
                this.reaper.baseReaperAffinity = value.reaperAffinity;
                this.reaper.baseEffectAffinity = value.effectAffinity;
            } else {
                const newReaper = this.slormancerReaperService.getReaperById(value.reaper, this.reaper.weaponClass, value.primordial, value.baseLevel, this.reaper.bonusLevel, 'TOREMOVE', value.baseKills, value.primordialKills, value.reaperAffinity, value.effectAffinity, this.reaper.bonusAffinity);
                if (newReaper !== null) {
                    Object.assign(this.reaper, newReaper);
                }
            }

            if (!this.useDifferentAffinityForEffects(this.reaper)) {
                this.form.controls.effectAffinity.setValue(this.form.controls.reaperAffinity.value, { emitEvent: false });
                this.reaper.baseEffectAffinity = this.reaper.baseReaperAffinity;
            }

            const build = this.buildStorageService.getBuild();
            this.slormancerReaperService.updateReaperModel(this.reaper);
            if (this.character.runes.effect !== null) {
                this.slormancerRuneService.updateRuneModel(this.character.runes.effect, this.reaper.id);
            }
            this.slormancerCharacterUpdaterService.updateCharacter(this.character, build !== null ? build.configuration : DEFAULT_CONFIG, false);
            this.slormancerReaperService.updateReaperView(this.reaper);

            if (value.baseLevel !== this.reaper.baseLevel) {
                this.form.patchValue({ baseLevel: this.reaper.baseLevel }, { emitEvent: false });
            }
        }
    }

    private getReaperMaxLevelValidator(): ValidatorFn {
        return control => this.reaper === null ? {} : Validators.max(this.reaper.maxLevel)(control)
    }
}
