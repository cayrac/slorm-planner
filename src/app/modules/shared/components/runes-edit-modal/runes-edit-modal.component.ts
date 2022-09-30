import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_REAPER_AFFINITY_BASE } from '@slormancer/constants/common';
import { DEFAULT_CONFIG } from '@slormancer/constants/content/data/default-configs';
import { Character } from '@slormancer/model/character';
import { Rune } from '@slormancer/model/content/rune';
import { RuneType } from '@slormancer/model/content/rune-type';
import { RunesCombination } from '@slormancer/model/runes-combination';
import { SlormancerRuneService } from '@slormancer/services/content/slormancer-rune.service';
import { SlormancerCharacterUpdaterService } from '@slormancer/services/slormancer-character.updater.service';
import { valueOrNull } from '@slormancer/util/utils';

import { BuildStorageService } from '../../services/build-storage.service';

export interface RunesEditModalData {
    character: Character;
}

@Component({
  selector: 'app-runes-edit-modal',
  templateUrl: './runes-edit-modal.component.html',
  styleUrls: ['./runes-edit-modal.component.scss']
})
export class RunesEditModalComponent {

    public readonly MAX_REAPER_AFFINITY_BASE = MAX_REAPER_AFFINITY_BASE;

    private readonly originalRunes: RunesCombination;

    public readonly character: Character;

    public readonly runes: Array<Rune>;

    public form: FormGroup = new FormGroup({
        activationId: new FormControl(null),
        activationLevel: new FormControl(1, [ Validators.required, Validators.min(1), Validators.max(15)]),
        effectId: new FormControl(null),
        effectLevel: new FormControl(1, [ Validators.required, Validators.min(1), Validators.max(15)]),
        enhancementId: new FormControl(null),
        enhancementLevel: new FormControl(1, [ Validators.required, Validators.min(1), Validators.max(15)]),
    });

    constructor(private dialogRef: MatDialogRef<RunesEditModalData>,
                private slormancerRuneService: SlormancerRuneService,
                private slormancerCharacterUpdaterService: SlormancerCharacterUpdaterService,
                private buildStorageService: BuildStorageService,
                @Inject(MAT_DIALOG_DATA) data: RunesEditModalData
                ) {
        this.originalRunes = this.slormancerRuneService.getRunesCombinationClone(data.character.runes);
        this.character = data.character;
        this.runes = this.slormancerRuneService.getRunes(this.character.heroClass, 1, this.character.reaper.id);

        this.form.valueChanges.subscribe(() => {
            this.updatePreview();
        });

        this.reset();
    }
    
    public reset() {
        this.character.runes = {
            ...this.originalRunes
        }
        this.form.reset({
            activationId: this.character.runes.activation === null ? null : this.character.runes.activation.id,
            activationLevel: this.character.runes.activation === null ? 1 : this.character.runes.activation.level,
            effectId: this.character.runes.effect === null ? null : this.character.runes.effect.id,
            effectLevel: this.character.runes.effect === null ? 1 : this.character.runes.effect.level,
            enhancementId: this.character.runes.enhancement === null ? null : this.character.runes.enhancement.id,
            enhancementLevel: this.character.runes.enhancement === null ? 1 : this.character.runes.enhancement.level,
        });
    }

    public submit() {
        if (this.form.valid) {
            this.dialogRef.close(this.character.runes);
        }
    }

    public getRune(index: number): Rune | null {
        return valueOrNull(this.runes[index]);
    }

    public selectRune(rune: Rune | null) {
        if (rune !== null) {
            if (rune.type === RuneType.Activation) {
                const activationId = this.form.value.activationId === rune.id ? null : rune.id;
                this.form.patchValue({ activationId })
            } else if (rune.type === RuneType.Effect) {
                const effectId = this.form.value.effectId === rune.id ? null : rune.id;
                this.form.patchValue({ effectId })
            } else if (rune.type === RuneType.Enhancement) {
                const enhancementId = this.form.value.enhancementId === rune.id ? null : rune.id;
                this.form.patchValue({ enhancementId })
            }
        }
    }

    private updatePreview() {
        if (this.form.valid) {
            const value: {
                activationId: number | null,
                activationLevel: number,
                effectId: number | null,
                effectLevel: number,
                enhancementId: number | null,
                enhancementLevel: number
            } = this.form.value;
    
            this.character.runes = {
                activation: null,
                effect: null,
                enhancement: null,
            };
    
            if (value.activationId !== null) {
                this.character.runes.activation = this.slormancerRuneService.getRuneById(value.activationId, this.character.heroClass, value.activationLevel, this.character.reaper.id);
            } else {
                this.character.runes.activation = null;
            }
            if (value.effectId !== null) {
                this.character.runes.effect = this.slormancerRuneService.getRuneById(value.effectId, this.character.heroClass, value.effectLevel, this.character.reaper.id);
            } else {
                this.character.runes.effect = null;
            }
            if (value.enhancementId !== null) {
                this.character.runes.enhancement = this.slormancerRuneService.getRuneById(value.enhancementId, this.character.heroClass, value.enhancementLevel, this.character.reaper.id);
            } else {
                this.character.runes.enhancement = null;
            }

            for (const rune of this.runes) {
                if (rune.type === RuneType.Activation) {
                    rune.level = value.activationLevel;
                }
                if (rune.type === RuneType.Effect) {
                    rune.level = value.effectLevel;
                }
                if (rune.type === RuneType.Enhancement) {
                    rune.level = value.enhancementLevel;
                }
                this.slormancerRuneService.updateRuneModel(rune, this.character.reaper.id);
            }
    
            const build = this.buildStorageService.getBuild();
            this.slormancerRuneService.updateRunesModel(this.character.runes, this.character.reaper.id);
            this.slormancerCharacterUpdaterService.updateCharacter(this.character, build !== null ? build.configuration : DEFAULT_CONFIG, false, null, this.runes);
            this.slormancerRuneService.updateRunesView(this.character.runes);
    
            for (const rune of this.runes) {
                this.slormancerRuneService.updateRuneView(rune);
            }

        }
    }
}
