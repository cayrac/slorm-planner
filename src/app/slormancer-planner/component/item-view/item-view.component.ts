import { Component, Input } from '@angular/core';

import { Affix } from '../../../slormancer/model/affix';
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

    public getNormalAffixes(): Array<Affix> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === Rarity.Normal);
    }

    public getMagicAffixes(): Array<Affix> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === Rarity.Magic);
    }

    public getRareAffixes(): Array<Affix> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === Rarity.Rare);
    }

    public getEpicAffixes(): Array<Affix> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === Rarity.Epic);
    }
}
