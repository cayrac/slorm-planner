import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSliderChange } from '@angular/material/slider';

import { Affix } from '../../../slormancer/model/content/affix';
import { EquipableItemBase } from '../../../slormancer/model/content/enum/equipable-item-base';
import { getCraftValue } from '../../../slormancer/util/utils';
import { SelectOption } from '../../model/select-option';
import { ItemFormService } from '../../services/item-form.service';

@Component({
  selector: 'app-item-edit-stat',
  templateUrl: './item-edit-stat.component.html',
  styleUrls: ['./item-edit-stat.component.scss']
})
export class ItemEditStatComponent implements OnChanges {

    @Input()
    public readonly base: EquipableItemBase = EquipableItemBase.Amulet;

    @Input()
    public readonly itemStats: Array<string> = [];

    @Input()
    public readonly affix: Affix | null = null;

    @Input()
    public readonly form: FormGroup | null = null;

    @Input()
    public readonly removable: boolean = false;

    @Output()
    public readonly remove = new EventEmitter<void>();

    public options: Array<SelectOption<string>> = [];

    public displayedValue: string = '';

    constructor(private itemFormService: ItemFormService) {
        console.log('ItemEditStatComponent constructor');
    }

    public ngOnChanges() {
        if (this.affix !== null) {
            this.options = this.itemFormService.getStatsOptions(this.base, this.affix.rarity);

            if (this.affix.isPure) {
                this.setPuritylabel(this.affix.pure);
            } else {
                this.setStatLabel(this.affix.craftedEffect.craftedValue);
            }
        }
    }

    public isOptionDisabled(stat: string): boolean {
        return this.itemStats.indexOf(stat) !== -1 && this.affix !== null && stat !== this.affix.craftedEffect.effect.stat
    }

    public purityChanged(change: MatCheckboxChange) {
        console.log(change);
        if (this.affix !== null && this.form !== null) {
            if (change.checked) {
                this.form.patchValue({ purity: 101 });
            } else {
                this.form.patchValue({ purity: 100 });
            }
        }
    }

    public updateSliderPurity(change: MatSliderChange) {
        if (change.value !== null) {
            this.setPuritylabel(change.value);
        }
    }

    public updateSliderStat(change: MatSliderChange) {
        if (change.value !== null) {
            this.setStatLabel(change.value);
        }
    }

    private setPuritylabel(value: number) {
        this.displayedValue = Math.round(value - 100) + '%';
    }

    private setStatLabel(value: number) {
        this.displayedValue = '';

        if (this.affix !== null) {
            const percent = this.affix.craftedEffect.effect.percent ? '%' : ''
            this.displayedValue = this.affix === null ? '' : '+' +(getCraftValue(this.affix.craftedEffect, value) + percent);
        }
    }

    public removeStat() {
        console.log('removeStat');
        this.remove.emit();
    }
}
