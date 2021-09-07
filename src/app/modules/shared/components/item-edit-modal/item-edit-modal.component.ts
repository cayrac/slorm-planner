import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MAX_EPIC_STATS, MAX_ITEM_LEVEL, MAX_MAGIC_STATS, MAX_RARE_STATS } from '../../../slormancer/constants/common';
import { Affix } from '../../../slormancer/model/content/affix';
import { Rarity } from '../../../slormancer/model/content/enum/rarity';
import { EquipableItem } from '../../../slormancer/model/content/equipable-item';
import { LegendaryEffect } from '../../../slormancer/model/content/legendary-effect';
import { SlormancerAffixService } from '../../../slormancer/services/content/slormancer-affix.service';
import { SlormancerDataService } from '../../../slormancer/services/content/slormancer-data.service';
import { SlormancerItemService } from '../../../slormancer/services/content/slormancer-item.service';
import { valueOrNull } from '../../../slormancer/util/utils';
import { ItemFormService } from '../../services/item-form.service';

export interface ItemEditModalData {
    item: EquipableItem;
    baseLocked: boolean;
    maxLevel: number;
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

    private maxBasicStats: number = 0;

    public itemStats: Array<string> = [];

    public item: EquipableItem;

    public form: FormGroup;

    constructor(public dialogRef: MatDialogRef<ItemEditModalComponent>,
                private slormancerItemService: SlormancerItemService,
                private slormancerDataService: SlormancerDataService,
                private slormancerAffixService: SlormancerAffixService,
                private itemFormservice: ItemFormService,
                @Inject(MAT_DIALOG_DATA) public data: ItemEditModalData
                ) {
        this.originalItem = data.item;
        this.baseLocked = data.baseLocked;
        this.maxLevel = data.maxLevel;

        this.item = this.slormancerItemService.getEquipableItemClone(this.originalItem);
        this.form = this.buildForm();

        // STOP : fait un component, t'as trop de refresh avec les accès / conditions

        // item edit form service (avec cache)
        // object avec options préconstruites
        // rempalcer selects par slider (displayWith)
    }

    public reset() {
        this.item = this.slormancerItemService.getEquipableItemClone(this.originalItem);
        this.form = this.buildForm();
    }

    public submit() {
        this.dialogRef.close(this.item);
    }

    private updatePreview(form: FormGroup) {
        if (form.valid) {
            const value = form.value;
            this.item.level = value.level;
            this.item.reinforcment = value.reinforcment;

            this.item.affixes.forEach((affix, index) => {
                const control = <FormGroup | null>form.get('affixes.' + index);

                if (control !== null) {
                    const purity = (<FormControl>control.get('purity')).value;
                    const value = (<FormControl>control.get('value')).value;
                    const stat =(<FormControl>control.get('stat')).value;

                    affix.pure = purity;
                    affix.craftedEffect.craftedValue = value;
                    affix.craftedEffect.effect.stat = stat;
                }
            });

            this.slormancerItemService.updateEquippableItem(this.item);

            this.itemStats = this.item.affixes.map(affix => affix.craftedEffect.effect.stat);
        }
    }

    private affixToForm(affix: Affix): FormGroup {
        return new FormGroup({
            rarity: new FormControl(affix.rarity),
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

    private buildForm(): FormGroup {
        const form = new FormGroup({
            level: new FormControl(this.item.level, [Validators.required, Validators.min(1), Validators.max(this.MAX_ITEM_LEVEL), Validators.pattern(/^[0-9]+$/)]),
            reinforcment: new FormControl(this.item.reinforcment, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)]),
            affixes: new FormArray(this.item.affixes.map(affix => this.affixToForm(affix))),
            legendaryEffect: this.legendaryEffectToForm(this.item.legendaryEffect),
            reaper: new FormGroup({
                smith: new FormControl(this.item.reaperEnchantment === null ? null : this.item.reaperEnchantment.craftedReaperSmith),
                value: new FormControl(this.item.reaperEnchantment === null ? 5 : this.item.reaperEnchantment.craftedValue)
            }),
            skill: new FormGroup({
                skill: new FormControl(this.item.skillEnchantment === null ? null : this.item.skillEnchantment.craftedSkill),
                value: new FormControl(this.item.skillEnchantment === null ? 2 : this.item.skillEnchantment.craftedValue)
            }),
            attribute: new FormGroup({
                attribute: new FormControl(this.item.attributeEnchantment === null ? null : this.item.attributeEnchantment.craftedAttribute),
                value: new FormControl(this.item.attributeEnchantment === null ? 2 : this.item.attributeEnchantment.craftedValue)
            })
        });

        form.valueChanges.subscribe(() => {
            this.updatePreview(form);
        });
        this.updatePreview(form);

        this.maxBasicStats = this.slormancerDataService.getBaseMaxBasicStat(this.item.base);

        return form;
    }

    public getAffixControls(): Array<FormGroup> {
        const affixes = <FormArray | null>this.form.get('affixes');
        return affixes !== null ? <Array<FormGroup>>affixes.controls : [];
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
        return controls !== null && controls.controls.filter(control => this.isBasicStat(control)).length >= this.maxBasicStats;
    }

    public isMagicStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Magic;
    }

    public hasMagicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isMagicStat(control)).length > 0
    }

    public hasMaximumMagicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isMagicStat(control)).length >= MAX_MAGIC_STATS;
    }

    public isRareStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Rare;
    }

    public hasRareStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isRareStat(control)).length > 0
    }

    public hasMaximumRareStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isRareStat(control)).length >= MAX_RARE_STATS;
    }

    public isEpicStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Epic;
    }

    public hasEpicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isEpicStat(control)).length > 0
    }

    public hasMaximumEpicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isEpicStat(control)).length >= MAX_EPIC_STATS;
    }

    public getAffix(index: number): Affix | null {
        return valueOrNull(this.item.affixes[index]);
    }

    public removeAffix(index: number) {
        const formAffixes = <FormArray | null>this.form.get('affixes');

        if (formAffixes !== null) {
            formAffixes.removeAt(index);
            this.item.affixes.splice(index, 1);
            this.updatePreview(this.form);
        }
    }

    private addAffix(rarity: Rarity) {
        const formAffixes = <FormArray | null>this.form.get('affixes');
        const possibleStats = this.itemFormservice.getStatsOptions(this.item.base, rarity)
            .filter(option => this.itemStats.indexOf(option.value) === -1);

        const stat = possibleStats[0];
        if (stat && formAffixes !== null) {
            const affix = this.slormancerAffixService.getAffixFromStat(stat.value, this.item.level, this.item.reinforcment, rarity);

            if (affix !== null) {
                this.item.affixes.push(affix);
                formAffixes.push(this.affixToForm(affix));

                this.updatePreview(this.form);
            }
        }
    }

    public addBasicAffix() {
        this.addAffix(Rarity.Basic);
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
