import { Injectable } from '@angular/core';

import { API_TO_GAME_VERSION_MAPPER, GAME_VERSION } from '../../constants/common';
import { Character, CharacterAncestralLegacies, CharacterGear, CharacterSkillAndUpgrades } from '../../model/character';
import { ALL_ATTRIBUTES, Attribute } from '../../model/content/enum/attribute';
import { ALL_GEAR_SLOT_VALUES, GearSlot, gearSlotToBase } from '../../model/content/enum/gear-slot';
import { HeroClass } from '../../model/content/enum/hero-class';
import { EquipableItem } from '../../model/content/equipable-item';
import { Bits } from '../../model/export/bits';
import { binaryToBoolean, binaryToNumber, booleanToBinary, numberToBinary, takeBitsChunk } from '../../util/bits.util';
import { SlormancerCharacterBuilderService } from '../slormancer-character-builder.service';
import { SlormancerBinaryItemService } from './slormancer-binary-item.service';
import { SlormancerBinaryReaperService } from './slormancer-binary-reaper.service';
import { SlormancerBinaryRuneService } from './slormancer-binary-rune.service';
import { SlormancerBinaryUltimatumService } from './slormancer-binary-ultimatum.service';
import { compareVersions } from '../../util';
import { BinaryParseReport } from '../../model/export/binary-parse-report';

@Injectable()
export class SlormancerBinaryCharacterService {
    
    constructor(private slormancerBinaryItemService: SlormancerBinaryItemService,
                private slormancerBinaryReaperService: SlormancerBinaryReaperService,
                private slormancerBinaryUltimatumService: SlormancerBinaryUltimatumService,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private slormancerBinaryRuneService: SlormancerBinaryRuneService,
                ) {
                }

    private ancestralLegaciesToBinary(characterAncestralLegacies: CharacterAncestralLegacies): Bits {
        let result: Bits = [];

        result.push(...booleanToBinary((characterAncestralLegacies.activeFirstNode !== null)));
        if (characterAncestralLegacies.activeFirstNode !== null) {
            result.push(...numberToBinary(characterAncestralLegacies.activeFirstNode, 10));
        }

        result.push(...numberToBinary(characterAncestralLegacies.activeNodes.length, 4));
        for (const node of characterAncestralLegacies.activeNodes) {
            result.push(...numberToBinary(node, 10));
        }

        const ancestralLegacies = characterAncestralLegacies.ancestralLegacies
            .filter(ancestralLegacy => characterAncestralLegacies.activeAncestralLegacies.includes(ancestralLegacy.id));
        result.push(...numberToBinary(ancestralLegacies.length, 4));
        for (const ancestralLegacy of ancestralLegacies) {
            result.push(...numberToBinary(ancestralLegacy.id, 10));
            result.push(...numberToBinary(ancestralLegacy.baseRank, 4));
        }

        return result;
    }

    private binaryToAncestralLegacies(binary: Bits, version: string): { nodes: Array<number>, ancestralLegacyLevels: Array<number>, firstNode: number | null } {
        const hasFirstStoneData = compareVersions(version, '0.5.0') >= 0;
        let result: { nodes: Array<number>, ancestralLegacyLevels: Array<number>, firstNode: number | null } = { nodes: [], ancestralLegacyLevels: [], firstNode: null };

        if (hasFirstStoneData) {
            if (binaryToBoolean(takeBitsChunk(binary, 1))) {
                result.firstNode = binaryToNumber(takeBitsChunk(binary, 10));
            }
        }

        const nodesCount = binaryToNumber(takeBitsChunk(binary, 4));
        for (let i = 0 ; i < nodesCount ; i++) {
            result.nodes.push(binaryToNumber(takeBitsChunk(binary, 10)));
        }

        const ancestralCount = binaryToNumber(takeBitsChunk(binary, 4));
        for (let i = 0 ; i < ancestralCount ; i++) {
            const ancestralId = binaryToNumber(takeBitsChunk(binary, 10));
            const ancestralRank = binaryToNumber(takeBitsChunk(binary, 4));
            result.ancestralLegacyLevels[ancestralId] = ancestralRank;
        }

        return result;
    }

