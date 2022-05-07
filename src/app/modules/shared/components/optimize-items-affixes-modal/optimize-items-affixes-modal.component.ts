import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ALL_RARITIES, Rarity } from '@slormancer/model/content/enum/rarity';
import { EquipableItem } from '@slormancer/model/content/equipable-item';
import { SlormancerAffixService } from '@slormancer/services/content/slormancer-affix.service';
import { SlormancerDataService } from '@slormancer/services/content/slormancer-data.service';
import { SlormancerItemService } from '@slormancer/services/content/slormancer-item.service';

import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';

export interface OptimizeItemsAffixesModalData {
    items: Array<EquipableItem>;
}

@Component({
  selector: 'app-optimize-items-affixes-modal',
  templateUrl: './optimize-items-affixes-modal.component.html',
  styleUrls: ['./optimize-items-affixes-modal.component.scss']
})
export class OptimizeItemsAffixesModalComponent {

    public AFFIX_OPTIONS: Array<SelectOption<string>> = [];

    public readonly RARITY_OPTIONS: Array<SelectOption<Rarity>> = this.formOptionsService.getAllRaritiesOptions()
        .filter(option => option.value !== Rarity.Legendary);

    public readonly items: Array<EquipableItem>;

    public readonly selectedAffixes: Array<SelectOption<string>> = [];

    public readonly form: FormGroup;

    constructor(private dialogRef: MatDialogRef<OptimizeItemsAffixesModalComponent>,
                @Inject(MAT_DIALOG_DATA) data: OptimizeItemsAffixesModalData,
                private slormancerItemService: SlormancerItemService,
                private slormancerDataService: SlormancerDataService,
                private slormancerAffixService: SlormancerAffixService,
                private formOptionsService: FormOptionsService) {
        this.items = data.items;

        const affixControl = new FormControl();
        this.form = new FormGroup({
            rarity: new FormControl(Rarity.Epic, Validators.required),
            affix: affixControl
        });

        affixControl.valueChanges.subscribe((value: SelectOption<string> | null) => {
            if (value !== null) {
                this.selectedAffixes.push(value);
                this.updateOptions();
                affixControl.setValue(null);
            }
        });

        this.updateOptions();
    }

    private updateOptions() {
        this.AFFIX_OPTIONS = this.formOptionsService.getAllStatsoptions().filter(option => !this.selectedAffixes.includes(option));
    }

    private applyStatsToItem(item: EquipableItem) {
        const highestRarity: Rarity = this.form.value.rarity;
        const allowedRarities = ALL_RARITIES.filter(rarity => ALL_RARITIES.indexOf(rarity) <= ALL_RARITIES.indexOf(highestRarity));

        const maxStats: { [key in Rarity]: number } = {
            [Rarity.Normal]: this.slormancerDataService.getBaseMaxBasicStat(item.base),
            [Rarity.Magic]: 1,
            [Rarity.Rare]: 1,
            [Rarity.Epic]: 3,
            [Rarity.Legendary]: 0
        }
        const options: { [key in Rarity]: Array<SelectOption<string>> } = {
            [Rarity.Normal]: this.formOptionsService.getStatsOptions(item.base, Rarity.Normal),
            [Rarity.Magic]: this.formOptionsService.getStatsOptions(item.base, Rarity.Magic),
            [Rarity.Rare]: this.formOptionsService.getStatsOptions(item.base, Rarity.Rare),
            [Rarity.Epic]: this.formOptionsService.getStatsOptions(item.base, Rarity.Epic),
            [Rarity.Legendary]: []
        }

        item.affixes = [];

        for (const stat of this.selectedAffixes) {
            for (const rarity of allowedRarities) {
                const hasRoomForMoreAffixes = item.affixes.filter(affix => affix.rarity === rarity).length < maxStats[rarity];
                const availableOptions = options[rarity];

                if (hasRoomForMoreAffixes && availableOptions.includes(stat)) {
                    const affix = this.slormancerAffixService.getAffixFromStat(stat.value, item.level, item.reinforcment, rarity);

                    if (affix !== null) {
                        item.affixes.push(affix);
                        break;
                    }
                }
            }
        }

        const maxAffixRarityIndex = Math.max(...item.affixes.map(affix => ALL_RARITIES.indexOf(affix.rarity)));
        const raritiesToFill = ALL_RARITIES.filter(rarity => rarity === Rarity.Normal || ALL_RARITIES.indexOf(rarity) < maxAffixRarityIndex);
        for (const rarity of raritiesToFill)  {
            let noAffixFound = false;
            while (!noAffixFound && item.affixes.filter(affix => affix.rarity === rarity).length < maxStats[rarity]) {
                const firstAvailable = options[rarity].find(option => item.affixes.find(affix => affix.craftedEffect.effect.stat === option.value) === undefined);
                
                noAffixFound = true;
                if (firstAvailable !== undefined) {
                    const affix = this.slormancerAffixService.getAffixFromStat(firstAvailable.value, item.level, item.reinforcment, rarity);
                    if (affix !== null) {
                        item.affixes.push(affix);
                        noAffixFound = false;
                    }
                }
            }
        }

        this.slormancerItemService.updateEquipableItemModel(item);
        this.slormancerItemService.updateEquipableItemView(item);
    }

    public removeStat(index: number) {
        this.selectedAffixes.splice(index, 1);
        this.updateOptions();
    }

    public submit() {
        this.form.markAllAsTouched();
        if (this.selectedAffixes.length > 0 && this.form.valid) {
            for (const item of this.items) {
                this.applyStatsToItem(item);
            }
            this.dialogRef.close(true);
        }
    }
}
