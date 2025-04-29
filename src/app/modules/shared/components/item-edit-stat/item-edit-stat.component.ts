import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { Affix, EquipableItemBase, MAX_ITEM_LEVEL, Rarity, SlormancerAffixService, getCraftValue } from '@slorm-api';

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

    public readonly STATS_LABELS: { [key in string]: string }

    @Input()
    public readonly itemBase: EquipableItemBase = EquipableItemBase.Amulet;

    @Input()
    public readonly itemLevel: number = 0;

    @Input()
    public readonly itemReinforcement: number = 0;

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
        this.STATS_LABELS = this.itemFormService.getStatsLabels();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this.form !== null) {
            if ('form' in changes) {
                this.form.controls.rarity.valueChanges
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(rarity => {
                        this.options = this.getOptions(this.itemLevel, this.itemBase, rarity);
                    })
    
                this.form.valueChanges
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(() => this.updateAffix());
            }
            
            if ('form' in changes || 'itemBase' in changes || 'itemLevel' in changes) {
                this.options = this.getOptions(this.itemLevel, this.itemBase, this.form.controls.rarity.value);
            }
            
            if ('form' in changes || 'itemLevel' in changes || 'itemReinforcement' in changes) {
                this.updateAffix();
            }
        }
    }

    private getOptions(itemLevel: number, base: EquipableItemBase, rarity: Rarity): Array<SelectOption<string>> {
        return itemLevel > MAX_ITEM_LEVEL
            ? this.itemFormService.getAllStatsOptions()
            : this.itemFormService.getStatsOptions(this.itemBase, rarity)
    }

    private updateAffix() {
        if (this.form !== null) {
            this.affix = this.slormancerAffixService.getAffixFromStat(
                this.form.controls.stat.value,
                this.itemLevel,
                this.itemReinforcement,
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
