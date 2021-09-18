import { Injectable } from '@angular/core';

import { Attribute } from '../../slormancer/model/content/enum/attribute';
import { EquipableItemBase } from '../../slormancer/model/content/enum/equipable-item-base';
import { isNotNullOrUndefined } from '../../slormancer/util/utils';
import { JsonAncestralLegacy } from '../model/json/json-ancestral-legacy';
import { JsonCharacter } from '../model/json/json-character';
import { JsonItem } from '../model/json/json-item';
import { JsonLayer } from '../model/json/json-layer';
import { JsonPlanner } from '../model/json/json-planner';
import { JsonReaper } from '../model/json/json-reaper';
import { JsonSharedData } from '../model/json/json-shared-data';
import { JsonSkill } from '../model/json/json-skill';

@Injectable()
export class JsonCompresserService {
   
    private readonly ARRAY_START  = '[';
    private readonly ARRAY_END  = ']';
    private readonly ARRAY_VALUES_SEPARATOR = '|';

    private readonly OBJECT_START  = '{';
    private readonly OBJECT_END  = '}';
    private readonly OBJECT_VALUES_SEPARATOR = ',';

    private surroundObject(value: string | null): string | null {
        return value === null ? null : this.OBJECT_START + value + this.OBJECT_END
    }

    private formatObject(values: Array<number | string | null>, surround: boolean = true): string | null {
        return values.length === 0 ? null : values.map(value => value === null ? '' : value).join(this.OBJECT_VALUES_SEPARATOR);
    }

    private formatArray(values: Array<number | string | null>): string | null {
        return values.length === 0 ? null : 
            this.ARRAY_START + values.map(value => value === null ? '' : value).join(this.ARRAY_VALUES_SEPARATOR) + this.ARRAY_END;
    }

    private compressItem(item: JsonItem | null): string | null {
        let values: Array<number | string | null> = [];

        if (item !== null) {
            values = [
                item.base,
                item.level,
                item.reinforcment,
                this.formatArray(item.affixes.map(a => this.formatObject([a.rarity, a.pure, a.stat, a.craftedValue]))),
                item.legendaryEffect === null ? null : item.legendaryEffect.id,
                item.legendaryEffect === null ? null : item.legendaryEffect.craftedValue,
                item.reaperEnchantment === null ? null : item.reaperEnchantment.reaperSmith,
                item.reaperEnchantment === null ? null : item.reaperEnchantment.craftedValue,
                item.skillEnchantment === null ? null : item.skillEnchantment.skill,
                item.skillEnchantment === null ? null : item.skillEnchantment.craftedValue,
                item.attributeEnchantment === null ? null : item.attributeEnchantment.attribute,
                item.attributeEnchantment === null ? null : item.attributeEnchantment.craftedValue,
            ];
        }

        return this.formatObject(values);
    }

    private compressSkill(skill: JsonSkill | null): string | null {
        return skill === null ? null : this.formatObject([
            skill.id,
            skill.rank,
            this.formatArray(skill.upgrades.map(u => this.formatObject([u.id, u.rank, u.selected])))
        ]);
    }

    private compressAncestralLegacy(ancestralLegacy: JsonAncestralLegacy): string | null {
        return ancestralLegacy === null ? null : this.formatObject([ancestralLegacy.id, ancestralLegacy.rank]);
    }

