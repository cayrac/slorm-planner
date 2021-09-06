import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MAX_BASIC_STATS, MAX_ITEM_LEVEL } from '../../../slormancer/constants/common';
import { Affix } from '../../../slormancer/model/content/affix';
import { Rarity } from '../../../slormancer/model/content/enum/rarity';
import { EquipableItem } from '../../../slormancer/model/content/equipable-item';
import { LegendaryEffect } from '../../../slormancer/model/content/legendary-effect';
import { SlormancerItemService } from '../../../slormancer/services/content/slormancer-item.service';
import { valueOrDefault } from '../../../slormancer/util/utils';

export interface ItemEditModalData {
    item: EquipableItem;
    baseLocked: boolean;
    maxLevel: number;
}

interface SelectOption<T> {
    label: string;
    value: T;
    disabled: boolean;
}

@Component({
  selector: 'app-item-edit-modal',
  templateUrl: './item-edit-modal.component.html',
  styleUrls: ['./item-edit-modal.component.scss']
})
export class ItemEditModalComponent {

    public readonly MAX_ITEM_LEVEL = MAX_ITEM_LEVEL;

    public readonly originalItem: EquipableItem;

    public readonly baseLocked: boolean;

    public readonly maxLevel: number;

    private statOptions: { [key: number]: Array<SelectOption<string>> } = {};

    private craftOptions: { [key: number]: Array<SelectOption<number>> } = {};

    public item: EquipableItem;

    public form: FormGroup;

    constructor(public dialogRef: MatDialogRef<ItemEditModalComponent>,
                private slormancerItemService: SlormancerItemService,
                @Inject(MAT_DIALOG_DATA) public data: ItemEditModalData
                ) {
        this.originalItem = data.item;
        this.baseLocked = data.baseLocked;
        this.maxLevel = data.maxLevel;

        this.item = this.slormancerItemService.getEquipableItemClone(this.originalItem);
        this.form = this.itemToForm(this.item);
    }

    public reset() {
        this.item = this.slormancerItemService.getEquipableItemClone(this.originalItem);
        this.form = this.itemToForm(this.item);
    }

    public submit() {
        this.dialogRef.close(this.item);
    }

    private updatePreview() {
        if (this.form.valid) {
            const value = this.form.value;
            this.item.level = value.level;
            this.item.reinforcment = value.reinforcment;

            this.slormancerItemService.updateEquippableItem(this.item);
        }
    }

    private buildOptions(item: EquipableItem) {
        this.craftOptions = {};
        this.statOptions = {};
        item.affixes.forEach((value, index) => {
            this.craftOptions[index] = Object.entries(value.craftedEffect.possibleCraftedValues)
                .map(([key, value]) => ({ value: parseInt(key), label: value.toString(), disabled: false }));
        });
    }

    private affixToForm(affix: Affix): FormGroup {
        return new FormGroup({
            rarity: new FormControl(affix.rarity),
            pure: new FormControl(affix.isPure),
            value: new FormControl(affix.craftedEffect.craftedValue),
            purity: new FormControl(affix.pure),
            stat: new FormControl(affix.craftedEffect.effect.stat)
        })
    }

    private legendaryEffectToForm(legendaryEffect: LegendaryEffect | null): FormGroup {
        return new FormGroup({
            id: new FormControl(legendaryEffect === null ? null : legendaryEffect.id),
            value: new FormControl(legendaryEffect === null ? 100 : legendaryEffect.value)
        })
    }

    private itemToForm(item: EquipableItem): FormGroup {
        const form = new FormGroup({
            level: new FormControl(item.level, [Validators.required, Validators.min(1), Validators.max(this.MAX_ITEM_LEVEL), Validators.pattern(/^[0-9]+$/)]),
            reinforcment: new FormControl(item.reinforcment, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)]),
            affixes: new FormArray(item.affixes.map(affix => this.affixToForm(affix))),
            legendaryEffect: this.legendaryEffectToForm(item.legendaryEffect),
            reaper: new FormGroup({
                smith: new FormControl(item.reaperEnchantment === null ? null : item.reaperEnchantment.craftedReaperSmith),
                value: new FormControl(item.reaperEnchantment === null ? 5 : item.reaperEnchantment.craftedValue)
            }),
            skill: new FormGroup({
                skill: new FormControl(item.skillEnchantment === null ? null : item.skillEnchantment.craftedSkill),
                value: new FormControl(item.skillEnchantment === null ? 2 : item.skillEnchantment.craftedValue)
            }),
            attribute: new FormGroup({
                attribute: new FormControl(item.attributeEnchantment === null ? null : item.attributeEnchantment.craftedAttribute),
                value: new FormControl(item.attributeEnchantment === null ? 2 : item.attributeEnchantment.craftedValue)
            })
        });

        form.valueChanges.subscribe(() => {
            this.updatePreview();
        });

        this.buildOptions(item);

        console.log(form.value);

        return form;
    }

    public getAffixControls(): Array<AbstractControl> {
        const affixes = <FormArray | null>this.form.get('affixes');
        return affixes !== null ? affixes.controls : [];
    }

    public isBasicStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Basic;
    }

    public hasBasicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isBasicStat(control)).length > 0
    }

    public hasMaximumBasicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isBasicStat(control)).length >= MAX_BASIC_STATS
    }

    public getStatOptions(index: number): Array<SelectOption<string>> {
        return valueOrDefault(this.statOptions[index], []);
    }

    public getCraftOptions(index: number): Array<SelectOption<number>> {
        return valueOrDefault(this.craftOptions[index], []);
    }
}
