import { Injectable } from '@angular/core';

import { Affix } from '../model/affix';
import { AttributeEnchantment } from '../model/attribute-enchantment';
import { DataEquipableItemType } from '../model/data/data-equipable-item-type';
import { Attribute } from '../model/enum/attribute';
import { EquipableItemType } from '../model/enum/equipable-item-type';
import { Rarity } from '../model/enum/rarity';
import { ReaperSmith } from '../model/enum/reaper-smith';
import { EquipableItem } from '../model/equipable-item';
import { GameAffix, GameEnchantment, GameEquippableItem, GameItem, GameRessourceItem } from '../model/game/game-item';
import { GameRarity } from '../model/game/game-rarity';
import { ReaperEnchantment } from '../model/reaper-enchantment';
import { SkillEnchantment } from '../model/skill-enchantment';
import { compare, compareRarities, isNotNullOrUndefined } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerLegendaryEffectService } from './slormancer-legendary-effect.service';

@Injectable()
export class SlormancerItemService {

    constructor(private slormancerItemValueService : SlormancerItemValueService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerDataService: SlormancerDataService) { }

    public getEquipableItemType(item: GameEquippableItem): EquipableItemType {
        let slot: EquipableItemType = EquipableItemType.Helm;

        if (item !== null) {
            switch (item.slot) {
                case 0: slot = EquipableItemType.Helm; break;
                case 1: slot = EquipableItemType.Armor; break;
                case 2: slot = EquipableItemType.Shoulders; break;
                case 3: slot = EquipableItemType.Bracers; break;
                case 4: slot = EquipableItemType.Gloves; break;
                case 5: slot = EquipableItemType.Boots; break;
                case 6: slot = EquipableItemType.Ring; break;
                case 7: slot = EquipableItemType.Amulet; break;
                case 8: slot = EquipableItemType.Belt; break;
                case 9: slot = EquipableItemType.Cape; break;
                default: 
                    console.error('Unexpected item slot ' + item.slot);
                    break;
            }
        }
        return slot;
    }

    private getRarity(rarity: GameRarity): Rarity {
        let result: Rarity;

        if (rarity === 'N') {
            result = Rarity.Normal;
        } else if (rarity === 'M') {
            result = Rarity.Magic;
        } else if (rarity === 'R') {
            result = Rarity.Rare;
        } else if (rarity === 'E') {
            result = Rarity.Epic;
        } else {
            result = Rarity.Legendary;
        }

        return result;
    }

    public isEquipableItem(item: GameItem | null): item is GameEquippableItem {
        return item !== null && item.hasOwnProperty('slot');
    }

    public isRessourceItem(item: GameItem | null): item is GameRessourceItem {
        return item !== null && item.hasOwnProperty('quantity');
    }

    public getAffix(item: GameEquippableItem, affix: GameAffix): Affix | null {
        const stat = this.slormancerDataService.getGameDataStat(affix);

        const result: Affix | null = {
            rarity: this.getRarity(affix.rarity),
            name: '??',
            values: { [affix.value] : 0 },
            min: affix.value,
            value: affix.value,
            max: affix.value,
            percent: false,
            suffix: '??',
            locked: affix.locked
        };

        if (stat !== null) {
            const affixData = this.slormancerDataService.getDataAffix(affix);

            result.values = this.slormancerItemValueService.getAffixValues(item.level, item.reinforcment, stat?.SCORE, stat?.PERCENT === '%', affix.rarity);
            result.percent = stat.PERCENT === '%';
            
            const keys = Object.keys(result.values).map(k => parseInt(k));
            const minValue = keys[0];
            const maxValue = keys[keys.length - 1];

            result.min = minValue ? minValue : affix.value;
            result.max = maxValue ? maxValue : affix.value;

            if (affixData) {
                result.name = affixData.name;
                result.suffix = affixData.suffix;
            } else {
                result.name = stat.REF;
                console.error('No affix data found for ', stat.REF)
            }
        }

        return result;
    }

    private getItemName(type: EquipableItemType, base: string, rarity: Rarity, item: GameEquippableItem): string {
        let name = '??';
        const legendaryAffix = item.affixes.find(affix => affix.rarity === 'L');
        const reinforcment: string | null = item.reinforcment > 0 ? '+' + item.reinforcment : null;

        if (legendaryAffix !== undefined) {
            const legendaryData = this.slormancerDataService.getGameDataLegendary(legendaryAffix.type);
            name = legendaryData === null ? 'unknown legendary' : legendaryData.EN_NAME;
        } else {
            let baseName = base;
            let rarityPrefix: string | null = null;
            let suffix: string | null = null;
            let prefix: string | null = null;
            let data: DataEquipableItemType | null = null;

            if (rarity === Rarity.Epic) {
                rarityPrefix = 'epic';
            }
         
            data = this.slormancerDataService.getDataEquipableItem(type, base);
    
            if (data !== null) {
                baseName = data.name;
            }
    
            const magicAffixes = item.affixes.filter(affix => affix.rarity === 'M');
            if (magicAffixes[0]) {
                const affixData = this.slormancerDataService.getDataAffix(magicAffixes[0]);
                
                if (affixData !== null) {
                    suffix = affixData.suffix;
                }
            }
    
            const rareAffixes = item.affixes.filter(affix => affix.rarity === 'R');
            if (rareAffixes[0]) {
                const affixData = this.slormancerDataService.getDataAffix(rareAffixes[0]);
                
                if (affixData !== null) {
                    prefix = affixData.prefix;
                }
            }
    
            name = [rarityPrefix, prefix, baseName, suffix, reinforcment].filter(isNotNullOrUndefined).join(' ');
        }

        return [name, reinforcment].filter(isNotNullOrUndefined).join(' ');
    }