    public compressCharacter(character: JsonCharacter): string {
        const values: Array<number | string | null> = [
            character.heroClass,
            character.level,
            this.surroundObject(this.compressItem(character.gear.helm)),
            this.surroundObject(this.compressItem(character.gear.body)),
            this.surroundObject(this.compressItem(character.gear.shoulder)),
            this.surroundObject(this.compressItem(character.gear.bracer)),
            this.surroundObject(this.compressItem(character.gear.glove)),
            this.surroundObject(this.compressItem(character.gear.boot)),
            this.surroundObject(this.compressItem(character.gear.ring_l)),
            this.surroundObject(this.compressItem(character.gear.ring_r)),
            this.surroundObject(this.compressItem(character.gear.amulet)),
            this.surroundObject(this.compressItem(character.gear.belt)),
            this.surroundObject(this.compressItem(character.gear.cape)),
            character.inventory === null ? null : this.formatArray(character.inventory.map(item => this.compressItem(item))),
            character.sharedInventory === null ? null : this.formatArray(character.sharedInventory.map(inv => this.formatArray(inv.map(item => this.compressItem(item))))),
            this.formatArray(character.ancestralLegacies.ancestralLegacies.map(a => this.compressAncestralLegacy(a))),
            this.formatArray(character.ancestralLegacies.nodes),
            character.ancestralLegacies.maxNodes,
            character.reaper === null ? null : this.surroundObject(this.formatObject([character.reaper.id, character.reaper.level, character.reaper.kills, character.reaper.primordialLevel, character.reaper.primordialKills, character.reaper.primordial])),
            character.skills === null ? null : this.formatArray(character.skills.map(skill => this.compressSkill(skill)).filter(isNotNullOrUndefined)),
            character.attributes[Attribute.Toughness],
            character.attributes[Attribute.Savagery],
            character.attributes[Attribute.Fury],
            character.attributes[Attribute.Determination],
            character.attributes[Attribute.Zeal],
            character.attributes[Attribute.Willpower],
            character.attributes[Attribute.Dexterity],
            character.attributes[Attribute.Bravery],
            character.support === null ? null : typeof character.support === 'number' ? character.support : this.surroundObject(this.compressSkill(character.support)),
            character.primary === null ? null : typeof character.primary === 'number' ? character.primary : this.surroundObject(this.compressSkill(character.primary)),
            character.secondary === null ? null : typeof character.secondary === 'number' ? character.secondary : this.surroundObject(this.compressSkill(character.secondary)),
            character.activable1 === null ? null : character.activable1,
            character.activable2 === null ? null : character.activable2,
            character.activable3 === null ? null : character.activable3,
            character.activable4 === null ? null : character.activable4
        ];

        return  character.type + ':' + character.version + ':' + this.surroundObject(this.formatObject(values));
    }

    public compressLayer(layer: JsonLayer): string {
        return  layer.type + ':' + this.formatObject([btoa(layer.name), this.compressCharacter(layer.character)])
    }

    public compressPlanner(planner: JsonPlanner): string {
        return  planner.type + ':' + this.formatObject([planner.heroClass, this.formatArray(planner.layers.map(layer => this.compressLayer(layer)))])
    }

    public decompress(content: string): JsonSharedData {
        let result: JsonSharedData = {
            character: null,
            layer: null,
            planner: null
        };

        if (content.startsWith('c:')) {
            result.character = this.decompressCharacter(content);
        } else if (content.startsWith('l:')) {
            result.layer = this.decompressLayer(content);
        } else if (content.startsWith('p:')) {
            result.planner = this.decompressPlanner(content);
        }

        return result;
    }

    private splitData(content: string, separator: string): Array<string> {
        let result: Array<string> = [];

        if (content.length > 0) {
            let arrayLevel = 0;
            let objectLevel = 0;
            let buff = '';
            result = [];

            for (let i = 0, len = content.length; i < len; i++) {
                const char = <string>content[i];

                if (char === this.ARRAY_START) {
                    arrayLevel++;
                } else if (char === this.ARRAY_END) {
                    arrayLevel--;
                } else if (char === this.OBJECT_START) {
                    objectLevel++;
                } else if (char === this.OBJECT_END) {
                    objectLevel--;
                }

                if ((char !== separator || arrayLevel > 0 || objectLevel > 0)) {
                    buff += char;
                } else {
                    result.push(buff);
                    buff = '';
                }
            }
            result.push(buff);
        }

        return result;
    }

    private removeSurround(value: string): string {
        return value.substr(1, value.length - 2);
    }
    
    private decompressPlanner(planner: string): JsonPlanner {
        const data = planner.split(':').slice(1).join(':');
        const splitData = this.splitData(data, this.OBJECT_VALUES_SEPARATOR);
        console.log('decompress planner : ', splitData);
        return {
            type: 'p',
            heroClass: parseInt(<string>splitData[0]),
            layers: this.splitData(this.removeSurround(<string>splitData[1]), this.ARRAY_VALUES_SEPARATOR).map(layer => this.decompressLayer(layer))
        }
    }

