import { Injectable } from '@angular/core';

import { Affix } from '../model/affix';
import { AttributeEnchantment } from '../model/attribute-enchantment';
import { Attribute } from '../model/enum/attribute';
import { EquipableItemType } from '../model/enum/equipable-item-type';
import { Rarity } from '../model/enum/rarity';
import { ReaperSmith } from '../model/enum/reaper-smith';
import { EquipableItem } from '../model/equipable-item';
import { GameDataStat } from '../model/game/data/game-data-stat';
import { GameAffix, GameEnchantment, GameEquippableItem, GameItem, GameRessourceItem } from '../model/game/game-item';
import { GameRarity } from '../model/game/game-rarity';
import { ReaperEnchantment } from '../model/reaper-enchantment';
import { SkillEnchantment } from '../model/skill-enchantment';
import { compare, compareRarities, compareString, isNotNullOrUndefined, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerLegendaryEffectService } from './slormancer-legendary-effect.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerItemService {

    private readonly AFFIX_ORDER = ['life', 'mana', 'ret', 'cdr', 'crit', 'minion', 'atk_phy', 'atk_mag', 'def_dodge', 'def_mag', 'def_phy', 'adventure'];

    private readonly AFFIX_DEF_POSSIBLE = ['crit', 'ret', 'mana', 'cdr', 'life'];

    private readonly RARE_PREFIX = this.slormancerTemplateService.translate('RAR_loot_epic');

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerItemValueService : SlormancerItemValueService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerDataService: SlormancerDataService) { }

    public getEquipableItemType(item: GameEquippableItem): EquipableItemType {
        let slot: EquipableItemType = EquipableItemType.Helm;

        if (item !== null) {
            switch (item.slot) {
                case 0: slot = EquipableItemType.Helm; break;
                case 1: slot = EquipableItemType.Armor; break;
                case 2: slot = EquipableItemType.Shoulder; break;
                case 3: slot = EquipableItemType.Bracer; break;
                case 4: slot = EquipableItemType.Glove; break;
                case 5: slot = EquipableItemType.Boot; break;
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

    private getAffix(item: GameEquippableItem, affix: GameAffix): Affix | null {
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
            locked: affix.locked,
            pure: affix.pure
        };

        if (stat !== null) {
            const affixData = this.slormancerDataService.getDataAffix(affix);

            result.values = this.slormancerItemValueService.getAffixValues(item.level, item.reinforcment, stat?.SCORE, stat?.PERCENT === '%', affix.rarity, affix.pure);
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

    private getItemNameFragment(key: string, onDef: boolean = false, genre: string | null = null): string {
        let result: string;

        const keyOnDef = key + (onDef ? '_ON_DEF' : '');
        result = this.slormancerTemplateService.translate(keyOnDef, genre);

        if (onDef && result === keyOnDef) {
            console.log('DEF not found for ' + key);
            result = this.slormancerTemplateService.translate(key, genre);
        } else if (onDef) {
            console.log('DEF found for ' + key);
        }

        return result;
    }

    private getItemName(type: EquipableItemType, base: string, rarity: Rarity, item: GameEquippableItem): string {
        const resultFragments: Array<string> = [];

        const legendaryAffix = valueOrNull(item.affixes.find(affix => affix.rarity === 'L'));
        if (legendaryAffix !== null) {
            const legendaryData = this.slormancerDataService.getGameDataLegendary(legendaryAffix.type);
            if (legendaryData !== null) {
                resultFragments.push(legendaryData.EN_NAME);
            }
        } else {
            let genre = 'MS';

            const normalAffixes = item.affixes.filter(affix => affix.rarity === 'N');
            if (normalAffixes.length > 0) {
                const baseAffixes = <[string, string]>(<[GameAffix, GameAffix]>[
                    normalAffixes[0],
                    valueOrDefault(normalAffixes[1], normalAffixes[0])
                ])
                    .map(affix => <GameDataStat>this.slormancerDataService.getGameDataStat(affix))
                    .map(data => data.PRIMARY_NAME_TYPE)
                    .sort((a, b) => compare(this.AFFIX_ORDER.indexOf(a), this.AFFIX_ORDER.indexOf(b)));
              
                const onDef = baseAffixes[1].startsWith('def') && this.AFFIX_DEF_POSSIBLE.indexOf(baseAffixes[0]) !== -1;

                const baseName = this.getItemNameFragment('PIECE_loot_' + type.toUpperCase() + '_' + baseAffixes[1]);
                resultFragments.push(baseName.replace(/(.*)\(.*\)/g, '$1'));
                genre = baseName.replace(/.*\((.*)\)/g, '$1');
                
                const baseAdj = this.getItemNameFragment('NAME_loot_adj_' + baseAffixes[0], onDef, genre);
                resultFragments.unshift(baseAdj);
            }
    
            const magicAffixes = item.affixes.filter(affix => affix.rarity === 'M');
            if (magicAffixes[0]) {
                const gameDataSuffix = this.slormancerDataService.getGameDataStat(magicAffixes[0]);

                if (gameDataSuffix !== null) {
                    resultFragments.push(this.slormancerTemplateService.translate('SUF_loot_suf_' + gameDataSuffix.REF))
                }
            }
    
            const rareAffixes = item.affixes.filter(affix => affix.rarity === 'R');
            if (rareAffixes[0]) {
                const gameDataPrefix = this.slormancerDataService.getGameDataStat(rareAffixes[0]);
                
                if (gameDataPrefix !== null) {
                    resultFragments.unshift(this.slormancerTemplateService.translate('PRE_loot_pre_' + gameDataPrefix.REF))
                }
            }

            if (rarity === Rarity.Epic) {
                resultFragments.unshift(this.RARE_PREFIX);
            }
    
        }

        if (item.reinforcment > 0) {
            resultFragments.push('+' + item.reinforcment);
        }

        return resultFragments.join(' ');
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
            icon: 'enchantment/reaper'
        }
    }

    private getSkillEnchantment(gameEnchantment: GameEnchantment): SkillEnchantment | null {
        return {
            type: gameEnchantment.type,
            values: this.slormancerItemValueService.computeSkillEnchantmentValues(),
            value: gameEnchantment.value,
            icon: 'enchantment/skill/{class}/' + gameEnchantment.type
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

    public getEquipableItem(item: GameEquippableItem): EquipableItem {
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
                return rarity === 0 ? compareString(a.name, b.name) : rarity;
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