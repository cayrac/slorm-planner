import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { adaptOverlay, Affix, EquipableItem, Rarity, resetOverlay } from '@slorm-api';

@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.scss']
})
export class ItemViewComponent implements AfterViewChecked, OnDestroy {

    @Input()
    public readonly item: EquipableItem | null = null;
    
    @Input()
    public readonly equipped: boolean = false;

    @Input()
    public readonly details: boolean = true;

    @Input()
    public readonly tooltip: boolean = false;
    
    @ViewChild('main')
    private main: ElementRef<HTMLElement> | null = null; 

    constructor() { }

    public ngAfterViewChecked() {
        if (this.main && this.tooltip) {
            adaptOverlay(this.main.nativeElement);
        }
    }
    
    public ngOnDestroy() {
        resetOverlay();
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