    private decompressItem(content: string): JsonItem | null {
        let result: JsonItem | null = null;

        if (content.length > 0) {
            const splitData = this.splitData(content, this.OBJECT_VALUES_SEPARATOR);
            let index = 0;
            result = {
                base: splitData[index++] ? <EquipableItemBase>splitData[index - 1] : null,
                level: parseInt(<string>splitData[index++]),
                reinforcment: parseInt(<string>splitData[index++]),
                affixes: this.splitData(this.removeSurround(<string>splitData[index++]), this.ARRAY_VALUES_SEPARATOR).map(affix => {
                    const splittedAffix = this.splitData(affix, this.OBJECT_VALUES_SEPARATOR);
                    let indexAffix = 0;
                    return {
                        rarity: parseInt(<string>splittedAffix[indexAffix++]),
                        pure: parseInt(<string>splittedAffix[indexAffix++]),
                        stat: parseInt(<string>splittedAffix[indexAffix++]),
                        craftedValue: parseInt(<string>splittedAffix[indexAffix++]),
                    };
                    
                }),
                legendaryEffect: null,
                reaperEnchantment: null,
                skillEnchantment: null,
                attributeEnchantment: null,
            }
            const legId = splitData[index++] ? parseInt(<string>splitData[index - 1]) : null;
            const legCraft = splitData[index++] ? parseInt(<string>splitData[index - 1]) : null;
            const reaperId = splitData[index++] ? parseInt(<string>splitData[index - 1]) : null;
            const reaperCraft = splitData[index++] ? parseInt(<string>splitData[index - 1]) : null;
            const skillId = splitData[index++] ? parseInt(<string>splitData[index - 1]) : null;
            const skillCraft = splitData[index++] ? parseInt(<string>splitData[index - 1]) : null;
            const attributeId = splitData[index++] ? parseInt(<string>splitData[index - 1]) : null;
            const attributeCraft = splitData[index++] ? parseInt(<string>splitData[index - 1]) : null;

            if (legId !== null && legCraft !== null) {
                result.legendaryEffect = {
                    id: legId,
                    craftedValue: legCraft
                }
            }
            if (reaperId !== null && reaperCraft !== null) {
                result.reaperEnchantment = {
                    reaperSmith: reaperId,
                    craftedValue: reaperCraft
                }
            }
            if (skillId !== null && skillCraft !== null) {
                result.skillEnchantment = {
                    skill: skillId,
                    craftedValue: skillCraft
                }
            }
            if (attributeId !== null && attributeCraft !== null) {
                result.attributeEnchantment = {
                    attribute: attributeId,
                    craftedValue: attributeCraft
                }
            }
        }

        return result;
    }

    private decompressAncestralLegacy(content: string): JsonAncestralLegacy {
        const splitData = this.splitData(content, this.OBJECT_VALUES_SEPARATOR);
        let index = 0;
        return {
            id: parseInt(<string>splitData[index++]),
            rank: parseInt(<string>splitData[index++])
        }
    }

    private decompressReaper(content: string): JsonReaper | null {
        let result: JsonReaper | null = null;

        if (content.length > 0) {
            const splitData = this.splitData(content, this.OBJECT_VALUES_SEPARATOR);
            let index = 0;
            result = {
                id: parseInt(<string>splitData[index++]),
                level: parseInt(<string>splitData[index++]),
                kills: parseInt(<string>splitData[index++]),
                primordialLevel: parseInt(<string>splitData[index++]),
                primordialKills: parseInt(<string>splitData[index++]),
                primordial: parseInt(<string>splitData[index++])
            }
        }

        return result;
    }

    private decompressSkill(content: string): JsonSkill {
        const splitData = this.splitData(content, this.OBJECT_VALUES_SEPARATOR);
        let index = 0;

        return {
            id: parseInt(<string>splitData[index++]),
            rank: parseInt(<string>splitData[index++]),
            upgrades: this.splitData(this.removeSurround(<string>splitData[index++]), this.ARRAY_VALUES_SEPARATOR)
                .map(upgrades => {
                    const splitedUpgrades = this.splitData(upgrades, this.OBJECT_VALUES_SEPARATOR);
                    let indexUpgrade = 0;
                    return {
                        id: parseInt(<string>splitedUpgrades[indexUpgrade++]),
                        rank: parseInt(<string>splitedUpgrades[indexUpgrade++]),
                        selected: parseInt(<string>splitedUpgrades[indexUpgrade++])
                    }
                })
        }
    }