    private skillsToBinary(characterSkillAndUpgrades: Array<CharacterSkillAndUpgrades>, support: number | null, primary: number | null, secondary: number | null): Bits {
        let result: Bits = [];

        result.push(...numberToBinary(characterSkillAndUpgrades.length, 4));
        for (const skillInfo of characterSkillAndUpgrades) {
            result.push(...numberToBinary(skillInfo.skill.id, 10));
            result.push(...numberToBinary(skillInfo.skill.baseLevel, 5));

            const hasPassives = skillInfo.selectedUpgrades.length > 0
                || skillInfo.skill.id  === support
                || skillInfo.skill.id  === primary
                || skillInfo.skill.id  === secondary;

            result.push(...booleanToBinary(hasPassives));
            if (hasPassives) {
                const upgrades = skillInfo.upgrades.filter(upgrade => skillInfo.selectedUpgrades.includes(upgrade.id));
                
                result.push(...numberToBinary(upgrades.length, 4));
                for (const upgrade of upgrades) {
                    result.push(...numberToBinary(upgrade.id, 10));
                    result.push(...numberToBinary(upgrade.baseRank, 4));
                }

            }
        }

        return result;
    }

    private binaryToSkills(binary: Bits): { equiped: Array<number>, ranks: Array<number> } {
        const result: { equiped: Array<number>, ranks: Array<number> } = { equiped: [], ranks: [] };

        const skillsCount = binaryToNumber(takeBitsChunk(binary, 4));
        for (let i = 0 ; i < skillsCount ; i++) {
            const skillId = binaryToNumber(takeBitsChunk(binary, 10));
            const skillLevel = binaryToNumber(takeBitsChunk(binary, 5));

            result.ranks[skillId] = skillLevel;

            const hasPassives = binaryToBoolean(takeBitsChunk(binary, 1));

            if (hasPassives) {
                const upgradesCount = binaryToNumber(takeBitsChunk(binary, 4));
                for (let j = 0 ; j < upgradesCount ; j++) {
                    const upgradeId = binaryToNumber(takeBitsChunk(binary, 10));
                    const upgradeRank = binaryToNumber(takeBitsChunk(binary, 4));

                    result.equiped[upgradeId] = 1;
                    result.ranks[upgradeId] = upgradeRank;
                }
            }
        }

        return result;
    }

    private binaryToGear(binary: Bits, heroClass: HeroClass, version: string, report: BinaryParseReport): CharacterGear {
        const result: CharacterGear = {
            [GearSlot.Helm]: null,
            [GearSlot.Body]: null,
            [GearSlot.Shoulder]: null,
            [GearSlot.Bracer]: null,
            [GearSlot.Glove]: null,
            [GearSlot.Boot]: null,
            [GearSlot.LeftRing]: null,
            [GearSlot.RightRing]: null,
            [GearSlot.Amulet]: null,
            [GearSlot.Belt]: null,
            [GearSlot.Cape]: null
        };

        const itemsCount = binaryToNumber(takeBitsChunk(binary, 4));
        for (let i = 0 ; i < itemsCount ; i++) {
            const gearSlotValue = binaryToNumber(takeBitsChunk(binary, 5));
            const gearSlot = ALL_GEAR_SLOT_VALUES[gearSlotValue];
            
            if (!gearSlot) {
                throw new Error('failed to parse gear slot from binary : ' + binary.join())
            }

            result[gearSlot] = this.slormancerBinaryItemService.binaryToItem(binary, gearSlotToBase(gearSlot), heroClass, version, report);
        }

        return result;
    }

