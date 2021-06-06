import { Injectable } from '@angular/core';

import {
    AURAS,
    ELEMENT_EQUIP,
    ELEMENT_RANK,
    ENEMY_LEVEL,
    ENEMY_MATCH,
    EQUIPMENT_LIST,
    FIRST_HERO,
    GAMEMODE,
    GOLD,
    HERO,
    INFLUENCE,
    INVENTORY,
    MISSIONS,
    PROFILE,
    QUEST_LIST,
    REAPER_PITY,
    REPUTATION,
    SHARED_INVENTORY,
    SKILL_EQUIP,
    SKILL_RANK,
    SLORM,
    SLORMITE_LIST,
    STATS_FETCHED,
    STORE_REFRESH_LIST,
    TRAITS,
    TUTORIALS,
    VERSION,
    WEAPON_DATA,
    WEAPON_EQUIP,
    WRATH,
    XP,
} from '../constants/save-attributes';
import { Auras } from '../model/auras';
import { Bytes } from '../model/bytes';
import { ElementRank } from '../model/element-rank';
import { EquipmentList } from '../model/equipment_list';
import { HeroesData } from '../model/heroes-data';
import { Inventory } from '../model/inventory';
import { Missions } from '../model/missions';
import { Profile } from '../model/profile';
import { SharedInventory } from '../model/shared-inventory';
import { SkillEquip } from '../model/skill-equip';
import { SkillRank } from '../model/skill-rank';
import { SlormSave } from '../model/slormsave';
import { StatsFetched } from '../model/stats-fetched';
import { Traits } from '../model/traits';
import { Tutorials } from '../model/tutorials';
import { WeaponData } from '../model/weapon-data';
import { Xp } from '../model/xp';
import { bytesToString, byteToNumber, takeUntil, toBytes } from '../util/bytes.util';
import {
    mapHeroesArray,
    splitHeroesData,
    strictParseInt,
    toHeroes,
    toItem,
    toNumberArray,
    toWeapon,
} from '../util/save.util';

@Injectable()
export class SlormancerSaveService {

    constructor() { }

    private parseQuestList(data: Bytes): string {
        return bytesToString(data);
    }

    private parseWeaponEquip(bytes: Bytes): HeroesData<number> {
        const data = bytesToString(bytes)
        return toHeroes(mapHeroesArray(splitHeroesData(data), v => strictParseInt(v)));
    }

    private parseStatsFetched(bytes: Bytes): StatsFetched {
        const unknownByte = bytes.splice(4, 1)[0];
        const data = bytesToString(bytes).trim();

        return {
            unknown_value: byteToNumber(unknownByte),
            stats: toHeroes(mapHeroesArray(splitHeroesData(data), v => toNumberArray(v)))
        }
    }

    private parseVersion(data: Bytes): string {
        return bytesToString(data);
    }

    private parseSlormiteList(data: Bytes): string {
        return bytesToString(data);
    }

    private parseSharedInventory(bytes: Bytes): SharedInventory {
        const unknownByte = bytes.splice(4, 1)[0];
        const data = bytesToString(bytes);
        return {
            unknown_value: byteToNumber(unknownByte),
            items: data.split(';').map(toItem)
        };
    }

    private parseFirstHero(data: Bytes): string {        
        return bytesToString(data);
    }