    private decompressCharacter(character: string): JsonCharacter {
        const [_, version, data] = <[string, string, string]>character.split(':', 3);
        const splitData = this.splitData(this.removeSurround(data), this.OBJECT_VALUES_SEPARATOR);
        
        let index = 0;
        return {
            type: 'c',
            version,
            heroClass: parseInt(<string>splitData[index++]),
            level: parseInt(<string>splitData[index++]),
            gear: {
                helm: this.decompressItem(this.removeSurround(<string>splitData[index++])),
                body: this.decompressItem(this.removeSurround(<string>splitData[index++])),
                shoulder: this.decompressItem(this.removeSurround(<string>splitData[index++])),
                bracer: this.decompressItem(this.removeSurround(<string>splitData[index++])),
                glove: this.decompressItem(this.removeSurround(<string>splitData[index++])),
                boot: this.decompressItem(this.removeSurround(<string>splitData[index++])),
                ring_l: this.decompressItem(this.removeSurround(<string>splitData[index++])),
                ring_r: this.decompressItem(this.removeSurround(<string>splitData[index++])),
                amulet: this.decompressItem(this.removeSurround(<string>splitData[index++])),
                belt: this.decompressItem(this.removeSurround(<string>splitData[index++])),
                cape: this.decompressItem(this.removeSurround(<string>splitData[index++]))
            },
            inventory: splitData[index++] ? this.splitData(this.removeSurround(<string>splitData[index - 1]), this.ARRAY_VALUES_SEPARATOR).map(item => this.decompressItem(item)) : null,
            sharedInventory: splitData[index++] ? this.splitData(this.removeSurround(<string>splitData[index - 1]), this.ARRAY_VALUES_SEPARATOR)
                .map(items => this.splitData(this.removeSurround(items), this.ARRAY_VALUES_SEPARATOR).map(item => this.decompressItem(item))) : null,
        
            ancestralLegacies: {
                ancestralLegacies: this.splitData(this.removeSurround(<string>splitData[index++]), this.ARRAY_VALUES_SEPARATOR).map(a => this.decompressAncestralLegacy(a)),
                nodes: this.splitData(this.removeSurround(<string>splitData[index++]), this.ARRAY_VALUES_SEPARATOR).map(v => parseInt(v)),
                maxNodes: parseInt(<string>splitData[index++])
            },
        
            reaper: this.decompressReaper(this.removeSurround(<string>splitData[index++])),
        
            skills: this.splitData(this.removeSurround(<string>splitData[index++]), this.ARRAY_VALUES_SEPARATOR).map(skill => this.decompressSkill(skill)),
        
            attributes: {
                [Attribute.Toughness]: parseInt(<string>splitData[index++]),
                [Attribute.Savagery]: parseInt(<string>splitData[index++]),
                [Attribute.Fury]: parseInt(<string>splitData[index++]),
                [Attribute.Determination]: parseInt(<string>splitData[index++]),
                [Attribute.Zeal]: parseInt(<string>splitData[index++]),
                [Attribute.Willpower]: parseInt(<string>splitData[index++]),
                [Attribute.Dexterity]: parseInt(<string>splitData[index++]),
                [Attribute.Bravery]: parseInt(<string>splitData[index++]),
            },
            
            support: splitData[index++] ? parseInt(<string>splitData[index - 1]) : null,
            primary: splitData[index++] ? parseInt(<string>splitData[index - 1]) : null,
            secondary: splitData[index++] ? parseInt(<string>splitData[index - 1]) : null,
            activable1: splitData[index++] ? parseInt(<string>splitData[index - 1]) : null,
            activable2: splitData[index++] ? parseInt(<string>splitData[index - 1]) : null,
            activable3: splitData[index++] ? parseInt(<string>splitData[index - 1]) : null,
            activable4: splitData[index++] ? parseInt(<string>splitData[index - 1]) : null,
        }
    }
    
    private decompressLayer(layer: string): JsonLayer {
        const data = layer.split(':').slice(1).join(':');
        const splitData = this.splitData(data, this.OBJECT_VALUES_SEPARATOR);
        return {
            type: 'l',
            name: atob(<string>splitData[0]),
            character: this.decompressCharacter(<string>splitData[1])
        }
    }
}