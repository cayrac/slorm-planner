import { Component, Inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    Affix,
    Attribute,
    Character,
    DEFAULT_CONFIG,
    EquipableItem,
    MAX_DEFENSIVE_STATS,
    MAX_EPIC_STATS,
    MAX_ITEM_LEVEL,
    MAX_MAGIC_STATS,
    MAX_RARE_STATS,
    Rarity,
    ReaperSmith,
    SlormancerAffixService,
    SlormancerCharacterUpdaterService,
    SlormancerItemService,
    SlormancerLegendaryEffectService,
    SlormancerTranslateService,
    compareString,
    isNotNullOrUndefined,
    valueOrNull,
} from 'slormancer-api';

import { BuildStorageService } from '../../services/build-storage.service';
import { FormOptionsService } from '../../services/form-options.service';

export interface ItemEditModalData {
    character: Character,
    item: EquipableItem;
    maxLevel: number;
}

export interface ItemAffixFormGroup {
    purity: FormControl<number>;
    value: FormControl<number>;
    stat: FormControl<string>;
    rarity: FormControl<Rarity>;
    pure: FormControl<boolean>;
}

export interface ItemAffixFormData {
    purity: number;
    value: number;
    stat: string;
    rarity: Rarity;
    pure: boolean;
}

export interface ItemLegendaryEffectFormGroup {
    id: FormControl<number | null>;
    value: FormControl<number>;
}

export interface ItemLegendaryEffectFormData {
    id: number | null;
    value: number;
}

export interface ItemReaperFormGroup {
    smith: FormControl<ReaperSmith | null>;
    value: FormControl<number>;
}

export interface ItemReaperFormData {
    smith: ReaperSmith | null;
    value: number;
}

export interface ItemAttributeFormGroup {
    attribute: FormControl<Attribute | null>;
    value: FormControl<number>;
}

export interface ItemAttributeFormData {
    attribute: Attribute | null;
    value: number;
}

export interface ItemSkillFormGroup {
    skill: FormControl<number | null>;
    value: FormControl<number>;
}

export interface ItemSkillFormData {
    skill: number | null;
    value: number;
}

export interface ItemFormGroup {
    level: FormControl<number>,
    reinforcment: FormControl<number>,
    affixes: FormArray<FormGroup<ItemAffixFormGroup>>;
    legendary: FormGroup<ItemLegendaryEffectFormGroup>;
    reaper: FormGroup<ItemReaperFormGroup>;
    attribute: FormGroup<ItemAttributeFormGroup>;
    skill: FormGroup<ItemSkillFormGroup>;
}

export interface ItemFormData {
    level: number,
    reinforcment: number,
    affixes: ItemAffixFormData[];
    legendary: ItemLegendaryEffectFormData;
    reaper: ItemReaperFormData;
    attribute: ItemAttributeFormData;
    skill: ItemSkillFormData;
}

@Component({
  selector: 'app-item-edit-modal',
  templateUrl: './item-edit-modal.component.html',
  styleUrls: ['./item-edit-modal.component.scss']
})
export class ItemEditModalComponent {

    public readonly MAX_ITEM_LEVEL = MAX_ITEM_LEVEL;

    private readonly originalItem: EquipableItem;

    public readonly maxLevel: number;

    private maxBasicStats: number = 0;

    public alreadyUsedStats: Array<string> = [];

    private character: Character;

    public item!: EquipableItem;

