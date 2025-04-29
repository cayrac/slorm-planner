import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { EquipableItemBase, getCraftValue, HeroClass, LegendaryEffect, MAX_ITEM_LEVEL, SlormancerLegendaryEffectService } from '@slorm-api';

import { takeUntil } from 'rxjs';
import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { ItemLegendaryEffectFormGroup } from '../item-edit-modal/item-edit-modal.component';

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
    public readonly itemLevel: number = 0;

    @Input()
    public readonly itemReinforcement: number = 0;

    @Input()
    public readonly form: FormGroup<ItemLegendaryEffectFormGroup> | null = null;

    public options: Array<SelectOption<number>> = [];

    public displayedValue: string = '';

    public legendaryEffect: LegendaryEffect | null = null;

    public placeholder: string | null = null;

    public possible = true;

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
                        this.possible = this.isLegendaryPossible(legendaryEffect.id ?? null);
                    });
            }

            this.updateLegendaryEffect(this.form.controls.id.value, this.form.controls.value.value);
        }
        const graft = this.itemLevel > MAX_ITEM_LEVEL;
        this.options = graft
            ? this.itemFormService.getAllLegendaryOptions(this.heroClass)
            : this.itemFormService.getLegendaryOptions(this.base, this.heroClass);
        if (this.form !== null) {
            this.possible = this.isLegendaryPossible(this.form.controls.id.value);
        }
    }

    private updateLegendaryEffect(id: number | null, value: number) {
        this.legendaryEffect = (this.form === null || id === null) ? null
            : this.slormancerLegendaryEffectService.getLegendaryEffectById(id, this.form.controls.value.value, this.itemReinforcement, this.heroClass);
              
        this.placeholder = this.legendaryEffect === null ? null : this.legendaryEffect.name;
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

    private isLegendaryPossible(id: number |null) {
        return this.options.some(option => option.value === id);
    }
}
