import { Component, Input } from '@angular/core';

import { CraftedValue } from '../../../slormancer/model/crafted-value';
import { Rarity } from '../../../slormancer/model/enum/rarity';
import { EquipableItem } from '../../../slormancer/model/equipable-item';

@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.scss']
})
export class ItemViewComponent {

    @Input()
    public readonly item: EquipableItem | null = null;
    
    @Input()
    public readonly equipped: boolean = false;

    @Input()
    public readonly details: boolean = true;

    constructor() { }

    public getNormalAffixes(): Array<CraftedValue> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === Rarity.Normal);
    }

    public getMagicAffixes(): Array<CraftedValue> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === Rarity.Magic);
    }

    public getRareAffixes(): Array<CraftedValue> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === Rarity.Rare);
    }

    public getEpicAffixes(): Array<CraftedValue> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === Rarity.Epic);
    }
}
