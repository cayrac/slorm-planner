import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { EquipableItemBase, getCraftValue, HeroClass, LegendaryEffect, SlormancerLegendaryEffectService } from 'slormancer-api';

import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';
import { ItemLegendaryEffectFormGroup } from '../item-edit-modal/item-edit-modal.component';
import { takeUntil } from 'rxjs';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';

@Component({
  selector: 'app-item-edit-legendary-effect',
  templateUrl: './item-edit-legendary-effect.component.html',
  styleUrls: ['./item-edit-legendary-effect.component.scss']
})
export class ItemEditLegendaryEffectComponent extends AbstractUnsubscribeComponent implements OnChanges {

    @Input()
    public readonly base: EquipableItemBase = EquipableItemBase.Amulet;

    @Input()
    public readonly heroClass: HeroClass = HeroClass.Huntress;

    @Input()
    public readonly itemReinforcment: number = 0;

    @Input()
    public readonly form: FormGroup<ItemLegendaryEffectFormGroup> | null = null;

    public options: Array<SelectOption<number>> = [];

    public displayedValue: string = '';

    public legendaryEffect: LegendaryEffect | null = null;

    constructor(private itemFormService: FormOptionsService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService) {
        super();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this.form !== null) {
            if ('form' in changes) {
                this.form.valueChanges
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(legendaryEffect => {
                        this.updateLegendaryEffect(legendaryEffect.id ?? null, legendaryEffect.value ?? 0);
                    });
            }

            this.updateLegendaryEffect(this.form.controls.id.value, this.form.controls.value.value);
        }

        this.options = this.itemFormService.getLegendaryOptions(this.base, this.heroClass);
    }

    private updateLegendaryEffect(id: number | null, value: number) {
        this.legendaryEffect = (this.form === null || id === null) ? null
            : this.slormancerLegendaryEffectService.getLegendaryEffectById(id, this.form.controls.value.value, this.itemReinforcment, this.heroClass);
            
        if (this.legendaryEffect !== null) {
            this.updateLegendaryValueLabel(this.legendaryEffect.value);
        }
    }

    public updateLegendaryValueLabel(value: number) {
        this.displayedValue = '';

        if (this.legendaryEffect !== null && value !== null) {
            this.displayedValue = this.legendaryEffect.effects
                .filter(craftedEffect => craftedEffect.possibleCraftedValues.length > 1) // mieux à faire ?
                .map(craftedEffect => {
                    const percent = craftedEffect.effect.percent ? '%' : '';
                    return getCraftValue(craftedEffect, value) + percent;
                }).join(' / ');
        }
    }

    public hasLegendaryValues(): boolean {
        return this.legendaryEffect !== null && this.legendaryEffect.effects
        .filter(craftedEffect => craftedEffect.possibleCraftedValues.length > 1).length > 0;
    }

    public updateSliderValue(change: MatSliderChange) {
        this.displayedValue = '';

        const value = change.value;
        if (this.legendaryEffect !== null && value !== null) {
            this.updateLegendaryValueLabel(value);
        }
    }

    public removeLegendaryEffect() {
        if (this.form !== null) {
            this.form.patchValue({ id: null });
        }
    }

    public addLegendaryEffect() {
        const firstOption = this.options[0];
        if (this.form !== null && firstOption) {
            this.form.patchValue({
                id: firstOption.value,
                value: 100
            });
        }
    }
}
