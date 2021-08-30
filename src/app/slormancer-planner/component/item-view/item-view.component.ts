import { Component, Input } from '@angular/core';

import { AttributeEnchantment } from '../../../slormancer/model/attribute-enchantment';
import { CraftedValue } from '../../../slormancer/model/crafted-value';
import { HeroClass } from '../../../slormancer/model/enum/hero-class';
import { Rarity } from '../../../slormancer/model/enum/rarity';
import { EquipableItem } from '../../../slormancer/model/equipable-item';
import { ReaperEnchantment } from '../../../slormancer/model/reaper-enchantment';
import { SkillEnchantment } from '../../../slormancer/model/skill-enchantment';
import { SlormancerTemplateService } from '../../../slormancer/services/slormancer-template.service';

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

    @Input()
    public readonly class: HeroClass = HeroClass.Huntress;

    constructor(private slormancerTemplateService: SlormancerTemplateService) { }

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

    public getLegendaryDescription(): string | null {
        let description: string | null = null;

        if (this.item !== null && this.item.legendaryEffect !== null) {
            description = this.slormancerTemplateService.formatLegendaryDescription(this.item.legendaryEffect, this.item.reinforcment);
        }

        return description;
    }
    
    public getReaperEnchantmentLabel(enchantment: ReaperEnchantment): string {
        return this.slormancerTemplateService.getReaperEnchantmentLabel(enchantment);
    }

    public getSkillEnchantmentLabel(enchantment: SkillEnchantment): string {
        return this.slormancerTemplateService.getSkillEnchantmentLabel(enchantment, this.class);
    }

    public getAttributeEnchantmentLabel(enchantment: AttributeEnchantment): string {
        return this.slormancerTemplateService.getAttributeEnchantmentLabel(enchantment);
    }
}