    private parseWeaponData(bytes: Bytes): WeaponData {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            weapon_data: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(',').map(toWeapon)))
        };
    }

    private parseGameMode(data: Bytes): HeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(bytesToString(data)), strictParseInt));
    }

    private parseSkillEquip(bytes: Bytes): SkillEquip {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            skills: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(',').map(strictParseInt)))
        };
    }

    private parseHero(data: Bytes): string {
        return bytesToString(data);
    }

    private parseMissions(bytes: Bytes): Missions {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            missions: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(',').map(strictParseInt)))
        };
    }

    private parseStoreRefreshList(data: Bytes): string {
        return bytesToString(data);
    }

    private parseTraits(bytes: Bytes): Traits {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            traits: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(',').map(strictParseInt)))
        };
    }

    private parseReputation(data: Bytes): string {
        return bytesToString(data);
    }

    private parseWrath(bytes: Bytes): HeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), strictParseInt));
    }

    private parseSkillRank(bytes: Bytes): SkillRank {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            skills: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(',').map(strictParseInt)))
        };
    }

    private parseReaperPity(bytes: Bytes): HeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), strictParseInt));
    }

    private parseGold(data: Bytes): string {
        return bytesToString(data);
    }

    private parseXp(bytes: Bytes): Xp {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            xp: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), strictParseInt))
        };
        return 
    }

    private parseInventory(bytes: Bytes): Inventory {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            inventory: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(';').map(toItem)))
        };
    }

    private parseSlorm(bytes: Bytes): HeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), strictParseInt));
    }

    private parseInfluence(bytes: Bytes): Array<number> {
        return bytesToString(bytes).split('|').map(strictParseInt);
    }

    private parseElementEquip(bytes: Bytes): HeroesData<Array<number>> {
        return toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(',').map(strictParseInt)));
    }

    private parseTutorials(bytes: Bytes): Tutorials {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            tutorials: bytesToString(bytes).split('|').map(strictParseInt)
        };
    }

    private parseEquipmentList(bytes: Bytes): EquipmentList {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            equipments: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(';')))
        };
    }

    private parseElementRank(bytes: Bytes): ElementRank {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            element_rank: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(',').map(strictParseInt)))
        };
    }

    private parseEnemyMatch(bytes: Bytes): HeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), strictParseInt));
    }

    private parseAuras(bytes: Bytes): Auras {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            auras: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(',').map(strictParseInt)))
        };
    }

    private parseProfile(bytes: Bytes): Profile {
        const unknownByte = bytes.splice(4, 1)[0];
        return {
            unknown_value: byteToNumber(unknownByte),
            profile: toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), v => v.split(',').map(strictParseInt)))
        };
    }

    private parseEnemyLevel(bytes: Bytes): HeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(bytesToString(bytes)), strictParseInt));
    }

    public parseSaveFile(content: string): SlormSave {
        const [data, hash] = content.split('#', 2);

        const bytes = toBytes(data);

        takeUntil(bytes, QUEST_LIST);

        return {
            quest_list: this.parseQuestList(takeUntil(bytes, WEAPON_EQUIP)),
            weapon_equip: this.parseWeaponEquip(takeUntil(bytes, STATS_FETCHED)),
            stats_fetched: this.parseStatsFetched(takeUntil(bytes, VERSION)),
            version: this.parseVersion(takeUntil(bytes, SLORMITE_LIST)),
            slormite_list: this.parseSlormiteList(takeUntil(bytes, SHARED_INVENTORY)),
            shared_inventory: this.parseSharedInventory(takeUntil(bytes, FIRST_HERO)),
            first_hero: this.parseFirstHero(takeUntil(bytes, WEAPON_DATA)),
            weapon_data: this.parseWeaponData(takeUntil(bytes, GAMEMODE)),
            gamemode: this.parseGameMode(takeUntil(bytes, SKILL_EQUIP)),
            skill_equip: this.parseSkillEquip(takeUntil(bytes, HERO)),
            hero: this.parseHero(takeUntil(bytes, MISSIONS)),
            missions: this.parseMissions(takeUntil(bytes, STORE_REFRESH_LIST)),
            store_refresh_list: this.parseStoreRefreshList(takeUntil(bytes, TRAITS)),
            traits: this.parseTraits(takeUntil(bytes, REPUTATION)),
            reputation: this.parseReputation(takeUntil(bytes, WRATH)),
            wrath: this.parseWrath(takeUntil(bytes, SKILL_RANK)),
            skill_rank: this.parseSkillRank(takeUntil(bytes, REAPER_PITY)),
            reaper_pity: this.parseReaperPity(takeUntil(bytes, GOLD)),
            gold: this.parseGold(takeUntil(bytes, XP)),
            xp: this.parseXp(takeUntil(bytes, INVENTORY)),
            inventory: this.parseInventory(takeUntil(bytes, SLORM)),
            slorm: this.parseSlorm(takeUntil(bytes, INFLUENCE)),
            influence: this.parseInfluence(takeUntil(bytes, ELEMENT_EQUIP)),
            element_equip: this.parseElementEquip(takeUntil(bytes, TUTORIALS)),
            tutorials: this.parseTutorials(takeUntil(bytes, EQUIPMENT_LIST)),
            equipment_list: this.parseEquipmentList(takeUntil(bytes, ELEMENT_RANK)),
            element_rank: this.parseElementRank(takeUntil(bytes, ENEMY_MATCH)),
            enemy_match: this.parseEnemyMatch(takeUntil(bytes, AURAS)),
            auras: this.parseAuras(takeUntil(bytes, PROFILE)),
            profile: this.parseProfile(takeUntil(bytes, ENEMY_LEVEL)),
            enemy_level: this.parseEnemyLevel(takeUntil(bytes, null)),
            hash
        };
    }
}