    private gearToBinary(gear: CharacterGear): Bits {
        let result: Bits = [];

        const gearSlots = ALL_GEAR_SLOT_VALUES.filter(slot => gear[slot] !== null);
        
        result.push(...numberToBinary(gearSlots.length, 4));
        for (const gearSlot of gearSlots) {
            const item: EquipableItem | null = gear[gearSlot];

            if (item !== null) {
                result.push(...numberToBinary(ALL_GEAR_SLOT_VALUES.indexOf(gearSlot), 5));
                result.push(...this.slormancerBinaryItemService.itemToBinary(item));
            }
        }
        
        return result;
    }

    public characterToBinary(character: Character): Bits {
        let result: Bits = [];
        
        result.push(...numberToBinary(character.heroClass, 2));
        result.push(...numberToBinary(character.level, 7));

        result.push(...this.slormancerBinaryReaperService.reaperToBinary(character.reaper));

        result.push(...this.slormancerBinaryRuneService.runesCombinationToBinary(character.runes));

        result.push(...this.ancestralLegaciesToBinary(character.ancestralLegacies));

        result.push(...this.skillsToBinary(character.skills,
            character.supportSkill ? character.supportSkill.id : null,
            character.primarySkill ? character.primarySkill.id : null,
            character.secondarySkill ? character.secondarySkill.id : null ));

        result.push(...this.gearToBinary(character.gear));

        result.push(...this.slormancerBinaryUltimatumService.ultimatumToBinary(character.ultimatum));

        for (const attribute of ALL_ATTRIBUTES) {
            result.push(...numberToBinary(character.attributes.allocated[attribute].baseRank, 7));
        }

        result.push(...numberToBinary(character.supportSkill === null ? 0 : character.supportSkill.id + 1, 10));
        result.push(...numberToBinary(character.primarySkill === null ? 0 : character.primarySkill.id + 1, 10));
        result.push(...numberToBinary(character.secondarySkill === null ? 0 : character.secondarySkill.id + 1, 10));

        const activable1Id = character.activable1 === null ? 0
            : (1 + ('isActivable' in character.activable1 ? character.activable1.id : character.activable1.id + 200));
        result.push(...numberToBinary(activable1Id, 10));
        const activable2Id = character.activable2 === null ? 0
            : (1 + ('isActivable' in character.activable2 ? character.activable2.id : character.activable2.id + 200));
        result.push(...numberToBinary(activable2Id, 10));
        const activable3Id = character.activable3 === null ? 0
            : (1 + ('isActivable' in character.activable3 ? character.activable3.id : character.activable3.id + 200));
        result.push(...numberToBinary(activable3Id, 10));
        const activable4Id = character.activable4 === null ? 0
            : (1 + ('isActivable' in character.activable4 ? character.activable4.id : character.activable4.id + 200));
        result.push(...numberToBinary(activable4Id, 10));

        return result;
    }

    private smartGuessMissingAttributes(attributes: { [key in Attribute]: number }, points: number, report: BinaryParseReport) {
        let remainingPoints = points;

        for (const attribute of ALL_ATTRIBUTES) {
            remainingPoints -= attributes[attribute];
        }

        if (remainingPoints >= 64) {
            let validAttribute = ALL_ATTRIBUTES.find(attribute => attributes[attribute] === 11);
            if (validAttribute === undefined) {
                validAttribute = ALL_ATTRIBUTES.find(attribute => attributes[attribute] > 0 && attributes[attribute] < 11);
            }

            if (validAttribute !== undefined) {
                attributes[validAttribute] += 64;
                report.fromCorrupted = true;
            }
        }
    }

