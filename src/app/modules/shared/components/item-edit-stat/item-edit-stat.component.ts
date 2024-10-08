import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { Affix, EquipableItemBase, SlormancerAffixService, getCraftValue } from '@slorm-api';

import { takeUntil } from 'rxjs';
import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { ItemAffixFormGroup } from '../item-edit-modal/item-edit-modal.component';

@Component({
  selector: 'app-item-edit-stat',
  templateUrl: './item-edit-stat.component.html',
  styleUrls: ['./item-edit-stat.component.scss']
})
export class ItemEditStatComponent extends AbstractUnsubscribeComponent implements OnChanges {

    @Input()
    public readonly itemBase: EquipableItemBase = EquipableItemBase.Amulet;

    @Input()
    public readonly itemLevel: number = 0;

    @Input()
    public readonly itemReinforcment: number = 0;

    @Input()
    public readonly alreadyUsedStats: Array<string> = [];

    @Input()
    public readonly form: FormGroup<ItemAffixFormGroup> | null = null;

    @Input()
    public readonly removable: boolean = false;

    @Output()
    public readonly remove = new EventEmitter<void>();

    public options: Array<SelectOption<string>> = [];

    public displayedValue: string = '';

    public affix: Affix | null = null;

    constructor(private itemFormService: FormOptionsService,
                private slormancerAffixService: SlormancerAffixService) {
        super();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this.form !== null) {
            if ('form' in changes) {
                this.form.controls.rarity.valueChanges
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(rarity => {
                        this.options = this.itemFormService.getStatsOptions(this.itemBase, rarity);
                    })
    
                this.form.valueChanges
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(() => this.updateAffix());
            }
            
            if ('form' in changes || 'itemBase' in changes) {
                this.options = this.itemFormService.getStatsOptions(this.itemBase, this.form.controls.rarity.value);
            }
            
            if ('form' in changes || 'itemLevel' in changes || 'itemReinforcment' in changes) {
                this.updateAffix();
            }
        }
    }

    private updateAffix() {
        if (this.form !== null) {
            this.affix = this.slormancerAffixService.getAffixFromStat(
                this.form.controls.stat.value,
                this.itemLevel,
                this.itemReinforcment,
                this.form.controls.rarity.value,
                this.form.controls.value.value,
                this.form.controls.purity.value
            );
        
            if (this.affix !== null) {
                this.slormancerAffixService.updateAffix(this.affix);
            }

            this.updatePurity(this.form.controls.pure.value, this.form.controls.purity.value, this.form.controls.value.value);
        }
    }

    public updatePurity(pure: boolean, purity: number, value: number) {
        if (pure) {
            this.setPuritylabel(purity);
        } else {
            this.setStatLabel(value);
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
        this.remove.emit();
    }
}
