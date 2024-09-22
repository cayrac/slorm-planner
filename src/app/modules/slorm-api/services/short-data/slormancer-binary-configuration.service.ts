import { Injectable } from '@angular/core';

import { UNITY_REAPERS } from '../../constants';
import { CharacterConfig, HeroClass } from '../../model';
import { Character } from '../../model/character';
import { Bits } from '../../model/export/bits';
import { compareVersions } from '../../util';
import { binaryToNumber, numberToBinary, takeBitsChunk } from '../../util/bits.util';
import { SlormancerSkillService } from '../content';

@Injectable()
export class SlormancerBinaryConfigurationService {
    
    constructor(private slormancerSkillService: SlormancerSkillService) { }

    private requireNumberOfMaxedUpgrades(character: Character, version: string): boolean {
        let result = false;
        
        if (character.heroClass === HeroClass.Mage && compareVersions(version, '0.7.0') >= 0) {
            const bookSmashSkill = character.skills.find(skill => skill.skill.id === 5);

            result = bookSmashSkill !== undefined 
                && (character.primarySkill === bookSmashSkill.skill || character.secondarySkill === bookSmashSkill.skill)
                && (bookSmashSkill.selectedUpgrades.includes(44) || bookSmashSkill.activeUpgrades.includes(44));
        }

        return result;
    }

    private requireNumberOfAchievements(character: Character, version: string): boolean {
        let result = false;
        
        if (character.heroClass === HeroClass.Mage && compareVersions(version, '0.7.0') >= 0) {
            const bookSmashSkill = character.skills.find(skill => skill.skill.id === 5);

            result = bookSmashSkill !== undefined 
                && (character.primarySkill === bookSmashSkill.skill || character.secondarySkill === bookSmashSkill.skill)
                && (bookSmashSkill.selectedUpgrades.includes(43) || bookSmashSkill.activeUpgrades.includes(43));
        }

        return result;
    }

    private hasLegionPrimordialLevels(character: Character, version: string): boolean {
        return compareVersions(version, '0.7.0') < 0;
    }

    public configurationToBinary(config: CharacterConfig, character: Character, version: string): Bits {
        let result: Bits = [];

        if (UNITY_REAPERS.includes(character.reaper.id)) {
            result.push(...numberToBinary(config.unity_level_0_47, 7));
            result.push(...numberToBinary(config.unity_level_0_48, 7));
            result.push(...numberToBinary(config.unity_level_0_49, 7));
            result.push(...numberToBinary(config.unity_level_0_50, 7));
            result.push(...numberToBinary(config.unity_level_0_51, 7));
            result.push(...numberToBinary(config.unity_level_0_52, 7));
            result.push(...numberToBinary(config.unity_level_1_47, 7));
            result.push(...numberToBinary(config.unity_level_1_48, 7));
            result.push(...numberToBinary(config.unity_level_1_49, 7));
            result.push(...numberToBinary(config.unity_level_1_50, 7));
            result.push(...numberToBinary(config.unity_level_1_51, 7));
            result.push(...numberToBinary(config.unity_level_1_52, 7));
            result.push(...numberToBinary(config.unity_level_2_47, 7));
            result.push(...numberToBinary(config.unity_level_2_48, 7));
            result.push(...numberToBinary(config.unity_level_2_49, 7));
            result.push(...numberToBinary(config.unity_level_2_50, 7));
            result.push(...numberToBinary(config.unity_level_2_51, 7));
            result.push(...numberToBinary(config.unity_level_2_52, 7));
        }

        if (this.requireNumberOfMaxedUpgrades(character, version)) {
            const maxed_upgrades = this.slormancerSkillService.getNumberOfMaxedUpgrades(character);
            result.push(...numberToBinary(maxed_upgrades, 8));
        }

        if (this.requireNumberOfAchievements(character, version)) {
            result.push(...numberToBinary(config.completed_achievements, 7));
        }

        return result;
    }

    public binaryToConfiguration(bits: Bits, character: Character, version: string): Partial<CharacterConfig> {
        const config: Partial<CharacterConfig> = { }

        if (UNITY_REAPERS.includes(character.reaper.id)) {
            config.unity_level_0_47 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_0_48 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_0_49 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_0_50 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_0_51 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_0_52 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_1_47 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_1_48 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_1_49 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_1_50 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_1_51 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_1_52 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_2_47 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_2_48 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_2_49 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_2_50 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_2_51 = binaryToNumber(takeBitsChunk(bits, 7));
            config.unity_level_2_52 = binaryToNumber(takeBitsChunk(bits, 7));
            if (this.hasLegionPrimordialLevels(character, version)) {
                takeBitsChunk(bits, 7 * 18);
            }
        }

        if (this.requireNumberOfMaxedUpgrades(character, version)) {
            config.maxed_upgrades = binaryToNumber(takeBitsChunk(bits, 8));
        }

        if (this.requireNumberOfAchievements(character, version)) {
            config.completed_achievements = binaryToNumber(takeBitsChunk(bits, 7));
        }

        return config;
    }
}