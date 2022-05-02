import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Rarity } from '../../../slormancer/model/content/enum/rarity';
import { EquipableItem } from '../../../slormancer/model/content/equipable-item';
import { SlormancerAffixService } from '../../../slormancer/services/content/slormancer-affix.service';
import { SlormancerDataService } from '../../../slormancer/services/content/slormancer-data.service';
import { SlormancerItemService } from '../../../slormancer/services/content/slormancer-item.service';
import { SelectOption } from '../../model/select-option';
import { FormOptionsService } from '../../services/form-options.service';

export interface OptimizeItemsStatsModalData {
    items: Array<EquipableItem>;
}

@Component({
  selector: 'app-optimize-items-stats-modal',
  templateUrl: './optimize-items-stats-modal.component.html',
  styleUrls: ['./optimize-items-stats-modal.component.scss']
})
export class OptimizeItemsStatsModalComponent {

    public readonly items: Array<EquipableItem>;

    public options: Array<SelectOption<string>> = this.formOptionsService.getAllStatsoptions();

    public readonly selectedStats: Array<SelectOption<string>> = [];
	
	public selectedRarities: Array<Rarity> = [];

	public readonly rarities: [Rarity.Normal, Rarity.Magic, Rarity.Rare, Rarity.Epic] = [Rarity.Normal, Rarity.Magic, Rarity.Rare, Rarity.Epic];

	public readonly rarityControl = new FormControl();

    public readonly statControl = new FormControl();

    constructor(private dialogRef: MatDialogRef<OptimizeItemsStatsModalComponent>,
                @Inject(MAT_DIALOG_DATA) data: OptimizeItemsStatsModalData,
                private slormancerItemService: SlormancerItemService,
                private slormancerDataService: SlormancerDataService,
                private slormancerAffixService: SlormancerAffixService,
                private formOptionsService: FormOptionsService) {
        this.items = data.items;

        this.statControl.valueChanges.subscribe((value: SelectOption<string> | null) => {
            if (value !== null) {
                this.selectedStats.push(value);
                this.updateOptions();
                this.statControl.setValue(null);
            }
        });
		
		this.rarityControl.valueChanges.subscribe((value: Rarity | null) => {
            if (value !== null) {
				this.selectedRarities = []
                for(const rarity of this.rarities){
					this.selectedRarities.push(rarity);
					if(value == rarity){
						break;
					}
				}
            }
        });
    }

    private updateOptions() {
        this.options = this.formOptionsService.getAllStatsoptions().filter(option => !this.selectedStats.includes(option));
    }

    private applyStatsToItem(item: EquipableItem) {
        
        const maxStats = {
            [Rarity.Normal]: this.slormancerDataService.getBaseMaxBasicStat(item.base),
            [Rarity.Magic]: 1,
            [Rarity.Rare]: 1,
            [Rarity.Epic]: 3,
        }
        const options = {
            [Rarity.Normal]: this.formOptionsService.getStatsOptions(item.base, Rarity.Normal),
            [Rarity.Magic]: this.formOptionsService.getStatsOptions(item.base, Rarity.Magic),
            [Rarity.Rare]: this.formOptionsService.getStatsOptions(item.base, Rarity.Rare),
            [Rarity.Epic]: this.formOptionsService.getStatsOptions(item.base, Rarity.Epic),
        }

        item.affixes = [];

        for (const stat of this.selectedStats) {
            for (const rarity of this.rarities) {
				if(!this.selectedRarities.includes(rarity)){
				    break;
				}
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

        while (item.affixes.filter(affix => affix.rarity === Rarity.Normal).length < maxStats[Rarity.Normal]) {
            const firstAvailable = options[Rarity.Normal].find(option => item.affixes.find(affix => affix.craftedEffect.effect.stat === option.value) === undefined);
            
            if (firstAvailable !== undefined) {
                const affix = this.slormancerAffixService.getAffixFromStat(firstAvailable.value, item.level, item.reinforcment, Rarity.Normal);
                if (affix !== null) {
                    item.affixes.push(affix);
                }
            }
        }

        this.slormancerItemService.updateEquipableItemModel(item);
        this.slormancerItemService.updateEquipableItemView(item);
    }

    public applyStats() {
        for (const item of this.items) {
            this.applyStatsToItem(item);
        }
        this.dialogRef.close(true);
    }

    public removeStat(index: number) {
        this.selectedStats.splice(index, 1);
        this.updateOptions();
    }
}
