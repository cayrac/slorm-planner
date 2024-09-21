import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { Attribute, AttributeEnchantment, SlormancerItemService, valueOrDefault } from '@slorm-api';

import { takeUntil } from 'rxjs';
import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { ItemAttributeFormGroup } from '../item-edit-modal/item-edit-modal.component';

@Component({
  selector: 'app-item-edit-buff-attribute',
  templateUrl: './item-edit-buff-attribute.component.html',
  styleUrls: ['./item-edit-buff-attribute.component.scss']
})
export class ItemEditBuffAttributeComponent extends AbstractUnsubscribeComponent implements OnChanges {

    @Input()
    public readonly form: FormGroup<ItemAttributeFormGroup> | null = null;

    public options: Array<SelectOption<number>> = [];

    public displayedValue: string = '';

    public attributeEnchantment: AttributeEnchantment | null = null;

    constructor(private itemFormService: FormOptionsService,
                private slormancerItemService: SlormancerItemService) {
        super();
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.options = this.itemFormService.getAttributeBuffOptions();

        if (this.form !== null) {
            if ('form' in changes) {
                this.form.valueChanges
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(attributeEnchantment => {
                        this.updateAttributeEnchantment(attributeEnchantment.attribute ?? null, attributeEnchantment.value ?? 0);
                    });
            }

            this.updateAttributeEnchantment(this.form.controls.attribute.value, this.form.controls.value.value);
        }
    }

    public updateAttributeEnchantment(attribute: Attribute | null, value: number) {
        this.attributeEnchantment = attribute === null ? null
            : this.slormancerItemService.getAttributeEnchantment(attribute, value);

        this.displayedValue = '';
        if (this.attributeEnchantment !== null) {
            this.displayedValue = '+' + valueOrDefault(this.attributeEnchantment.craftableValues[this.attributeEnchantment.craftedValue], 0);
        }
    }

    public updateSliderValue(change: MatSliderChange) {
        this.displayedValue = '';

        const value = change.value;
        if (this.attributeEnchantment !== null && value !== null) {
            this.updateAttributeEnchantment(this.attributeEnchantment.craftedValue, value);
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
