import { AfterViewChecked, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { adaptTooltip, Affix, EquipableItem, Rarity } from '@slorm-api';

@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.scss']
})
export class ItemViewComponent implements AfterViewChecked {

    @Input()
    public readonly item: EquipableItem | null = null;
    
    @Input()
    public readonly equipped: boolean = false;

    @Input()
    public readonly details: boolean = true;
    
    @ViewChild('main')
    private main: ElementRef<HTMLElement> | null = null; 

    constructor() { }

    public ngAfterViewChecked() {
        if (this.main) {
            adaptTooltip(this.main.nativeElement);
        }
    }

    public getNormalAffixes(): Array<Affix> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === Rarity.Normal);
    }

    public getDefensiveAffixes(): Array<Affix> {
        return this.item === null ? [] : this.item.affixes.filter(affix => affix.rarity === Rarity.Defensive);
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

    public hasAffixes() {
        return this.item !== null && this.item.affixes.length > 0;
    }
}
