import { Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { ReaperEnchantment } from '@slormancer/model/content/reaper-enchantment';
import { valueOrDefault } from '@slormancer/util/utils';

import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';

@Component({
  selector: 'app-item-edit-buff-reaper',
  templateUrl: './item-edit-buff-reaper.component.html',
  styleUrls: ['./item-edit-buff-reaper.component.scss']
})
export class ItemEditBuffReaperComponent implements OnChanges {

    @Input()
    public readonly reaperEnchantment: ReaperEnchantment | null = null;

    @Input()
    public readonly form: FormGroup | null = null;

    public options: Array<SelectOption<number>> = [];

    public displayedValue: string = '';

    constructor(private itemFormService: FormOptionsService) { }

    public ngOnChanges() {
        this.options = this.itemFormService.getReaperBuffOptions();
        if (this.reaperEnchantment !== null) {
            this.updateReaperEnchantmentValueLabel(this.reaperEnchantment.effect.value);
        }
    }

    public updateReaperEnchantmentValueLabel(value: number) {
        this.displayedValue = '';

        if (this.reaperEnchantment !== null && value !== null) {
            this.displayedValue = '+' + valueOrDefault(this.reaperEnchantment.craftableValues[value], 0);
        }
    }

    public updateSliderValue(change: MatSliderChange) {
        this.displayedValue = '';

        const value = change.value;
        if (this.reaperEnchantment !== null && value !== null) {
            this.updateReaperEnchantmentValueLabel(value);
        }
    }

    public removeReaperEnchantment() {
        if (this.form !== null) {
            this.form.patchValue({ smith: null });
        }
    }

    public addReaperEnchantment() {
        const firstOption = this.options[0];
        if (this.form !== null && firstOption) {
            this.form.patchValue({
                smith: firstOption.value,
                value: 5
            });
        }
    }
}
