import { Component, Inject } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Affix } from '../../../slormancer/model/content/affix';
import { EquipableItem } from '../../../slormancer/model/content/equipable-item';
import { LegendaryEffect } from '../../../slormancer/model/content/legendary-effect';
import { SlormancerItemService } from '../../../slormancer/services/content/slormancer-item.service';

export interface ItemEditModalData {
    item: EquipableItem;
    baseLocked: boolean;
    maxLevel: number;
}

/*

    base: EquipableItemBase;
    rarity: Rarity;
    level: number;
    reinforcment: number;
    affixes: Array<Affix>;
    legendaryEffect: LegendaryEffect | null;
    reaperEnchantment: ReaperEnchantment | null;
    skillEnchantment: SkillEnchantment | null;
    attributeEnchantment: AttributeEnchantment | null;
    heroClass: HeroClass;

    name: string;
    baseLabel: string;
    rarityLabel: string;
    levelLabel: string;
    icon: string;
    itemIconBackground: string
    */

@Component({
  selector: 'app-item-edit-modal',
  templateUrl: './item-edit-modal.component.html',
  styleUrls: ['./item-edit-modal.component.scss']
})
export class ItemEditModalComponent {

    public readonly originalItem: EquipableItem;

    public readonly item: EquipableItem;

    public readonly baseLocked: boolean;

    public readonly maxLevel: number;

    public readonly form: FormGroup;

    constructor(public dialogRef: MatDialogRef<ItemEditModalComponent>,
                private slormancerItemService: SlormancerItemService,
                @Inject(MAT_DIALOG_DATA) public data: ItemEditModalData
                ) {
        this.originalItem = data.item;
        this.item = this.slormancerItemService.getEquipableItemClone(data.item);
        this.baseLocked = data.baseLocked;
        this.maxLevel = data.maxLevel;

        this.form = this.itemToForm(this.item);

        this.slormancerItemService.updateEquippableItem(this.item);
    }

    /*
    
    primaryNameType: string;
    rarity: Rarity;
    pure: number;
    itemLevel: number;
    reinforcment: number;
    locked: boolean;

    craftedEffect: CraftableEffect<EffectValueConstant>;

    isPure: boolean;
    valueLabel: string;
    statLabel: string;
    */

    private affixToForm(affix: Affix): FormGroup {
        return new FormGroup({
            rarity: new FormControl(affix.rarity),
            pure: new FormControl(affix.isPure),
            value: new FormControl(affix.craftedEffect.craftedValue),
            purity: new FormControl(affix.pure),
            stat: new FormControl(affix.craftedEffect.effect.stat)
        })
    }

    private legendaryEffectToForm(legendaryEffect: LegendaryEffect | null): FormGroup {
        return new FormGroup({
            id: new FormControl(legendaryEffect === null ? null : legendaryEffect.id),
            value: new FormControl(legendaryEffect === null ? 100 : legendaryEffect.value)
        })
    }

    private itemToForm(item: EquipableItem): FormGroup {
        return new FormGroup({
            level: new FormControl(item.level),
            base: new FormControl(item.base),
            reinforcment: new FormControl(item.reinforcment),
            affixes: new FormArray(item.affixes.map(affix => this.affixToForm(affix))),
            legendaryEffect: this.legendaryEffectToForm(item.legendaryEffect),
            reaper: new FormGroup({
                smith: new FormControl(item.reaperEnchantment === null ? null : item.reaperEnchantment.craftedReaperSmith),
                value: new FormControl(item.reaperEnchantment === null ? 5 : item.reaperEnchantment.craftedValue)
            }),
            skill: new FormGroup({
                skill: new FormControl(item.skillEnchantment === null ? null : item.skillEnchantment.craftedSkill),
                value: new FormControl(item.skillEnchantment === null ? 2 : item.skillEnchantment.craftedValue)
            }),
            attribute: new FormGroup({
                attribute: new FormControl(item.attributeEnchantment === null ? null : item.attributeEnchantment.craftedAttribute),
                value: new FormControl(item.attributeEnchantment === null ? 2 : item.attributeEnchantment.craftedValue)
            })
        })
    }

    public submit() {
        this.dialogRef.close(this.item);
    }
}
