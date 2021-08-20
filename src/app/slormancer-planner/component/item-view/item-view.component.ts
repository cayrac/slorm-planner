import { Component, Input } from '@angular/core';

import { Activable } from '../../../slormancer/model/activable';
import { Affix } from '../../../slormancer/model/affix';
import { AttributeEnchantment } from '../../../slormancer/model/attribute-enchantment';
import { HeroClass } from '../../../slormancer/model/enum/hero-class';
import { Rarity } from '../../../slormancer/model/enum/rarity';
import { SkillCostType } from '../../../slormancer/model/enum/skill-cost-type';
import { SkillGenre } from '../../../slormancer/model/enum/skill-genre';
import { EquipableItem } from '../../../slormancer/model/equipable-item';
import { ReaperEnchantment } from '../../../slormancer/model/reaper-enchantment';
import { SkillEnchantment } from '../../../slormancer/model/skill-enchantment';
import { SlormancerTemplateService } from '../../../slormancer/services/slormancer-template.service';
import { valueOrNull } from '../../../slormancer/util/utils';

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

    public getItemRarityColor(): Rarity {
        let rarity = Rarity.Normal;

        if (this.item !== null) {
            rarity = this.item.legendaryEffect !== null ? Rarity.Legendary : this.item.rarity;
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
            description = this.slormancerTemplateService.formatLegendaryDescription(this.item.legendaryEffect, this.item.reinforcment);
        }

        return description;
    }

    public getActivableDescription(): string | null {
        let description: string | null = null;

        if (this.item !== null && this.item.legendaryEffect !== null && this.item.legendaryEffect.activable !== null) {
            description = this.slormancerTemplateService.formatActivableDescription(this.item.legendaryEffect.activable, this.item.reinforcment);
        }

        return description;
    }

    public activableHasCost(activable: Activable): boolean {
        return activable.costType !== SkillCostType.None;
    }

    public activableHasLifeCost(activable: Activable): boolean {
        return activable.costType === SkillCostType.LifeSecond || activable.costType === SkillCostType.LifeLock || activable.costType === SkillCostType.Life;
    }

    public activableHasManaCost(activable: Activable): boolean {
        return activable.costType === SkillCostType.ManaSecond || activable.costType === SkillCostType.ManaLock || activable.costType === SkillCostType.Mana;
    }

    public getCostLabel(costType: SkillCostType): string {
        let result = '??';

        if (costType === SkillCostType.Life) {
            result = 'Life';
        } else if (costType === SkillCostType.Mana) {
            result = 'Mana';
        } else if (costType === SkillCostType.LifeLock) {
            result = '% Life Locked';
        } else if (costType === SkillCostType.ManaLock) {
            result = '% Mana Locked';
        } else if (costType === SkillCostType.LifeSecond) {
            result = 'Mana per Second';
        } else if (costType === SkillCostType.ManaSecond) {
            result = 'Mana per Second';
        }

        return result;
    }

    public getGenresLabel(genres: Array<SkillGenre>): string {
        return genres.map(genre => {
            let result = null;

            if (genre === SkillGenre.Aoe) {
                result = 'Area of Effect';
            } else if (genre === SkillGenre.Aura) {
                result = 'Aura';
            } else if (genre === SkillGenre.Melee) {
                result = 'Melee';
            } else if (genre === SkillGenre.Minion) {
                result = 'Minion';
            } else if (genre === SkillGenre.Movement) {
                result = 'Movement';
            } else if (genre === SkillGenre.Projectile) {
                result = 'Projectile';
            } else if (genre === SkillGenre.Special) {
                result = 'Special';
            } else if (genre === SkillGenre.Totem) {
                result = 'Totem';
            }

            return result;
        }).join(', ');
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
