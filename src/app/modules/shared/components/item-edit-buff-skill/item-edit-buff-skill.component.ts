import { Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { HeroClass } from '@slormancer/model/content/enum/hero-class';
import { SkillEnchantment } from '@slormancer/model/content/skill-enchantment';
import { valueOrDefault } from '@slormancer/util/utils';

import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';

@Component({
  selector: 'app-item-edit-buff-skill',
  templateUrl: './item-edit-buff-skill.component.html',
  styleUrls: ['./item-edit-buff-skill.component.scss']
})
export class ItemEditBuffSkillComponent implements OnChanges {

    @Input()
    public readonly heroClass: HeroClass = HeroClass.Huntress;

    @Input()
    public readonly skillEnchantment: SkillEnchantment | null = null;

    @Input()
    public readonly form: FormGroup | null = null;

    public options: Array<SelectOption<number>> = [];

    public displayedValue: string = '';

    constructor(private itemFormService: FormOptionsService) { }

    public ngOnChanges() {
        this.options = this.itemFormService.getSkillBuffOptions(this.heroClass);
        if (this.skillEnchantment !== null) {
            this.updateSkillEnchantmentValueLabel(this.skillEnchantment.effect.value);
        }
    }

    public updateSkillEnchantmentValueLabel(value: number) {
        this.displayedValue = '';

        if (this.skillEnchantment !== null && value !== null) {
            this.displayedValue = '+' + valueOrDefault(this.skillEnchantment.craftableValues[value], 0);
        }
    }

    public updateSliderValue(change: MatSliderChange) {
        this.displayedValue = '';

        const value = change.value;
        if (this.skillEnchantment !== null && value !== null) {
            this.updateSkillEnchantmentValueLabel(value);
        }
    }

    public removeSkillEnchantment() {
        if (this.form !== null) {
            this.form.patchValue({ skill: null });
        }
    }

    public addSkillEnchantment() {
        const firstOption = this.options[0];
        if (this.form !== null && firstOption) {
            this.form.patchValue({
                skill: firstOption.value,
                value: 2
            });
        }
    }
}
