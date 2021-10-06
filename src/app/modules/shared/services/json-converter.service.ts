import { Injectable } from '@angular/core';

import { Character, CharacterSkillAndUpgrades } from '../../slormancer/model/character';
import { Activable } from '../../slormancer/model/content/activable';
import { AncestralLegacy } from '../../slormancer/model/content/ancestral-legacy';
import { Attribute } from '../../slormancer/model/content/enum/attribute';
import { EquipableItemBase } from '../../slormancer/model/content/enum/equipable-item-base';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { Rarity } from '../../slormancer/model/content/enum/rarity';
import { EquipableItem } from '../../slormancer/model/content/equipable-item';
import { Reaper } from '../../slormancer/model/content/reaper';
import { SlormancerAffixService } from '../../slormancer/services/content/slormancer-affix.service';
import { SlormancerDataService } from '../../slormancer/services/content/slormancer-data.service';
import { SlormancerItemService } from '../../slormancer/services/content/slormancer-item.service';
import { SlormancerLegendaryEffectService } from '../../slormancer/services/content/slormancer-legendary-effect.service';
import { SlormancerReaperService } from '../../slormancer/services/content/slormancer-reaper.service';
import { SlormancerCharacterBuilderService } from '../../slormancer/services/slormancer-character-builder.service';
import { round } from '../../slormancer/util/math.util';
import { isNotNullOrUndefined, valueOrDefault } from '../../slormancer/util/utils';
import { JsonAncestralLegacy } from '../model/json/json-ancestral-legacy';
import { JsonCharacter } from '../model/json/json-character';
import { JsonItem } from '../model/json/json-item';
import { JsonLayer } from '../model/json/json-layer';
import { JsonPlanner } from '../model/json/json-planner';
import { JsonReaper } from '../model/json/json-reaper';
import { JsonSkill } from '../model/json/json-skill';
import { Layer } from '../model/layer';
import { Planner } from '../model/planner';
import { SharedData } from '../model/shared-data';

@Injectable({ providedIn: 'root' })
export class JsonConverterService {

    private readonly STAT_MAPPING: { [key: number]: string };
    private readonly REVERSE_STAT_MAPPING: { [key: string]: number };

