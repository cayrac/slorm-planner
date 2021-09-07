import { Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Affix } from '../../../slormancer/model/content/affix';
import { EquipableItemBase } from '../../../slormancer/model/content/enum/equipable-item-base';
import { getCraftValue } from '../../../slormancer/util/utils';
import { SelectOption } from '../../model/select-option';
import { ItemFormService } from '../../services/item-form.service';

@Component({
  selector: 'app-item-edit-stat',
  templateUrl: './item-edit-stat.component.html',
  styleUrls: ['./item-edit-stat.component.scss']
})
export class ItemEditStatComponent implements OnChanges {

    @Input()
    public readonly base: EquipableItemBase = EquipableItemBase.Amulet;

    @Input()
    public readonly itemStats: Array<string> = [];

    @Input()
    public readonly affix: Affix | null = null;

    @Input()
    public readonly form: FormGroup | null = null;

    public displayWith: (craft: number) => number | string = () => ''; 

    public options: Array<SelectOption<string>> = [];

    constructor(private itemFormService: ItemFormService) {
        console.log('ItemEditStatComponent constructor');
    }

    public ngOnChanges() {
        console.log('ItemEditStatComponent ngOnChanges');
        const affix = this.affix;
        if (affix !== null) {
            this.displayWith = craft => getCraftValue(affix.craftedEffect, craft);
            this.options = this.itemFormService.getStatsOptions(this.base, affix.rarity);
        }
    }

    public isOptionDisabled(stat: string): boolean {
        return this.itemStats.indexOf(stat) !== -1 && this.affix !== null && stat !== this.affix.craftedEffect.effect.stat
    }
}
