import { Injectable } from '@angular/core';

import { ItemAffix } from '../model/affix';
import { AttributeEnchantment } from '../model/attribute-enchantment';
import { Attribute } from '../model/enum/attribute';
import { EquippableItemBase } from '../model/enum/equippable-item-base';
import { HeroClass } from '../model/enum/hero-class';
import { Rarity } from '../model/enum/rarity';
import { ReaperSmith } from '../model/enum/reaper-smith';
import { EquipableItem as EquippableItem } from '../model/equipable-item';
import { GameEnchantment, GameEquippableItem, GameItem, GameRessourceItem } from '../model/game/game-item';
import { ReaperEnchantment } from '../model/reaper-enchantment';
import { SkillEnchantment } from '../model/skill-enchantment';
import { compare, compareRarities, compareString, isNotNullOrUndefined, valueOrDefault } from '../util/utils';
import { SlormancerItemAffixService } from './slormancer-item-affix.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerLegendaryEffectService } from './slormancer-legendary-effect.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerItemService {

    private readonly AFFIX_ORDER = ['life', 'mana', 'ret', 'cdr', 'crit', 'minion', 'atk_phy', 'atk_mag', 'def_dodge', 'def_mag', 'def_phy', 'adventure'];

    private readonly AFFIX_DEF_POSSIBLE = ['crit', 'ret', 'mana', 'cdr', 'life'];

    private readonly RARE_PREFIX = this.slormancerTemplateService.translate('RAR_loot_epic');

    private readonly REGEXP_REMOVE_GENRE = /(.*)\(.*\)/g;
    private readonly REGEXP_KEEP_GENRE = /.*\((.*)\)/g;

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerItemValueService : SlormancerItemValueService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerItemAffixService: SlormancerItemAffixService) { }

    public getEquipableItemBase(item: GameEquippableItem): EquippableItemBase {
        let slot: EquippableItemBase = EquippableItemBase.Helm;

        if (item !== null) {
            switch (item.slot) {
                case 0: slot = EquippableItemBase.Helm; break;
                case 1: slot = EquippableItemBase.Armor; break;
                case 2: slot = EquippableItemBase.Shoulder; break;
                case 3: slot = EquippableItemBase.Bracer; break;
                case 4: slot = EquippableItemBase.Glove; break;
                case 5: slot = EquippableItemBase.Boot; break;
                case 6: slot = EquippableItemBase.Ring; break;
                case 7: slot = EquippableItemBase.Amulet; break;
                case 8: slot = EquippableItemBase.Belt; break;
                case 9: slot = EquippableItemBase.Cape; break;
                default: 
                    console.error('Unexpected item slot ' + item.slot);
                    break;
            }
        }
        return slot;
    }

    public isEquipableItem(item: GameItem | null): item is GameEquippableItem {
        return item !== null && item.hasOwnProperty('slot');
    }

    public isRessourceItem(item: GameItem | null): item is GameRessourceItem {
        return item !== null && item.hasOwnProperty('quantity');
    }

    private getItemName(item: EquippableItem): string {
        const resultFragments: Array<string> = [];

        if (item.legendaryEffect !== null) {
            resultFragments.push(item.legendaryEffect.name);
        } else {
            let genre = 'MS';

            const normalAffixes = item.affixes.filter(affix => affix.rarity === Rarity.Normal);
            if (normalAffixes.length > 0) {
                const baseAffixes = <[string, string]>(<[ItemAffix, ItemAffix]>[
                    normalAffixes[0],
                    valueOrDefault(normalAffixes[1], normalAffixes[0])
                ])
                    .map(data => data.primaryNameType)
                    .sort((a, b) => compare(this.AFFIX_ORDER.indexOf(a), this.AFFIX_ORDER.indexOf(b)));
              
                const onDef = baseAffixes[1].startsWith('def') && this.AFFIX_DEF_POSSIBLE.indexOf(baseAffixes[0]) !== -1;

                const baseName = this.slormancerTemplateService.translate('PIECE_loot_' + item.base.toUpperCase() + '_' + baseAffixes[1]);
                resultFragments.push(baseName.replace(this.REGEXP_REMOVE_GENRE, '$1'));
                genre = baseName.replace(this.REGEXP_KEEP_GENRE, '$1');
                
                const baseAdj = this.slormancerTemplateService.translate('NAME_loot_adj_' + baseAffixes[0] + (onDef ? '_ON_DEF' : ''), genre);
                resultFragments.unshift(baseAdj);
            }
    
            const magicAffixes = item.affixes.filter(affix => affix.rarity === Rarity.Magic);
            if (magicAffixes[0]) {
                resultFragments.push(this.slormancerTemplateService.translate('SUF_loot_suf_' + magicAffixes[0].effect.stat));
            }
    
            const rareAffixes = item.affixes.filter(affix => affix.rarity === Rarity.Rare);
            if (rareAffixes[0]) {
                resultFragments.unshift(this.slormancerTemplateService.translate('PRE_loot_pre_' + rareAffixes[0].effect.stat));
            }

            if (item.rarity === Rarity.Epic) {
                resultFragments.unshift(this.RARE_PREFIX);
            }
    
        }

        if (item.reinforcment > 0) {
            resultFragments.push('+' + item.reinforcment);
        }

        return resultFragments.join(' ');
    }

    private getItemRarity(item: EquippableItem): Rarity {
        const rarities = item.affixes.map(affix => affix.rarity);
        let rarity = Rarity.Normal;

        if (item.legendaryEffect !== null) {
            rarity = Rarity.Legendary;
        } else if (rarities.indexOf(Rarity.Epic) !== -1) {
            rarity = Rarity.Epic;
        } else if (rarities.indexOf(Rarity.Rare) !== -1) {
            rarity = Rarity.Rare;
        } else if (rarities.indexOf(Rarity.Magic) !== -1) {
            rarity = Rarity.Magic;
        }

        return rarity;
    }

    private getItemIcon(item: EquippableItem): string {
        let base: string | null = null;

        if (item.legendaryEffect !== null) {
            base = item.legendaryEffect.itemIcon;
        } else {
            base = 'item/' + item.base + '/' + item.affixes
                .filter(affix => affix.rarity === Rarity.Normal)
                .map(affix => affix.primaryNameType)
                .sort()
                .join('-');
        }

        return base;
    }

    private getReaperEnchantment(gameEnchantment: GameEnchantment): ReaperEnchantment | null {
        return {
            type: gameEnchantment.type as ReaperSmith,
            values: this.slormancerItemValueService.computeReaperEnchantmentValues(),
            value: gameEnchantment.value,
            name: 'weapon_reapersmith_' + gameEnchantment.type,
            icon: 'enchantment/reaper'
        }
    }

    private getSkillEnchantment(gameEnchantment: GameEnchantment, heroClass: HeroClass): SkillEnchantment | null {
        return {
            type: gameEnchantment.type,
            values: this.slormancerItemValueService.computeSkillEnchantmentValues(),
            value: gameEnchantment.value,
            icon: 'enchantment/skill/' + heroClass + '/' + gameEnchantment.type
        };
    }

    private getAttributeEnchantment(gameEnchantment: GameEnchantment): AttributeEnchantment | null {
        return {
            type: gameEnchantment.type as Attribute,
            values: this.slormancerItemValueService.computeAttributeEnchantmentValues(),
            value: gameEnchantment.value,
            name: 'character_trait_' + gameEnchantment.type,
            icon: 'enchantment/attribute/' + gameEnchantment.type
        };
    }

    public getEquipableItem(item: GameEquippableItem, heroClass: HeroClass): EquippableItem {
        const base = this.getEquipableItemBase(item);
        const affixes = item.affixes
            .filter(affix => affix.rarity !== 'L')
            .map(affix => this.slormancerItemAffixService.getItemAffix(affix, item.level, item.reinforcment))
            .filter(isNotNullOrUndefined)
            .sort((a, b) => {
                const rarity = compareRarities(a.rarity, b.rarity);
                return rarity === 0 ? compareString(a.statLabel, b.statLabel) : rarity;
            });
        const legendaryAffix = item.affixes.find(affix => affix.rarity === 'L');        
        const reaperEnchantment = item.enchantments.find(c => c.target === 'RP');
        const skillEnchantment = item.enchantments.find(c => c.target === 'MA');
        const attributeEnchantment = item.enchantments.find(c => c.target === 'AT');

        const result = {
            base,
            affixes,
            legendaryEffect: legendaryAffix === undefined ? null : this.slormancerLegendaryEffectService.getExtendedLegendaryEffect(legendaryAffix),
            level: item.level,
            reinforcment: item.reinforcment,
            reaperEnchantment: reaperEnchantment ? this.getReaperEnchantment(reaperEnchantment) : null,
            skillEnchantment: skillEnchantment ? this.getSkillEnchantment(skillEnchantment, heroClass) : null,
            attributeEnchantment: attributeEnchantment ? this.getAttributeEnchantment(attributeEnchantment) : null,
            heroClass,

            rarity: Rarity.Normal,
            name: '',
            baseLabel: '',
            rarityLabel: '',
            levelLabel: '',
            icon: '',
            itemIconBackground: ''
        };

        this.updateEquippableItem(result);

        return result;
    }

    public updateEquippableItem(item: EquippableItem) {


        item.rarity = this.getItemRarity(item);
        item.name = this.getItemName(item);
        item.baseLabel = this.slormancerTemplateService.translate('PIECE_' + item.base).replace(this.REGEXP_REMOVE_GENRE, '$1');
        item.rarityLabel = this.slormancerTemplateService.translate('RAR_loot_' + item.rarity);
        item.icon = this.getItemIcon(item);
        item.levelLabel = this.slormancerTemplateService.translate('lvl') + '. ' + item.level;
        item.itemIconBackground = 'background/bg-' + item.rarity;

        for (const affix of item.affixes) {
            affix.itemLevel = item.level;
            affix.reinforcment = item.reinforcment;

            this.slormancerItemAffixService.updateItemAffix(affix);
        }
    }
}