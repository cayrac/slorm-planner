import { Injectable } from '@angular/core';

import { Character, CharacterSkillAndUpgrades } from '../../slormancer/model/character';
import { Activable } from '../../slormancer/model/content/activable';
import { AncestralLegacy } from '../../slormancer/model/content/ancestral-legacy';
import { Attribute } from '../../slormancer/model/content/enum/attribute';
import { EquipableItem } from '../../slormancer/model/content/equipable-item';
import { Reaper } from '../../slormancer/model/content/reaper';
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

@Injectable()
export class JsonConverterService {

    private itemToJson(item: EquipableItem | null): JsonItem | null {
        return item === null ? null : {
            ba: item.base,
            rar: item.rarity,
            lvl: item.level,
            up: item.reinforcment,
            aff: item.affixes.map(aff => ({ r: aff.rarity, p: aff.pure, s: aff.craftedEffect.effect.stat, c: aff.craftedEffect.craftedValue })),
            leg: item.legendaryEffect === null ? null : { c: item.legendaryEffect.value , id: item.legendaryEffect.id },
            rea: item.reaperEnchantment === null ? null : { c: item.reaperEnchantment.craftedValue, r: item.reaperEnchantment.craftedReaperSmith },
            ski: item.skillEnchantment === null ? null : { c: item.skillEnchantment.craftedValue, s: item.skillEnchantment.craftedSkill },
            att: item.attributeEnchantment === null ? null : { c: item.attributeEnchantment.craftedValue, a: item.attributeEnchantment.craftedAttribute }
        }
    }

    private ancestralLegacyToJson(ancestralLegacy: AncestralLegacy): JsonAncestralLegacy {
        return  {
            id: ancestralLegacy.id,
            ra: ancestralLegacy.rank
        };
    }

    private reaperToJson(reaper: Reaper | null): JsonReaper | null {
        return reaper === null ? null : {
            id: reaper.id,
            lvl: reaper.baseInfo.level,
            prilvl: reaper.primordialInfo.level,
            kil: reaper.baseInfo.kills,
            prikil: reaper.primordialInfo.kills,
            pri: reaper.primordial
        };
    }

    private skillToJson(skill: CharacterSkillAndUpgrades): JsonSkill {
        return {
            id: skill.skill.id,
            ra: skill.skill.level,
            up: skill.upgrades.map(upgrade => ({ id: upgrade.id, ra: upgrade.rank, s: skill.selectedUpgrades.indexOf(upgrade.id) !== -1 })),
        };
    }

    private getActivableId(activable: AncestralLegacy | Activable | null): number | null{
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
            t: 'c',
            hc: character.heroClass,
            gear: {
                helm: this.itemToJson(character.gear.helm),
                body: this.itemToJson(character.gear.body),
                shoulder: this.itemToJson(character.gear.shoulder),
                bracer: this.itemToJson(character.gear.bracer),
                glove: this.itemToJson(character.gear.glove),
                boot: this.itemToJson(character.gear.boot),
                ring_l: this.itemToJson(character.gear.ring_l),
                ring_r: this.itemToJson(character.gear.ring_r),
                amulet: this.itemToJson(character.gear.amulet),
                belt: this.itemToJson(character.gear.belt),
                cape: this.itemToJson(character.gear.cape)
            },
            inv: character.inventory.map(item => this.itemToJson(item)),
            sta: character.sharedInventory.map(inv => inv.map(item => this.itemToJson(item))),
        
            al: {
                al: character.ancestralLegacies.ancestralLegacies.map(ancestralLegacy => this.ancestralLegacyToJson(ancestralLegacy)),
                nodes: character.ancestralLegacies.activeNodes
            },
                
            rea: this.reaperToJson(character.reaper),
        
            skl: character.skills.map(skill => this.skillToJson(skill)),
        
            att: {
                [Attribute.Toughness]: character.attributes.allocated[Attribute.Toughness].rank,
                [Attribute.Savagery]: character.attributes.allocated[Attribute.Savagery].rank,
                [Attribute.Fury]: character.attributes.allocated[Attribute.Fury].rank,
                [Attribute.Determination]: character.attributes.allocated[Attribute.Determination].rank,
                [Attribute.Zeal]: character.attributes.allocated[Attribute.Zeal].rank,
                [Attribute.Willpower]: character.attributes.allocated[Attribute.Willpower].rank,
                [Attribute.Dexterity]: character.attributes.allocated[Attribute.Dexterity].rank,
                [Attribute.Bravery]: character.attributes.allocated[Attribute.Bravery].rank,
            },
        
            pri: character.primarySkill === null ? null : character.primarySkill.id,
            sec: character.secondarySkill === null ? null : character.secondarySkill.id,
            act1: this.getActivableId(character.activable1),
            act2: this.getActivableId(character.activable2),
            act3: this.getActivableId(character.activable3),
            act4: this.getActivableId(character.activable4)
        }
    }

    public layerToJson(layer: Layer): JsonLayer {
        return {
            type: 'l',
            ch: this.characterToJson(layer.character),
            na: layer.name
        };
    }

    public plannerToJson(planner: Planner): JsonPlanner {
        return {
            type: 'p',
            cl: planner.heroClass,
            la: planner.layers.map(layer => this.layerToJson(layer))
        };
    }


    public jsonToSharedData(content: any): SharedData {
        let sharedData = {
            character: null,
            layer: null,
            planner: null,
        }

        return sharedData;
    }

}