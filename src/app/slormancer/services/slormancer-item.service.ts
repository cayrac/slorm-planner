import { Injectable } from '@angular/core';

import { Affix } from '../model/affix';
import { AttributeEnchantment } from '../model/attribute-enchantment';
import { DataEquipableItemType } from '../model/data/data-equipable-item-type';
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
import { compare, compareRarities, compareString, isNotNullOrUndefined, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerLegendaryEffectService } from './slormancer-legendary-effect.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerItemService {

    private readonly AFFIX_ORDER = ['life', 'mana', 'ret', 'cdr', 'crit', 'minion', 'atk_phy', 'atk_mag', 'def_dodge', 'def_mag', 'def_phy', 'adventure'];

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

        if (result === keyOnDef) {
            // console.log('rollback def');
            result = this.slormancerTemplateService.translate(key, genre);
        }

        return result;
    }

    private getItemName(type: EquipableItemType, base: string, rarity: Rarity, item: GameEquippableItem): string {
        let name = '??';
        let newName = '??';
        let otherNewName = '??';
        const legendaryAffix = valueOrNull(item.affixes.find(affix => affix.rarity === 'L'));
        const reinforcment: string | null = item.reinforcment > 0 ? '+' + item.reinforcment : null;
        let add = '';

        let baseAffixes: [GameDataStat, GameDataStat] | null = null;

        if (legendaryAffix !== null) {
            const legendaryData = this.slormancerDataService.getGameDataLegendary(legendaryAffix.type);
            name = legendaryData === null ? 'legandary_' + legendaryAffix.type : legendaryData.EN_NAME;
            newName = name;
            otherNewName = name;
        } else {
            let baseName = base;
            let rarityPrefix: string | null = null;
            let suffix: string | null = null;
            let prefix: string | null = null;
            let data: DataEquipableItemType | null = null;
            const nameSegments = [];
            const reverseNameSegments = [];

            data = this.slormancerDataService.getDataEquipableItem(type, base);
    
            if (data !== null) {
                baseName = data.name;
            }

            let genre = 'MS';

            const normalAffixes = item.affixes.filter(affix => affix.rarity === 'N');
            if (normalAffixes.length > 0) {
                baseAffixes = <[GameDataStat, GameDataStat]>(<[GameAffix, GameAffix]>[
                    normalAffixes[0],
                    normalAffixes[1] ? normalAffixes[1] : normalAffixes[0]
                ]).map(affix => this.slormancerDataService.getGameDataStat(affix))
                  .sort((a, b) => compare(a ? this.AFFIX_ORDER.indexOf(a.PRIMARY_NAME_TYPE) : 0, b ? this.AFFIX_ORDER.indexOf(b.PRIMARY_NAME_TYPE) : 0));
              
                const onDef = baseAffixes[1].PRIMARY_NAME_TYPE.startsWith('def');

                const baseName = this.getItemNameFragment('PIECE_loot_' + type.toUpperCase() + '_' + baseAffixes[1].PRIMARY_NAME_TYPE);
                nameSegments.push(baseName.replace(/(.*)\(.*\)/g, '$1'));
                genre = baseName.replace(/.*\((.*)\)/g, '$1');
                
                const baseAdj = this.getItemNameFragment('NAME_loot_adj_' + baseAffixes[0].PRIMARY_NAME_TYPE, onDef, genre);
                nameSegments.unshift(baseAdj);

              
                const revonDef = baseAffixes[0].PRIMARY_NAME_TYPE.startsWith('def');

                const revbaseName = this.getItemNameFragment('PIECE_loot_' + type.toUpperCase() + '_' + baseAffixes[0].PRIMARY_NAME_TYPE);
                reverseNameSegments.push(revbaseName.replace(/(.*)\(.*\)/g, '$1'));
                genre = baseName.replace(/.*\((.*)\)/g, '$1');
                
                const revbaseAdj = this.getItemNameFragment('NAME_loot_adj_' + baseAffixes[1].PRIMARY_NAME_TYPE, revonDef, genre);
                reverseNameSegments.unshift(revbaseAdj);


                
                add = baseAffixes.map(a => a.PRIMARY_NAME_TYPE).join(' ') + ' ' + (onDef ? 'DEF' : 'NODEF');
            }
    
            const magicAffixes = item.affixes.filter(affix => affix.rarity === 'M');
            if (magicAffixes[0]) {
                const gameDataSuffix = this.slormancerDataService.getGameDataStat(magicAffixes[0]);
                const affixData = this.slormancerDataService.getDataAffix(magicAffixes[0]);
                
                if (affixData !== null) {
                    suffix = affixData.suffix;
                }

                if (gameDataSuffix !== null) {
                    nameSegments.push(this.slormancerTemplateService.translate('SUF_loot_suf_' + gameDataSuffix.REF))
                    reverseNameSegments.push(this.slormancerTemplateService.translate('SUF_loot_suf_' + gameDataSuffix.REF))
                }
            }
    
            const rareAffixes = item.affixes.filter(affix => affix.rarity === 'R');
            if (rareAffixes[0]) {
                const gameDataPrefix = this.slormancerDataService.getGameDataStat(rareAffixes[0]);
                const affixData = this.slormancerDataService.getDataAffix(rareAffixes[0]);
                
                if (affixData !== null) {
                    prefix = affixData.prefix;
                }

                if (gameDataPrefix !== null) {
                    nameSegments.unshift(this.slormancerTemplateService.translate('PRE_loot_pre_' + gameDataPrefix.REF))
                    reverseNameSegments.unshift(this.slormancerTemplateService.translate('PRE_loot_pre_' + gameDataPrefix.REF))
                }
                
            }


            if (rarity === Rarity.Epic) {
                rarityPrefix = this.RARE_PREFIX;
                nameSegments.unshift(this.RARE_PREFIX);
                reverseNameSegments.unshift(this.RARE_PREFIX);
            }
    
            name = [rarityPrefix, prefix, baseName, suffix, reinforcment].filter(isNotNullOrUndefined).join(' ');
            newName = nameSegments.filter(isNotNullOrUndefined).join(' ')
            otherNewName = reverseNameSegments.filter(isNotNullOrUndefined).join(' ')
        }

        if (baseAffixes !== null && name.toLowerCase() !== newName.toLowerCase()) {
            console.log('Comparaisons : ', baseAffixes);

            /*
                "REF_NB": 90,
                "CATEGORY": "defense",
                "PRIMARY_NAME_TYPE": "def_alt",
                "REF": "reduced_damage_from_all_percent",
            */
            const sortByRefNb = [...baseAffixes].sort((a, b) => compare(a.REF_NB, b.REF_NB));
            const sortByCategory = [...baseAffixes].sort((a, b) => compareString(a.CATEGORY, b.CATEGORY));
            const sortByPrimary = [...baseAffixes].sort((a, b) => compareString(a.PRIMARY_NAME_TYPE, b.PRIMARY_NAME_TYPE));
            const sortByRef = [...baseAffixes].sort((a, b) => compareString(a.REF, b.REF));
            const newIsGood = name.toLowerCase() === newName.toLowerCase();

            console.log(baseAffixes.map(a => a.PRIMARY_NAME_TYPE).join('-'));

            if (newIsGood === (sortByRefNb[0] === baseAffixes[0])) {
                console.log('REF_NB ASC    : ', baseAffixes[0].REF_NB, '-', baseAffixes[1].REF_NB);
            } else {
                console.log('REF_NB DESC   : ', baseAffixes[1].REF_NB, '-', baseAffixes[0].REF_NB);
            }

            if (newIsGood === (sortByCategory[0] === baseAffixes[0])) {
                console.log('CATEGORY ASC  : ', baseAffixes[0].CATEGORY, '-', baseAffixes[1].CATEGORY);
            } else {
                console.log('CATEGORY DESC : ', baseAffixes[1].CATEGORY, '-', baseAffixes[0].CATEGORY);
            }

            if (newIsGood === (sortByPrimary[0] === baseAffixes[0])) {
                console.log('PRIMARY ASC   : ', baseAffixes[0].PRIMARY_NAME_TYPE, '-', baseAffixes[1].PRIMARY_NAME_TYPE);
            } else {
                console.log('PRIMARY DESC  : ', baseAffixes[1].PRIMARY_NAME_TYPE, '-', baseAffixes[0].PRIMARY_NAME_TYPE);
            }

            if (newIsGood === (sortByRef[0] === baseAffixes[0])) {
                console.log('REF ASC       : ', baseAffixes[0].REF, '-', baseAffixes[1].REF);
            } else {
                console.log('REF DESC      : ', baseAffixes[1].REF, '-', baseAffixes[0].REF);
            }
        }


        return [name, reinforcment].filter(isNotNullOrUndefined).join(' ') + '<br/>'
             + [newName, reinforcment].filter(isNotNullOrUndefined).join(' ') + '<br/>'
             + [otherNewName, reinforcment].filter(isNotNullOrUndefined).join(' ') + '<br/>' + add;
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