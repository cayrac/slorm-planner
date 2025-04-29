import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    ALL_RARITIES,
    compareRarities,
    EquipableItem,
    isNotNullOrUndefined,
    Rarity,
    SlormancerAffixService,
    SlormancerDataService,
    SlormancerItemService,
} from '@slorm-api';

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

    public readonly RARITY_OPTIONS: Array<SelectOption<Rarity>>;

    public readonly items: Array<EquipableItem>;

    public readonly selectedAffixes: Array<SelectOption<string>> = [];

    public readonly form: FormGroup;

    private defensiveStatMultiplier: number = 0; 

    constructor(private dialogRef: MatDialogRef<OptimizeItemsAffixesModalComponent>,
                @Inject(MAT_DIALOG_DATA) data: OptimizeItemsAffixesModalData,
                private slormancerItemService: SlormancerItemService,
                private slormancerDataService: SlormancerDataService,
                private slormancerAffixService: SlormancerAffixService,
                private formOptionsService: FormOptionsService) {
        this.RARITY_OPTIONS = this.formOptionsService.getAllRaritiesOptions()
            .filter(option => option.value !== Rarity.Legendary)
            .sort((a, b) => compareRarities(a.value, b.value));

        this.items = data.items;

        this.defensiveStatMultiplier = this.slormancerItemService.getDefensiveStatMultiplier(data.items
            .map(item => item.legendaryEffect)
            .filter(isNotNullOrUndefined));

        const affixControl = new FormControl();
        this.form = new FormGroup({
            rarity: new FormControl(Rarity.Epic, Validators.required),
            affix: affixControl
        });

        affixControl.valueChanges.subscribe((value: string | null) => {
            const affixOption = this.AFFIX_OPTIONS.find(option => option.value === value)
            if (affixOption !== undefined) {
                this.selectedAffixes.push(affixOption);
                this.updateOptions();
                affixControl.setValue(null);
            }
        });

        this.updateOptions();
    }

    private updateOptions() {
        this.AFFIX_OPTIONS = this.formOptionsService.getAllStatsOptions().filter(option => !this.selectedAffixes.includes(option));
    }

    private applyStatsToItem(item: EquipableItem) {
        const highestRarity: Rarity = this.form.value.rarity;
        const allowedRarities = ALL_RARITIES.filter(rarity => compareRarities(rarity, highestRarity) <= 0);

        const maxStats: { [key in Rarity]: number } = {
            [Rarity.Normal]: this.slormancerDataService.getBaseMaxBasicStat(item.base),
            [Rarity.Defensive]: 1,
            [Rarity.Magic]: 1,
            [Rarity.Rare]: 1,
            [Rarity.Epic]: 3,
            [Rarity.Legendary]: 0,
            [Rarity.Neither]: 0
        }
        const options: { [key in Rarity]: Array<SelectOption<string>> } = {
            [Rarity.Normal]: this.formOptionsService.getStatsOptions(item.base, Rarity.Normal),
            [Rarity.Defensive]: this.formOptionsService.getStatsOptions(item.base, Rarity.Defensive),
            [Rarity.Magic]: this.formOptionsService.getStatsOptions(item.base, Rarity.Magic),
            [Rarity.Rare]: this.formOptionsService.getStatsOptions(item.base, Rarity.Rare),
            [Rarity.Epic]: this.formOptionsService.getStatsOptions(item.base, Rarity.Epic),
            [Rarity.Legendary]: [],
            [Rarity.Neither]: []
        }

        item.affixes = [];

        for (const stat of this.selectedAffixes) {
            for (const rarity of allowedRarities) {
                const hasRoomForMoreAffixes = item.affixes.filter(affix => affix.rarity === rarity).length < maxStats[rarity];
                const availableOptions = options[rarity];

                if (hasRoomForMoreAffixes && availableOptions.includes(stat)) {
                    const affix = this.slormancerAffixService.getAffixFromStat(stat.value, item.level, item.reinforcement, rarity);

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
                    const affix = this.slormancerAffixService.getAffixFromStat(firstAvailable.value, item.level, item.reinforcement, rarity);
                    if (affix !== null) {
                        item.affixes.push(affix);
                        noAffixFound = false;
                    }
                }
            }
        }

        this.slormancerItemService.updateEquipableItemModel(item, this.defensiveStatMultiplier);
        this.slormancerItemService.updateEquipableItemView(item, this.defensiveStatMultiplier);
    }

    public removeStat(index: number) {
        this.selectedAffixes.splice(index, 1);
        this.updateOptions();
    }

    public getAffixControl(): FormControl | null {
        return this.form.get('affix') as FormControl;
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