    private getItemRarity(item: GameEquippableItem): Rarity {
        const rarities = item.affixes.map(affix => affix.rarity);
        let rarity = Rarity.Normal;

        if (rarities.indexOf('E') !== -1) {
            rarity = Rarity.Epic;
        } else if (rarities.indexOf('R') !== -1) {
            rarity = Rarity.Rare;
        } else if (rarities.indexOf('M') !== -1) {
            rarity = Rarity.Magic;
        }

        return rarity;
    }

    private getItembase(item: GameEquippableItem): string {
        let base: string | null = null;
        const normalAffixes = item.affixes
            .filter(affix => affix.rarity === 'N')
            .map(affix => this.slormancerDataService.getGameDataStat(affix))
            .filter(isNotNullOrUndefined)
            .map(stat => stat.PRIMARY_NAME_TYPE);
        const legendaryAffix = item.affixes.find(affix => affix.rarity === 'L');

        if (legendaryAffix) {
            const gameData = this.slormancerDataService.getGameDataLegendary(legendaryAffix.type);
            if (gameData !== null) {
                base = this.slormancerDataService.getBaseFromLegendaryId(gameData.REF);

                if (base === null) {
                    base = '' + gameData.SPRITE;
                }
            }
        }
        
        if (base === null) {
            base = normalAffixes.sort().join('-');
        }

        return base;
    }

    private getReaperEnchantment(gameEnchantment: GameEnchantment): ReaperEnchantment | null {
        return {
            type: gameEnchantment.type as ReaperSmith,
            values: this.slormancerItemValueService.computeReaperEnchantmentValues(),
            value: gameEnchantment.value,
            name: 'weapon_reapersmith_' + gameEnchantment.type,
            icon: 'reaper_enchantment'
        }
    }

    private getSkillEnchantment(gameEnchantment: GameEnchantment): SkillEnchantment | null {
        return {
            type: gameEnchantment.type,
            values: this.slormancerItemValueService.computeSkillEnchantmentValues(),
            value: gameEnchantment.value,
            icon: 'skill_enchantment_' + gameEnchantment.type
        };
    }

    private getAttributeEnchantment(gameEnchantment: GameEnchantment): AttributeEnchantment | null {
        return {
            type: gameEnchantment.type as Attribute,
            values: this.slormancerItemValueService.computeAttributeEnchantmentValues(),
            value: gameEnchantment.value,
            name: 'character_trait_' + gameEnchantment.type,
            icon: 'attribute_enchantment_' + gameEnchantment.type
        };
    }

    public getExtendedEquipableItem(item: GameEquippableItem): EquipableItem {
        const type = this.getEquipableItemType(item);
        const rarity = this.getItemRarity(item);
        const base = this.getItembase(item);
        const name = this.getItemName(type, base, rarity, item);
        const affixes = item.affixes
            .filter(affix => affix.rarity !== 'L')
            .map(affix => this.getAffix(item, affix))
            .filter(isNotNullOrUndefined)
            .sort((a, b) => {
                const rarity = compareRarities(a.rarity, b.rarity);
                return rarity === 0 ? compare(a.name, b.name) : rarity;
            });
        const legendaryAffix = item.affixes.find(affix => affix.rarity === 'L');        
        const reaperEnchantment = item.enchantments.find(c => c.target === 'RP');
        const skillEnchantment = item.enchantments.find(c => c.target === 'MA');
        const attributeEnchantment = item.enchantments.find(c => c.target === 'AT');

        return {
            type,
            name,
            base,
            rarity,
            affixes,
            legendaryEffect: legendaryAffix === undefined ? null : this.slormancerLegendaryEffectService.getExtendedLegendaryEffect(legendaryAffix),
            level: item.level,
            reinforcment: item.reinforcment,
            reaperEnchantment: reaperEnchantment ? this.getReaperEnchantment(reaperEnchantment) : null,
            skillEnchantment: skillEnchantment ? this.getSkillEnchantment(skillEnchantment) : null,
            attributeEnchantment: attributeEnchantment ? this.getAttributeEnchantment(attributeEnchantment) : null,
        };
    }
}