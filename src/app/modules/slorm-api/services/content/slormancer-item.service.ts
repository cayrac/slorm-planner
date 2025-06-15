import { Injectable } from '@angular/core';

import { Affix } from '../../model/content/affix';
import { AttributeEnchantment } from '../../model/content/attribute-enchantment';
import { Attribute } from '../../model/content/enum/attribute';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { EquipableItemBase } from '../../model/content/enum/equipable-item-base';
import { HeroClass } from '../../model/content/enum/hero-class';
import { Rarity } from '../../model/content/enum/rarity';
import { ReaperSmith } from '../../model/content/enum/reaper-smith';
import { EquipableItem, EquipableItem as EquippableItem } from '../../model/content/equipable-item';
import { GameDataStat } from '../../model/content/game/data/game-data-stat';
import { LegendaryEffect } from '../../model/content/legendary-effect';
import { ReaperEnchantment } from '../../model/content/reaper-enchantment';
import { SkillEnchantment } from '../../model/content/skill-enchantment';
import { GameEnchantment, GameEquippableItem, GameItem, GameRessourceItem } from '../../model/parser/game/game-item';
import { effectValueVariable } from '../../util/effect-value.util';
import {
    compare,
    compareRarities,
    compareString,
    firstValue,
    isNotNullOrUndefined,
    lastValue,
    valueOrDefault
} from '../../util/utils';
import { SlormancerAffixService } from './slormancer-affix.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerLegendaryEffectService } from './slormancer-legendary-effect.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerItemService {

    private readonly REAPER_ENCHANTMENT_LABEL: string;
    private readonly SKILL_ENCHANTMENT_LABEL: string;
    private readonly RARE_PREFIX: string;
    private readonly GRAFTS_LABEL: string;

    private readonly AFFIX_ORDER = ['life', 'mana', 'ret', 'cdr', 'crit', 'minion', 'atk_phy', 'atk_mag', 'def_dodge', 'def_mag', 'def_phy', 'adventure'];

    private readonly AFFIX_DEF_POSSIBLE = ['crit', 'ret', 'mana', 'cdr', 'life'];

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService : SlormancerTranslateService,
                private slormancerItemValueService : SlormancerItemValueService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerItemAffixService: SlormancerAffixService,
                private slormancerDataService: SlormancerDataService
    ) {
        this.REAPER_ENCHANTMENT_LABEL = this.slormancerTranslateService.translate('tt_RP_roll_item');
        this.SKILL_ENCHANTMENT_LABEL = this.slormancerTranslateService.translate('tt_MA_roll_item');
        this.RARE_PREFIX = this.slormancerTranslateService.translate('RAR_loot_epic');
        this.GRAFTS_LABEL = this.slormancerTranslateService.translate('nether_grafts');
    }

    public getEquipableItemBase(item: GameEquippableItem): EquipableItemBase {
        let slot: EquipableItemBase = EquipableItemBase.Helm;

        if (item !== null) {
            switch (item.slot) {
                case 0: slot = EquipableItemBase.Helm; break;
                case 1: slot = EquipableItemBase.Body; break;
                case 2: slot = EquipableItemBase.Shoulder; break;
                case 3: slot = EquipableItemBase.Bracer; break;
                case 4: slot = EquipableItemBase.Glove; break;
                case 5: slot = EquipableItemBase.Boot; break;
                case 6: slot = EquipableItemBase.Ring; break;
                case 7: slot = EquipableItemBase.Amulet; break;
                case 8: slot = EquipableItemBase.Belt; break;
                case 9: slot = EquipableItemBase.Cape; break;
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
                const baseAffixes = <[string, string]>(<[Affix, Affix]>[
                    normalAffixes[0],
                    valueOrDefault(normalAffixes[1], normalAffixes[0])
                ])
                    .map(data => data.primaryNameType)
                    .sort((a, b) => compare(this.AFFIX_ORDER.indexOf(a), this.AFFIX_ORDER.indexOf(b)));
              
                const onDef = baseAffixes[1].startsWith('def') && this.AFFIX_DEF_POSSIBLE.indexOf(baseAffixes[0]) !== -1;

                const baseName = this.slormancerTranslateService.translate('PIECE_loot_' + item.base.toUpperCase() + '_' + baseAffixes[1]);
                const textAndGenre = this.slormancerTranslateService.splitTextAndGenre(baseName);
                resultFragments.push(textAndGenre.text);
                genre = textAndGenre.genre;
                
                const baseAdj = this.slormancerTranslateService.translate('NAME_loot_adj_' + baseAffixes[0] + (onDef ? '_ON_DEF' : ''), genre);
                resultFragments.unshift(baseAdj);
            }
    
            const magicAffixes = item.affixes.filter(affix => affix.rarity === Rarity.Magic);
            if (magicAffixes[0]) {
                resultFragments.push(this.slormancerTranslateService.translate('SUF_loot_suf_' + magicAffixes[0].craftedEffect.effect.stat));
            }
    
            const rareAffixes = item.affixes.filter(affix => affix.rarity === Rarity.Rare);
            if (rareAffixes[0]) {
                resultFragments.unshift(this.slormancerTranslateService.translate('PRE_loot_pre_' + rareAffixes[0].craftedEffect.effect.stat));
            }

            if (item.rarity === Rarity.Epic) {
                resultFragments.unshift(this.RARE_PREFIX);
            }
    
        }

        if (item.reinforcement > 0) {
            resultFragments.push('+' + item.reinforcement);
        }

        return resultFragments.join(' ');
    }

    private getItemRarity(item: EquippableItem): Rarity {
        const rarities = item.affixes.map(affix => affix.rarity);
        let rarity = Rarity.Normal;

        if (item.level > 100) {
            rarity = Rarity.Neither;
        } else if (item.legendaryEffect !== null) {
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

        if (item.rarity === Rarity.Neither) {
            base = 'assets/img/icon/item/' + item.base + '/neither.png';
        } else if (item.legendaryEffect !== null) {
            base = item.legendaryEffect.itemIcon;
        } else {
            const affixes = item.affixes
                .filter(affix => affix.rarity === Rarity.Normal)
                .map(affix => affix.primaryNameType)
                .sort()
                .join('-');
            base = 'assets/img/icon/item/' + item.base + '/' + affixes + '.png';
        }

        return base;
    }

    private getReaperEnchantmentByGameEnchantment(gameEnchantment: GameEnchantment): ReaperEnchantment {
        return this.getReaperEnchantment(gameEnchantment.type as ReaperSmith, gameEnchantment.value);
    }

    private getSkillEnchantmentByGameEnchantment(gameEnchantment: GameEnchantment): SkillEnchantment {
        return this.getSkillEnchantment(gameEnchantment.type, gameEnchantment.value);
    }

    private getAttributeEnchantmentByGameEnchantment(gameEnchantment: GameEnchantment): AttributeEnchantment | null {
        return this.getAttributeEnchantment(gameEnchantment.type, gameEnchantment.value);
    }

    public getReaperEnchantmentClone(reaperEnchantment: ReaperEnchantment): ReaperEnchantment {
        return { ...reaperEnchantment };
    }

    public getReaperEnchantment(smith: ReaperSmith, value: number): ReaperEnchantment {
        return {
            craftedReaperSmith: smith,
            craftableValues: this.slormancerItemValueService.computeReaperEnchantmentValues(),
            craftedValue: value,
            effect: effectValueVariable(0, 0, EffectValueUpgradeType.Reinforcement, false, '', EffectValueValueType.Stat),
            label: '',
            icon: 'assets/img/icon/enchantment/reaper.png'
        }
    }

    public getSkillEnchantmentClone(skillEnchantment: SkillEnchantment): SkillEnchantment {
        return { ... skillEnchantment };
    }

    public getSkillEnchantment(skillId: number, value: number): SkillEnchantment {
        return {
            craftedSkill: skillId,
            craftableValues: this.slormancerItemValueService.computeSkillEnchantmentValues(),
            craftedValue: value,
            effect: effectValueVariable(0, 0, EffectValueUpgradeType.Reinforcement, false, '', EffectValueValueType.Stat),
            label: '',
            icon: ''
        };
    }

    public getAttributeEnchantmentClone(attributeEnchantment: AttributeEnchantment): AttributeEnchantment {
        return { ...attributeEnchantment };
    }

    public getAttributeEnchantment(attribute: Attribute, value: number): AttributeEnchantment {
        return {
            craftedAttribute: attribute,
            craftableValues: this.slormancerItemValueService.computeAttributeEnchantmentValues(),
            craftedValue: value,
            effect: effectValueVariable(0, 0, EffectValueUpgradeType.Reinforcement, false, '', EffectValueValueType.Stat),
            label: '',
            icon: ''
        };
    }

    public getEquipableItem(base: EquipableItemBase,
                            heroClass: HeroClass,
                            level: number,
                            affixes: Array<Affix>,
                            reinforcement: number = 0,
                            grafts: number = 0,
                            legendaryEffect: LegendaryEffect | null,
                            reaperEnchantment: ReaperEnchantment | null,
                            skillEnchantment: SkillEnchantment | null,
                            attributeEnchantment : AttributeEnchantment | null,
                            defensivestatsMultiplier: number): EquippableItem {
        
        if (legendaryEffect !== null) {
            legendaryEffect.reinforcement = reinforcement;
        }

        const result: EquipableItem = {
            base,
            affixes,
            legendaryEffect,
            level,
            reinforcement,
            grafts,
            reaperEnchantment,
            skillEnchantment,
            attributeEnchantment,
            heroClass,

            rarity: Rarity.Normal,
            name: '',
            baseLabel: '',
            rarityLabel: '',
            graftLabel: null,
            levelLabel: '',
            icon: '',
            itemIconBackground: ''
        };

        this.updateEquipableItemModel(result, defensivestatsMultiplier);
        this.updateEquipableItemView(result, defensivestatsMultiplier);

        return result;
    }

    public getEmptyEquipableItem(base: EquipableItemBase, heroClass: HeroClass, level: number, defensivestatsMultiplier: number): EquippableItem {
        const numberBasicstats = this.slormancerDataService.getBaseMaxBasicStat(base);
        const baseKey = <keyof GameDataStat>(base === EquipableItemBase.Body ? 'ARMOR' : base.toUpperCase());
        const affixes = this.slormancerDataService.getGameDataStats()
            .filter(gameData => gameData.MIN_LEVEL < level && gameData[baseKey] === 'P')
            .slice(0, numberBasicstats)
            .map(gameData => this.slormancerItemAffixService.getAffixFromStat(gameData.REF, level, 0, Rarity.Normal, 1000))
            .filter(isNotNullOrUndefined);
        
        const result: EquipableItem = {
            base,
            affixes,
            legendaryEffect: null,
            level,
            reinforcement: 0,
            grafts: 0,
            reaperEnchantment: null,
            skillEnchantment: null,
            attributeEnchantment: null,
            heroClass,

            rarity: Rarity.Normal,
            name: '',
            baseLabel: '',
            rarityLabel: '',
            levelLabel: '',
            graftLabel: null,
            icon: '',
            itemIconBackground: ''
        };

        this.updateEquipableItemModel(result, defensivestatsMultiplier);
        this.updateEquipableItemView(result, defensivestatsMultiplier);

        return result;
    }

    public getEquipableItemFromGame(item: GameEquippableItem, heroClass: HeroClass, defensivestatsMultiplier: number): EquippableItem {
        const base = this.getEquipableItemBase(item);
        const affixes = item.affixes
            .filter(affix => affix.rarity !== 'L')
            .map(affix => this.slormancerItemAffixService.getAffix(affix, item.level, item.reinforcement))
            .filter(isNotNullOrUndefined);
        const legendaryAffix = item.affixes.find(affix => affix.rarity === 'L');        
        const reaperEnchantment = item.enchantments.find(c => c.target === 'RP');
        const skillEnchantment = item.enchantments.find(c => c.target === 'MA');
        const attributeEnchantment = item.enchantments.find(c => c.target === 'AT');

        const result = {
            base,
            affixes,
            legendaryEffect: legendaryAffix === undefined ? null : this.slormancerLegendaryEffectService.getLegendaryEffect(legendaryAffix, item.reinforcement, heroClass),
            level: item.level,
            reinforcement: item.reinforcement,
            grafts: item.grafts,
            reaperEnchantment: reaperEnchantment ? this.getReaperEnchantmentByGameEnchantment(reaperEnchantment) : null,
            skillEnchantment: skillEnchantment ? this.getSkillEnchantmentByGameEnchantment(skillEnchantment) : null,
            attributeEnchantment: attributeEnchantment ? this.getAttributeEnchantmentByGameEnchantment(attributeEnchantment) : null,
            heroClass,

            rarity: Rarity.Normal,
            name: '',
            baseLabel: '',
            rarityLabel: '',
            levelLabel: '',
            graftLabel: null,
            icon: '',
            itemIconBackground: ''
        };

        this.updateEquipableItemModel(result, defensivestatsMultiplier);
        this.updateEquipableItemView(result, defensivestatsMultiplier);

        return result;
    }

    public updateEquipableItemModel(item: EquipableItem, defensivestatsMultiplier: number) {
        item.rarity = this.getItemRarity(item);

        defensivestatsMultiplier = item.base === EquipableItemBase.Ring ? defensivestatsMultiplier : 0;

        for (const affix of item.affixes) {
            affix.itemLevel = item.level;
            affix.reinforcement = item.reinforcement;

            this.slormancerItemAffixService.updateAffix(affix, affix.rarity === Rarity.Defensive ? defensivestatsMultiplier : 0);
        }

        if (item.legendaryEffect !== null) {
            item.legendaryEffect.reinforcement = item.reinforcement;
            this.slormancerLegendaryEffectService.updateLegendaryEffectModel(item.legendaryEffect);
        }

        if (item.reaperEnchantment !== null) {
            const value = valueOrDefault(item.reaperEnchantment.craftableValues[item.reaperEnchantment.craftedValue], 0);
            item.reaperEnchantment.effect.value = value
        }

        if (item.skillEnchantment !== null) {
            const value = valueOrDefault(item.skillEnchantment.craftableValues[item.skillEnchantment.craftedValue], 0);
            item.skillEnchantment.effect.value = value;
        }

        if (item.attributeEnchantment !== null) {
            const value = valueOrDefault(item.attributeEnchantment.craftableValues[item.attributeEnchantment.craftedValue], 0);
            item.attributeEnchantment.effect.value = value;
        }
    }

    public updateEquipableItemView(item: EquipableItem, defensivestatsMultiplier: number) {
        item.name = this.getItemName(item);
        item.baseLabel =  this.slormancerTranslateService.removeGenre(this.slormancerTranslateService.translate('PIECE_' + item.base));
        item.rarityLabel = this.slormancerTranslateService.translate('RAR_loot_' + item.rarity);
        item.icon = this.getItemIcon(item);
        item.levelLabel = this.slormancerTranslateService.translate('lvl') + '. ' + item.level;
        item.itemIconBackground = 'assets/img/background/bg-' + item.rarity + '.png';

        defensivestatsMultiplier = item.base === EquipableItemBase.Ring ? defensivestatsMultiplier : 0;

        for (const affix of item.affixes) {
            this.slormancerItemAffixService.updateAffix(affix, affix.rarity === Rarity.Defensive ? defensivestatsMultiplier : 0);
        }
        item.affixes.sort((a, b) => {
            const rarity = compareRarities(a.rarity, b.rarity);
            return rarity === 0 ? compareString(a.statLabel, b.statLabel) : rarity;
        });

        item.graftLabel = null;
        if (item.rarity === Rarity.Neither) {
            item.graftLabel = this.GRAFTS_LABEL + ' : ' + item.grafts;
        }

        if (item.legendaryEffect !== null) {
            this.slormancerLegendaryEffectService.updateLegendaryEffectView(item.legendaryEffect);
        }

        if (item.reaperEnchantment !== null) {
            item.reaperEnchantment.effect.stat = 'increased_reapersmith_' + item.reaperEnchantment.craftedReaperSmith + '_level';

            const smith = this.slormancerTranslateService.translate('weapon_reapersmith_' + item.reaperEnchantment.craftedReaperSmith);
            const min = valueOrDefault(firstValue(item.reaperEnchantment.craftableValues), 0);
            const max = valueOrDefault(lastValue(item.reaperEnchantment.craftableValues), 0);
            item.reaperEnchantment.label = this.slormancerTemplateService.getReaperEnchantmentLabel(this.REAPER_ENCHANTMENT_LABEL, item.reaperEnchantment.effect.value, min, max, smith);
        }

        if (item.skillEnchantment !== null) {
            item.skillEnchantment.effect.stat = 'increased_skill_' + item.skillEnchantment.craftedSkill + '_level';

            const skill = this.slormancerDataService.getGameDataSkill(item.heroClass, item.skillEnchantment.craftedSkill);
            const min = valueOrDefault(firstValue(item.skillEnchantment.craftableValues), 0);
            const max = valueOrDefault(lastValue(item.skillEnchantment.craftableValues), 0);
            item.skillEnchantment.label = this.slormancerTemplateService.getReaperEnchantmentLabel(this.SKILL_ENCHANTMENT_LABEL, item.skillEnchantment.effect.value, min, max, skill === null ? '??' : skill.LOCAL_NAME);
            item.skillEnchantment.icon = 'assets/img/icon/enchantment/skill/' + item.heroClass + '/' + item.skillEnchantment.craftedSkill + '.png';
        }

        if (item.attributeEnchantment !== null) {
            item.attributeEnchantment.effect.stat = 'increased_attribute_' + item.attributeEnchantment.craftedAttribute + '_level';

            const attributeName = this.slormancerTranslateService.translate('character_trait_' + item.attributeEnchantment.craftedAttribute);
            const min = valueOrDefault(firstValue(item.attributeEnchantment.craftableValues), 0);
            const max = valueOrDefault(lastValue(item.attributeEnchantment.craftableValues), 0);
            item.attributeEnchantment.label = this.slormancerTemplateService.getReaperEnchantmentLabel(this.SKILL_ENCHANTMENT_LABEL, item.attributeEnchantment.effect.value, min, max, attributeName);
            item.attributeEnchantment.icon = 'assets/img/icon/enchantment/attribute/' + item.attributeEnchantment.craftedAttribute + '.png';
        }
    }

    public getEquipableItemClone(item: EquipableItem): EquipableItem {
        return {
            ...item,
            affixes: item.affixes.map(affix => this.slormancerItemAffixService.getAffixClone(affix)),
            reaperEnchantment: item.reaperEnchantment === null ? null : { ...item.reaperEnchantment },
            skillEnchantment: item.skillEnchantment === null ? null : { ...item.skillEnchantment },
            attributeEnchantment: item.attributeEnchantment === null ? null : { ...item.attributeEnchantment },
            legendaryEffect: item.legendaryEffect === null ? null : this.slormancerLegendaryEffectService.getLegendaryEffectClone(item.legendaryEffect)
        };
    }

    public getDefensiveStatMultiplier(legendaryEffects: LegendaryEffect[]): number {
        let result = 0;

        const defendersTwin = legendaryEffects.find(legendaryEffect => legendaryEffect.id === 151);
        if (defendersTwin) {
            result = defendersTwin.effects[0]?.effect.displayValue as number;
        }
        
        return result;
    }
}