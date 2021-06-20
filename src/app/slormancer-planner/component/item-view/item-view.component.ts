import { Component, Input } from '@angular/core';

import { ItemRarity } from '../../../slormancer/constants/item-rarity';
import { ExtendedAffix } from '../../../slormancer/model/extended-affix';
import { ExtendedEquipableItem } from '../../../slormancer/model/extended-equipable-item';
import { SlormancerTemplateService } from '../../../slormancer/services/slormancer-template.service';
import { valueOrNull } from '../../../slormancer/util/utils';

@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.scss']
})
export class ItemViewComponent {

    @Input()
    public readonly item: ExtendedEquipableItem | null = null;
    
    @Input()
    public readonly equipped: boolean = false;

    @Input()
    public readonly range: boolean = false;

    constructor(private slormancerTemplateService: SlormancerTemplateService) { }

    public getNormalAffixes(): Array<ExtendedAffix> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === ItemRarity.Normal);
    }

    public getMagicAffixes(): Array<ExtendedAffix> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === ItemRarity.Magic);
    }

    public getRareAffixes(): Array<ExtendedAffix> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === ItemRarity.Rare);
    }

    public getEpicAffixes(): Array<ExtendedAffix> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === ItemRarity.Epic);
    }

    public getItemRarityColor(): ItemRarity {
        let rarity = ItemRarity.Normal;

        if (this.item !== null) {
            rarity = this.item.legendaryEffect !== null ? ItemRarity.Legendary : this.item.rarity;
        }

        return rarity
    }

    public getMinValue(values: { [key: number] : number }): number {
        let min = 0;
        const keys = Object.keys(values);
        const minKey = keys[0];

        if (minKey) {
            const computed = valueOrNull(values[parseInt(minKey)]);
            if (computed != null) {
                min = computed;
            }
        }

        return min;
    }

    public getMaxValue(values: { [key: number] : number }): number {
        let max = 0;
        const keys = Object.keys(values);
        const maxKey = keys[keys.length - 1];

        if (maxKey) {
            const computed = valueOrNull(values[parseInt(maxKey)]);
            if (computed != null) {
                max = computed;
            }
        }

        return max;
    }

    public getLegendaryDescription(): string | null {
        let description: string | null = null;

        if (this.item !== null && this.item.legendaryEffect !== null) {
            description = this.slormancerTemplateService.formatLegendaryDescription(this.item.legendaryEffect);
        }

        return description;
    }
}
