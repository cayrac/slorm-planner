import { Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';

import { EquipableItemBase } from '../../../slormancer/model/content/enum/equipable-item-base';
import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';
import { LegendaryEffect } from '../../../slormancer/model/content/legendary-effect';
import { getCraftValue } from '../../../slormancer/util/utils';
import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';

@Component({
  selector: 'app-item-edit-legendary-effect',
  templateUrl: './item-edit-legendary-effect.component.html',
  styleUrls: ['./item-edit-legendary-effect.component.scss']
})
export class ItemEditLegendaryEffectComponent implements OnChanges {

    @Input()
    public readonly base: EquipableItemBase = EquipableItemBase.Amulet;

    @Input()
    public readonly heroClass: HeroClass = HeroClass.Huntress;

    @Input()
    public readonly legendaryEffect: LegendaryEffect | null = null;

    @Input()
    public readonly form: FormGroup | null = null;
    
    @Input()
    public readonly reinforcment: number | null = null;

    public options: Array<SelectOption<number>> = [];

    public displayedValue: string = '';

    constructor(private itemFormService: FormOptionsService) { }

    public ngOnChanges() {
        this.options = this.itemFormService.getLegendaryOptions(this.base, this.heroClass);
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
