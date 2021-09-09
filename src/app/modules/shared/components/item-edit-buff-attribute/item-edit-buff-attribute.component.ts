import { Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';

import { AttributeEnchantment } from '../../../slormancer/model/content/attribute-enchantment';
import { valueOrDefault } from '../../../slormancer/util/utils';
import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';

@Component({
  selector: 'app-item-edit-buff-attribute',
  templateUrl: './item-edit-buff-attribute.component.html',
  styleUrls: ['./item-edit-buff-attribute.component.scss']
})
export class ItemEditBuffAttributeComponent implements OnChanges {

    @Input()
    public readonly attributeEnchantment: AttributeEnchantment | null = null;

    @Input()
    public readonly form: FormGroup | null = null;

    public options: Array<SelectOption<number>> = [];

    public displayedValue: string = '';

    constructor(private itemFormService: FormOptionsService) { }

    public ngOnChanges() {
        this.options = this.itemFormService.getAttributeBuffOptions();
        if (this.attributeEnchantment !== null) {
            this.updateAttributeEnchantmentValueLabel(this.attributeEnchantment.effect.value);
        }
    }

    public updateAttributeEnchantmentValueLabel(value: number) {
        this.displayedValue = '';

        if (this.attributeEnchantment !== null && value !== null) {
            this.displayedValue = '+' + valueOrDefault(this.attributeEnchantment.craftableValues[value], 0);
        }
    }

    public updateSliderValue(change: MatSliderChange) {
        this.displayedValue = '';

        const value = change.value;
        if (this.attributeEnchantment !== null && value !== null) {
            this.updateAttributeEnchantmentValueLabel(value);
        }
    }

    public removeAttributeEnchantment() {
        if (this.form !== null) {
            this.form.patchValue({ attribute: null });
        }
    }

    public addAttributeEnchantment() {
        const firstOption = this.options[0];
        if (this.form !== null && firstOption) {
            this.form.patchValue({
                attribute: firstOption.value,
                value: 3
            });
        }
    }
}