    private readonly RARITY_MAPPING: Array<{ rarity: Rarity, mapping: number }> = [
        { rarity: Rarity.Normal, mapping: 0 },
        { rarity: Rarity.Magic, mapping: 1 },
        { rarity: Rarity.Rare, mapping: 2 },
        { rarity: Rarity.Epic, mapping: 3 },
        { rarity: Rarity.Legendary, mapping: 4 }
    ];

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private slormancerItemService: SlormancerItemService,
                private slormancerLegendaryService: SlormancerLegendaryEffectService,
                private slormancerAffixService: SlormancerAffixService,
                private slormancerReaperService: SlormancerReaperService) {
        this.STAT_MAPPING = {};
        this.REVERSE_STAT_MAPPING = {};

        for (const stat of slormancerDataService.getGameDataStats()) {
            this.STAT_MAPPING[stat.REF_NB] = stat.REF;
            this.REVERSE_STAT_MAPPING[stat.REF] = stat.REF_NB;
        }
    }

    private rarityToNumber(rarity: Rarity): number {
        const result = this.RARITY_MAPPING.find(m => m.rarity === rarity);
        return result ? result.mapping : 0;
    }

    private numberToRarity(rarity: number): Rarity {
        const result = this.RARITY_MAPPING.find(m => m.mapping === rarity);
        return result ? result.rarity : Rarity.Normal;
    }
    
    private itemToJson(item: EquipableItem | null, requireBase: boolean): JsonItem | null {
        return item === null ? null : {
            base: requireBase ? item.base : null,
            level: item.level,
            reinforcment: item.reinforcment,
            affixes: item.affixes.map(aff => ({ rarity: this.rarityToNumber(aff.rarity), pure: aff.pure === 100 ? 0 : aff.pure, stat: valueOrDefault(this.REVERSE_STAT_MAPPING[aff.craftedEffect.effect.stat], 0), craftedValue: aff.craftedEffect.craftedValue })),
            legendaryEffect: item.legendaryEffect === null ? null : { craftedValue: item.legendaryEffect.value , id: item.legendaryEffect.id },
            reaperEnchantment: item.reaperEnchantment === null ? null : { craftedValue: item.reaperEnchantment.craftedValue, reaperSmith: item.reaperEnchantment.craftedReaperSmith },
            skillEnchantment: item.skillEnchantment === null ? null : { craftedValue: item.skillEnchantment.craftedValue, skill: item.skillEnchantment.craftedSkill },
            attributeEnchantment: item.attributeEnchantment === null ? null : { craftedValue: item.attributeEnchantment.craftedValue, attribute: item.attributeEnchantment.craftedAttribute }
        }
    }

    private ancestralLegacyToJson(ancestralLegacy: AncestralLegacy): JsonAncestralLegacy {
        return  {
            id: ancestralLegacy.id,
            rank: ancestralLegacy.rank
        };
    }

    private reaperToJson(reaper: Reaper): JsonReaper {
        return {
            id: reaper.id,
            level: reaper.baseInfo.level,
            primordialLevel: reaper.primordialInfo.level,
            kills: reaper.baseInfo.kills,
            primordialKills: reaper.primordialInfo.kills,
            primordial: reaper.primordial ? 1 : 0
        };
    }

    private skillToJson(skill: CharacterSkillAndUpgrades, onlyEquipped: boolean = false): JsonSkill {
        return {
            id: skill.skill.id,
            rank: skill.skill.level,
            upgrades: skill.upgrades
                .map(upgrade => ({ id: upgrade.id, rank: upgrade.rank, selected: skill.selectedUpgrades.indexOf(upgrade.id) !== -1 ? 1 : 0 }))
                .filter(upgrade => !onlyEquipped || upgrade.selected),
        };
    }

    private getActivableId(activable: AncestralLegacy | Activable | null): number | null {
        let result: number | null = null;

        if (activable !== null) {
            if ('isActivable' in activable) {
                result = activable.id;
            } else {
                result = 200 + activable.id;
            }
        }

        return result;
    }

    public characterToJson(character: Character): JsonCharacter {
        return {
            type: 'c',
            level: character.level,
            version: character.version,
            heroClass: character.heroClass,
            gear: {
                helm: this.itemToJson(character.gear.helm, false),
                body: this.itemToJson(character.gear.body, false),
                shoulder: this.itemToJson(character.gear.shoulder, false),
                bracer: this.itemToJson(character.gear.bracer, false),
                glove: this.itemToJson(character.gear.glove, false),
                boot: this.itemToJson(character.gear.boot, false),
                ring_l: this.itemToJson(character.gear.ring_l, false),
                ring_r: this.itemToJson(character.gear.ring_r, false),
                amulet: this.itemToJson(character.gear.amulet, false),
                belt: this.itemToJson(character.gear.belt, false),
                cape: this.itemToJson(character.gear.cape, false)
            },
            inventory: character.inventory.map(item => this.itemToJson(item, true)),
            sharedInventory: character.sharedInventory.map(inv => inv.map(item => this.itemToJson(item, true))),
        
            ancestralLegacies: {
                ancestralLegacies: character.ancestralLegacies.ancestralLegacies.map(ancestralLegacy => this.ancestralLegacyToJson(ancestralLegacy)),
                nodes: character.ancestralLegacies.activeNodes,
                maxNodes: character.ancestralLegacies.maxAncestralLegacy
            },
                
            reaper: this.reaperToJson(character.reaper),
        
            skills: character.skills.map(skill => this.skillToJson(skill)),
        
            attributes: {
                [Attribute.Toughness]: character.attributes.allocated[Attribute.Toughness].rank,
                [Attribute.Savagery]: character.attributes.allocated[Attribute.Savagery].rank,
                [Attribute.Fury]: character.attributes.allocated[Attribute.Fury].rank,
                [Attribute.Determination]: character.attributes.allocated[Attribute.Determination].rank,
                [Attribute.Zeal]: character.attributes.allocated[Attribute.Zeal].rank,
                [Attribute.Willpower]: character.attributes.allocated[Attribute.Willpower].rank,
                [Attribute.Dexterity]: character.attributes.allocated[Attribute.Dexterity].rank,
                [Attribute.Bravery]: character.attributes.allocated[Attribute.Bravery].rank,
            },
        
            support: character.supportSkill === null ? null : character.supportSkill.id,
            primary: character.primarySkill === null ? null : character.primarySkill.id,
            secondary: character.secondarySkill === null ? null : character.secondarySkill.id,
            activable1: this.getActivableId(character.activable1),
            activable2: this.getActivableId(character.activable2),
            activable3: this.getActivableId(character.activable3),
            activable4: this.getActivableId(character.activable4)
        };
    }

    public characterToMinimalJson(character: Character): JsonCharacter {
        return {
            type: 'c',
            level: character.level,
            version: character.version,
            heroClass: character.heroClass,
            gear: {
                helm: this.itemToJson(character.gear.helm, false),
                body: this.itemToJson(character.gear.body, false),
                shoulder: this.itemToJson(character.gear.shoulder, false),
                bracer: this.itemToJson(character.gear.bracer, false),
                glove: this.itemToJson(character.gear.glove, false),
                boot: this.itemToJson(character.gear.boot, false),
                ring_l: this.itemToJson(character.gear.ring_l, false),
                ring_r: this.itemToJson(character.gear.ring_r, false),
                amulet: this.itemToJson(character.gear.amulet, false),
                belt: this.itemToJson(character.gear.belt, false),
                cape: this.itemToJson(character.gear.cape, false)
            },
            inventory: null,
            sharedInventory: null,
        
            ancestralLegacies: {
                ancestralLegacies: character.ancestralLegacies.ancestralLegacies
                    .filter(ancestralLegacy => character.ancestralLegacies.activeAncestralLegacies.indexOf(ancestralLegacy.id) !== -1)
                    .map(ancestralLegacy => this.ancestralLegacyToJson(ancestralLegacy)),
                nodes: character.ancestralLegacies.activeNodes,
                maxNodes: character.ancestralLegacies.maxAncestralLegacy
            },
                
            reaper: this.reaperToJson(character.reaper),
        
            skills: character.skills
                .filter(skill => skill.skill === character.supportSkill || skill.skill === character.primarySkill || skill.skill === character.secondarySkill)
                .map(skill => this.skillToJson(skill, true)),
                
            attributes: {
                [Attribute.Toughness]: character.attributes.allocated[Attribute.Toughness].rank,
                [Attribute.Savagery]: character.attributes.allocated[Attribute.Savagery].rank,
                [Attribute.Fury]: character.attributes.allocated[Attribute.Fury].rank,
                [Attribute.Determination]: character.attributes.allocated[Attribute.Determination].rank,
                [Attribute.Zeal]: character.attributes.allocated[Attribute.Zeal].rank,
                [Attribute.Willpower]: character.attributes.allocated[Attribute.Willpower].rank,
                [Attribute.Dexterity]: character.attributes.allocated[Attribute.Dexterity].rank,
                [Attribute.Bravery]: character.attributes.allocated[Attribute.Bravery].rank,
            },
        
            support: character.supportSkill === null ?  null : character.supportSkill.id,
            primary: character.primarySkill === null ?  null : character.primarySkill.id,
            secondary: character.secondarySkill === null ?  null : character.secondarySkill.id,
            activable1: this.getActivableId(character.activable1),
            activable2: this.getActivableId(character.activable2),
            activable3: this.getActivableId(character.activable3),
            activable4: this.getActivableId(character.activable4)
        }
    }

    public layerToJson(layer: Layer): JsonLayer {
        return {
            type: 'l',
            character: this.characterToJson(layer.character),
            name: layer.name
        };
    }

    public plannerToJson(planner: Planner): JsonPlanner {
        return {
            type: 'p',
            heroClass: planner.heroClass,
            layers: planner.layers.map(layer => this.layerToJson(layer))
        };
    }

    private jsonToItem(item: JsonItem | null, heroClass: HeroClass, forcedBase: EquipableItemBase | null = null): EquipableItem | null {
        let result: EquipableItem | null = null;
        
        if (item !== null) {
            const affixes = item.affixes
                .map(affix => this.slormancerAffixService.getAffixFromStat(<string>this.STAT_MAPPING[affix.stat], item.level, item.reinforcment, this.numberToRarity(affix.rarity), affix.craftedValue, affix.pure))
                .filter(isNotNullOrUndefined);
            
                let base = forcedBase;
            if (base === null) {
                base = item.base === null ? EquipableItemBase.Amulet : item.base;
            }

            let legendaryEffect = item.legendaryEffect === null ? null : this.slormancerLegendaryService.getLegendaryEffectById(item.legendaryEffect.id, item.legendaryEffect.craftedValue, item.reinforcment, heroClass);
            let reaperEnchantment = item.reaperEnchantment === null ? null : this.slormancerItemService.getReaperEnchantment(item.reaperEnchantment.reaperSmith, item.reaperEnchantment.craftedValue);
            let skillEnchantment = item.skillEnchantment === null ? null : this.slormancerItemService.getSkillEnchantment(item.skillEnchantment.skill, item.skillEnchantment.craftedValue);
            let attributeEnchantment = item.attributeEnchantment === null ? null : this.slormancerItemService.getAttributeEnchantment(item.attributeEnchantment.attribute, item.attributeEnchantment.craftedValue);

            result = this.slormancerItemService.getEquipableItem(base, heroClass, item.level, affixes, item.reinforcment, legendaryEffect, reaperEnchantment, skillEnchantment, attributeEnchantment);
        }

        return result;
    }

    public jsonToCharacter(character: JsonCharacter): Character {
        const reaper = this.slormancerReaperService.getReaperById(
            character.reaper.id,
            character.heroClass,
            character.reaper.primordial === 1,
            character.reaper.level,
            character.reaper.primordialLevel,
            character.reaper.kills,
            character.reaper.primordialKills);

        const ancestralRanks = this.slormancerDataService.getGameDataAncestralLegacyIds()
            .map((_, index) => character.ancestralLegacies.ancestralLegacies.find(a => a.id === index))
            .map(a => a ? a.rank : 0);
        const skillRanks = this.slormancerDataService.getGameDataSkills(character.heroClass)
            .map((_, index) => {
                let rank = 0;

                const skill = character.skills.find(skill => skill.id === index);
                if (skill) {
                    rank = round(skill.rank);
                } else {
                    const upgrade = character.skills.map(skill => skill.upgrades).flat()
                        .find(upgrade => upgrade.id === index);
                    if (upgrade) {
                        rank = upgrade.rank;
                    }
                }
                
                return rank; 
            });
        const skillEquipped = this.slormancerDataService.getGameDataSkills(character.heroClass)
            .map((_, index) => {
                const upgrade = character.skills.map(skill => skill.upgrades).flat()
                    .find(upgrade => upgrade.id === index);
                return upgrade ? upgrade.selected : 0; 
            });
        
        const result = this.slormancerCharacterBuilderService.getCharacter(
            character.heroClass,
            character.level,
            character.version,
            reaper,
            character.ancestralLegacies.nodes,
            ancestralRanks,
            skillEquipped,
            skillRanks,
            character.ancestralLegacies.maxNodes,
            this.jsonToItem(character.gear.helm, character.heroClass, EquipableItemBase.Helm),
            this.jsonToItem(character.gear.body, character.heroClass, EquipableItemBase.Body),
            this.jsonToItem(character.gear.shoulder, character.heroClass, EquipableItemBase.Shoulder),
            this.jsonToItem(character.gear.bracer, character.heroClass, EquipableItemBase.Bracer),
            this.jsonToItem(character.gear.glove, character.heroClass, EquipableItemBase.Glove),
            this.jsonToItem(character.gear.boot, character.heroClass, EquipableItemBase.Boot),
            this.jsonToItem(character.gear.ring_l, character.heroClass, EquipableItemBase.Ring),
            this.jsonToItem(character.gear.ring_r, character.heroClass, EquipableItemBase.Ring),
            this.jsonToItem(character.gear.amulet, character.heroClass, EquipableItemBase.Amulet),
            this.jsonToItem(character.gear.belt, character.heroClass, EquipableItemBase.Belt),
            this.jsonToItem(character.gear.cape, character.heroClass, EquipableItemBase.Cape),
            character.inventory === null ? null : character.inventory.map(item => this.jsonToItem(item, character.heroClass, null)),
            character.sharedInventory === null ? null : character.sharedInventory.map(items => items.map(item => this.jsonToItem(item, character.heroClass, null))),
            character.attributes[Attribute.Toughness],
            character.attributes[Attribute.Savagery],
            character.attributes[Attribute.Fury],
            character.attributes[Attribute.Determination],
            character.attributes[Attribute.Zeal],
            character.attributes[Attribute.Willpower],
            character.attributes[Attribute.Dexterity],
            character.attributes[Attribute.Bravery],
            character.primary,
            character.secondary,
            character.support,
            character.activable1,
            character.activable2,
            character.activable3,
            character.activable4
        );
        
        return result;
    }

    public jsonToLayer(layer: JsonLayer): Layer {
        return {
            name: layer.name,
            character: this.jsonToCharacter(layer.character)
        }
    }

    public jsonToPlanner(planner: JsonPlanner): Planner {
        return {
            heroClass: planner.heroClass,
            layers: planner.layers.map(layer => this.jsonToLayer(layer))
        };
    }

    public jsonToSharedData(json: JsonPlanner | JsonLayer | JsonCharacter): SharedData {
        return {
            character: json.type === 'c' ? this.jsonToCharacter(json) : null,
            layer: json.type === 'l' ? this.jsonToLayer(json) : null,
            planner: json.type === 'p' ? this.jsonToPlanner(json) : null
        };
    }

}