    public binaryToCharacter(binary: Bits, version: string): Character | null {
        const originalGameVersion = API_TO_GAME_VERSION_MAPPER[version];
        const importVersion = originalGameVersion ? originalGameVersion : GAME_VERSION;
        const heroClass: HeroClass = binaryToNumber(takeBitsChunk(binary, 2));
        const report: BinaryParseReport = { fromCorrupted: false };

        const has6BitsLevel = compareVersions(version, '0.4.0') < 0;
        let level = binaryToNumber(takeBitsChunk(binary, has6BitsLevel ? 6 : 7));

        if (has6BitsLevel && level <= 6) {
            level += 64;
            report.fromCorrupted = true;
        }

        const reaper = this.slormancerBinaryReaperService.binaryToReaper(binary, heroClass, version);

        const runes = this.slormancerBinaryRuneService.binaryToRunesCombination(binary, heroClass, version, reaper.id);
        
        const ancestralData = this.binaryToAncestralLegacies(binary, version);

        const skillsData = this.binaryToSkills(binary);

        const gearData = this.binaryToGear(binary, heroClass, version, report);

        const ultimatum = this.slormancerBinaryUltimatumService.binaryToUltimatum(binary);

        const has6BitsRank = compareVersions(version, '0.4.1') < 0;
        const attributes: { [key in Attribute]: number } = {
            [Attribute.Toughness]: 0,
            [Attribute.Savagery]: 0,
            [Attribute.Fury]: 0,
            [Attribute.Determination]: 0,
            [Attribute.Zeal]: 0,
            [Attribute.Willpower]: 0,
            [Attribute.Dexterity]: 0,
            [Attribute.Bravery]: 0,
        } 
        for (const attribute of ALL_ATTRIBUTES) {
            let value = binaryToNumber(takeBitsChunk(binary, has6BitsRank ? 6 : 7));
            attributes[attribute] = value;
        }

        if (has6BitsRank) {
            this.smartGuessMissingAttributes(attributes, level, report);
        }

        const supportSkillValue = binaryToNumber(takeBitsChunk(binary, 10));
        const primarySkillValue = binaryToNumber(takeBitsChunk(binary, 10));
        const secondarySkillValue = binaryToNumber(takeBitsChunk(binary, 10));
        const activable1Value = binaryToNumber(takeBitsChunk(binary, 10));
        const activable2Value = binaryToNumber(takeBitsChunk(binary, 10));
        const activable3Value = binaryToNumber(takeBitsChunk(binary, 10));
        const activable4Value = binaryToNumber(takeBitsChunk(binary, 10));

        return this.slormancerCharacterBuilderService.getCharacter(
            heroClass,
            level,
            GAME_VERSION,
            importVersion,
            importVersion,
            reaper,
            runes,
            ultimatum,
            ancestralData.nodes,
            ancestralData.firstNode,
            ancestralData.ancestralLegacyLevels,
            skillsData.equiped,
            skillsData.ranks,
            gearData[GearSlot.Helm],
            gearData[GearSlot.Body],
            gearData[GearSlot.Shoulder],
            gearData[GearSlot.Bracer],
            gearData[GearSlot.Glove],
            gearData[GearSlot.Boot],
            gearData[GearSlot.LeftRing],
            gearData[GearSlot.RightRing],
            gearData[GearSlot.Amulet],
            gearData[GearSlot.Belt],
            gearData[GearSlot.Cape],
            null,
            null,
            attributes[Attribute.Toughness],
            attributes[Attribute.Savagery],
            attributes[Attribute.Fury],
            attributes[Attribute.Determination],
            attributes[Attribute.Zeal],
            attributes[Attribute.Willpower],
            attributes[Attribute.Dexterity],
            attributes[Attribute.Bravery],
            primarySkillValue === 0 ? null : (primarySkillValue - 1),
            secondarySkillValue === 0 ? null : (secondarySkillValue - 1),
            supportSkillValue === 0 ? null : (supportSkillValue - 1),
            activable1Value === 0 ? null : (activable1Value - 1),
            activable2Value === 0 ? null : (activable2Value - 1),
            activable3Value === 0 ? null : (activable3Value - 1),
            activable4Value === 0 ? null : (activable4Value - 1),
            report.fromCorrupted
        );
    }
}