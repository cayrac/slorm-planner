import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { ReaperEnchantment, ReaperSmith, SlormancerItemService } from 'slormancer-api';

import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';
import { ItemReaperFormGroup } from '../item-edit-modal/item-edit-modal.component';
import { takeUntil } from 'rxjs';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';

@Component({
  selector: 'app-item-edit-buff-reaper',
  templateUrl: './item-edit-buff-reaper.component.html',
  styleUrls: ['./item-edit-buff-reaper.component.scss']
})
export class ItemEditBuffReaperComponent extends AbstractUnsubscribeComponent implements OnChanges {

    @Input()
    public readonly form: FormGroup<ItemReaperFormGroup> | null = null;

    public options: Array<SelectOption<number>> = [];

    public displayedValue: string = '';

    public reaperEnchantment: ReaperEnchantment | null = null;

    constructor(private itemFormService: FormOptionsService,
                private slormancerItemService: SlormancerItemService) {
        super();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this.form !== null) {
            if ('form' in changes) {
                this.form.valueChanges
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(reaperEnchantment => {
                        this.updateReaperEnchantment(reaperEnchantment.smith ?? null, reaperEnchantment.value ?? 0);
                    });
            }

            this.updateReaperEnchantment(this.form.controls.smith.value, this.form.controls.value.value);
        }

        this.options = this.itemFormService.getReaperBuffOptions();
    }

    public updateReaperEnchantment(smith: ReaperSmith | null, value: number) {
        this.displayedValue = '';

        this.reaperEnchantment = smith === null ? null
            : this.slormancerItemService.getReaperEnchantment(smith, value);

        if (this.reaperEnchantment !== null) {
            console.log(this.reaperEnchantment);
            this.displayedValue = '+' + this.reaperEnchantment.craftedValue;
        }
    }

    public updateSliderValue(change: MatSliderChange) {
        this.displayedValue = '';

        const value = change.value;
        if (this.reaperEnchantment !== null && value !== null) {
            this.updateReaperEnchantment(this.reaperEnchantment.craftedReaperSmith, value);
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