    public form: FormGroup<ItemFormGroup> = new FormGroup({
        level: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(this.MAX_ITEM_LEVEL), Validators.pattern(/^[0-9]+$/)] }),
        reinforcment: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)] }),
        affixes: new FormArray<FormGroup<ItemAffixFormGroup>>([]),
        legendary: new FormGroup({
            id: new FormControl<number | null>(null),
            value: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)] })
        }),
        reaper: new FormGroup({
            smith: new FormControl<number | null>(null),
            value: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)] })
        }),
        attribute: new FormGroup({
            attribute: new FormControl<number | null>(null),
            value: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)] })
        }),
        skill: new FormGroup({
            skill: new FormControl<number | null>(null),
            value: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)] })
        }),
    });

    constructor(private dialogRef: MatDialogRef<ItemEditModalComponent>,
                private slormancerCharacterUpdaterService: SlormancerCharacterUpdaterService,
                private slormancerItemService: SlormancerItemService,
                private slormancerAffixService: SlormancerAffixService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerTranslationService: SlormancerTranslateService,
                private formOptionsService: FormOptionsService,
                private buildStorageService: BuildStorageService,
                @Inject(MAT_DIALOG_DATA) data: ItemEditModalData
                ) {
        this.originalItem = data.item;
        this.maxLevel = data.maxLevel;

        this.form.valueChanges.subscribe(() => {
            this.updatePreview();
            this.alreadyUsedStats = this.form.controls.affixes.getRawValue().map(affix => affix.stat);
        });

        this.form.controls.affixes.valueChanges.subscribe(() => {
            this.sortAffixes();
        });

        this.character = data.character;
        this.reset();
    }

    public reset() {
        this.item = this.slormancerItemService.getEquipableItemClone(this.originalItem);

        this.form.controls.affixes.clear({ emitEvent: false });
        for (const _ of this.item.affixes) {
            this.form.controls.affixes.push(this.getAffixForm(), { emitEvent: false });
        }

        this.form.reset({
            level: this.item.level,
            reinforcment: this.item.reinforcment,
            affixes: this.item.affixes.map(affix => ({
                pure: affix.isPure,
                purity: affix.pure,
                rarity: affix.rarity,
                stat: affix.craftedEffect.effect.stat,
                value: affix.craftedEffect.craftedValue
            })),
            legendary: {
                id: this.item.legendaryEffect === null ? null : this.item.legendaryEffect.id,
                value: this.item.legendaryEffect === null ? 0 : this.item.legendaryEffect.value,
            },
            attribute: {
                attribute: this.item.attributeEnchantment === null ? null : this.item.attributeEnchantment.craftedAttribute,
                value: this.item.attributeEnchantment === null ? 0 : this.item.attributeEnchantment.craftedValue
            },
            reaper: {
                smith: this.item.reaperEnchantment === null ? null : this.item.reaperEnchantment.craftedReaperSmith,
                value: this.item.reaperEnchantment === null ? 0 : this.item.reaperEnchantment.craftedValue
            },
            skill: {
                skill: this.item.skillEnchantment === null ? null : this.item.skillEnchantment.craftedSkill,
                value: this.item.skillEnchantment === null ? 0 : this.item.skillEnchantment.craftedValue
            }
        });

        this.sortAffixes();
        this.updatePreview();
    }

    public submit() {
        if (this.form.valid) {
            this.dialogRef.close(this.item);
        }
    }

    private updatePreview() {
        const item = this.item;
        if (this.form.valid) {
            const value = this.form.getRawValue();
            item.level = value.level;
            item.reinforcment = value.reinforcment;

            item.affixes = value.affixes
                .map(affix =>  this.slormancerAffixService.getAffixFromStat(affix.stat, item.level, item.reinforcment, affix.rarity, affix.value, affix.pure ? affix.purity : 0))
                .filter(isNotNullOrUndefined);
            
            item.legendaryEffect = value.legendary.id === null ? null
                : this.slormancerLegendaryEffectService.getLegendaryEffectById(value.legendary.id, value.legendary.value, item.reinforcment, item.heroClass);

            item.reaperEnchantment = value.reaper.smith === null ? null
                : this.slormancerItemService.getReaperEnchantment(value.reaper.smith, value.reaper.value);
            
            item.skillEnchantment = value.skill.skill === null ? null
                : this.slormancerItemService.getSkillEnchantment(value.skill.skill, value.skill.value);
            
            item.attributeEnchantment = value.attribute.attribute === null ? null
                : this.slormancerItemService.getAttributeEnchantment(value.attribute.attribute, value.attribute.value);
            
            this.slormancerItemService.updateEquipableItemModel(item);
            
            const build = this.buildStorageService.getBuild();
            this.slormancerCharacterUpdaterService.updateCharacter(this.character, build !== null ? build.configuration : DEFAULT_CONFIG, false, item);

            this.slormancerItemService.updateEquipableItemView(item);
        }
    }

    private sortAffixes() {
        this.form.controls.affixes.controls
            .sort((a, b) => compareString(this.slormancerTranslationService.translate(a.controls.stat.value), this.slormancerTranslationService.translate(b.controls.stat.value)))
    }

    private getAffixForm(): FormGroup<ItemAffixFormGroup> {
        return new FormGroup({
            pure: new FormControl<boolean>(false, { nonNullable: true, validators: Validators.required }),
            purity: new FormControl<number>(0, { nonNullable: true, validators: Validators.required }),
            rarity: new FormControl<Rarity>(Rarity.Normal, { nonNullable: true, validators: Validators.required }),
            stat: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
            value: new FormControl<number>(0, { nonNullable: true, validators: Validators.required })
        })
    }

    private affixToForm(affix: Affix): FormGroup<ItemAffixFormGroup> {
        const form = this.getAffixForm();
        form.reset({
            pure: affix.isPure,
            purity: affix.pure,
            rarity: affix.rarity,
            stat: affix.craftedEffect.effect.stat,
            value: affix.craftedEffect.craftedValue
        })
        return form;
    }

    public hasBasicStats(): boolean {
        return this.form.controls.affixes.controls.filter(control => this.isBasicStat(control)).length > 0
    }

    public hasMaximumBasicStats(): boolean {
        return this.form.controls.affixes.controls.filter(control => this.isBasicStat(control)).length >= this.maxBasicStats;
    }

    public hasDefensiveStats(): boolean {
        return this.form.controls.affixes.controls.filter(control => this.isDefensiveStat(control)).length > 0
    }

    public hasMaximumDefensiveStats(): boolean {
        return this.form.controls.affixes.controls.filter(control => this.isDefensiveStat(control)).length >= MAX_DEFENSIVE_STATS;
    }

    public hasMagicStats(): boolean {
        return this.form.controls.affixes.controls.filter(control => this.isMagicStat(control)).length > 0
    }

    public hasMaximumMagicStats(): boolean {
        return this.form.controls.affixes.controls.filter(control => this.isMagicStat(control)).length >= MAX_MAGIC_STATS;
    }

    public isBasicStat(control: FormGroup<ItemAffixFormGroup>): boolean {
        return control.controls.rarity.value === Rarity.Normal;
    }

    public isDefensiveStat(control: FormGroup<ItemAffixFormGroup>): boolean {
        return control.controls.rarity.value === Rarity.Defensive;
    }

    public isMagicStat(control: FormGroup<ItemAffixFormGroup>): boolean {
        return control.controls.rarity.value === Rarity.Magic;
    }

    public isRareStat(control: FormGroup<ItemAffixFormGroup>): boolean {
        return control.controls.rarity.value === Rarity.Rare;
    }

    public isEpicStat(control: FormGroup<ItemAffixFormGroup>): boolean {
        return control.controls.rarity.value === Rarity.Epic;
    }

    public hasRareStats(): boolean {
        return this.form.controls.affixes.controls.filter(control => this.isRareStat(control)).length > 0
    }

    public hasMaximumRareStats(): boolean {
        return this.form.controls.affixes.controls.filter(control => this.isRareStat(control)).length >= MAX_RARE_STATS;
    }

    public hasEpicStats(): boolean {
        return this.form.controls.affixes.controls.filter(control => this.isEpicStat(control)).length > 0
    }

    public hasMaximumEpicStats(): boolean {
        return this.form.controls.affixes.controls.filter(control => this.isEpicStat(control)).length >= MAX_EPIC_STATS;
    }

    public getAffix(index: number): Affix | null {
        return this.item === null ? null : valueOrNull(this.item.affixes[index]);
    }

    public removeAffix(affix: FormGroup<ItemAffixFormGroup>) {
        this.form.controls.affixes.removeAt(this.form.controls.affixes.controls.indexOf(affix));
        this.updatePreview();
    }

    private addAffix(rarity: Rarity) {
        const possibleStats = this.formOptionsService.getStatsOptions(this.item.base, rarity)
            .filter(option => this.alreadyUsedStats.indexOf(option.value) === -1);

        const stat = possibleStats[0];
        if (stat) {
            const affix = this.slormancerAffixService.getAffixFromStat(stat.value, this.item.level, this.item.reinforcment, rarity, 1000);

            if (affix !== null) {
                this.form.controls.affixes.push(this.affixToForm(affix))
                this.updatePreview();
            }
        }
    }

    public addBasicAffix() {
        this.addAffix(Rarity.Normal);
    }

    public addMagicAffix() {
        this.addAffix(Rarity.Magic);
    }

    public addRareAffix() {
        this.addAffix(Rarity.Rare);
    }

    public addEpicAffix() {
        this.addAffix(Rarity.Epic);
    }
}
