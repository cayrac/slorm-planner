import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { HeroClass, SkillEnchantment, SlormancerItemService, valueOrDefault } from 'slormancer-api';

import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { takeUntil } from 'rxjs';
import { ItemSkillFormGroup } from '../item-edit-modal/item-edit-modal.component';

@Component({
  selector: 'app-item-edit-buff-skill',
  templateUrl: './item-edit-buff-skill.component.html',
  styleUrls: ['./item-edit-buff-skill.component.scss']
})
export class ItemEditBuffSkillComponent extends AbstractUnsubscribeComponent implements OnChanges {

    @Input()
    public readonly heroClass: HeroClass = HeroClass.Huntress;

    @Input()
    public readonly form: FormGroup<ItemSkillFormGroup> | null = null;

    public options: Array<SelectOption<number>> = [];

    public displayedValue: string = '';

    public skillEnchantment: SkillEnchantment | null = null;

    constructor(private itemFormService: FormOptionsService,
                private slormancerItemService: SlormancerItemService) {
        super();
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.options = this.itemFormService.getSkillBuffOptions(this.heroClass);

        if (this.form !== null) {
            if ('form' in changes) {
                this.form.valueChanges
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(skillEnchantment => {
                        this.updateSkillEnchantment(skillEnchantment.skill ?? null, skillEnchantment.value ?? 0);
                    });
            }

            this.updateSkillEnchantment(this.form.controls.skill.value, this.form.controls.value.value);
        }
    }

    public updateSkillEnchantment(skill: number | null, value: number) {
        this.skillEnchantment = skill === null ? null
            : this.slormancerItemService.getSkillEnchantment(skill, value);

        this.displayedValue = '';
        if (this.skillEnchantment !== null && value !== null) {
            this.displayedValue = '+' + valueOrDefault(this.skillEnchantment.craftableValues[value], 0);
        }
    }

    public updateSliderValue(change: MatSliderChange) {
        this.displayedValue = '';

        const value = change.value;
        if (this.skillEnchantment !== null && value !== null) {
            this.updateSkillEnchantment(this.skillEnchantment.craftedSkill, value);
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
