import { Injectable } from '@angular/core';

import {
    AURAS,
    CORRUPTED_SLORM,
    DATE,
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
    PURE_SLORM,
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
    TEMPLE_BLESSING,
    TEMPLE_DATA,
    TEMPLE_UPGRADES,
    TRAITS,
    TUTORIALS,
    VERSION,
    WEAPON_DATA,
    WEAPON_EQUIP,
    WRATH,
    XP,
} from '../../constants/parser/save-attributes';
import { Bytes } from '../../model/parser/game/bytes';
import { GameItem } from '../../model/parser/game/game-item';
import {
    GameAuras,
    GameElementRank,
    GameEquipmentList,
    GameHeroesData,
    GameHeroInventory,
    GameInfluence,
    GameInventory,
    GameMissions,
    GameProfile,
    GameSave,
    GameSharedInventory,
    GameSkillEquip,
    GameSkillRank,
    GameStatsFetched,
    GameTraits,
    GameTutorials,
    GameWeaponData,
    GameWeaponEquipped,
    GameXp,
} from '../../model/parser/game/game-save';
import { bytesFindPositions, bytesToString, slice, toBytes } from '../../util/bytes.util';
import {
    mapHeroesArray,
    splitHeroesData,
    strictParseFloat,
    strictParseInt,
    toFloatArray,
    toHeroes,
    toNumberArray,
    toWeapon,
} from '../../util/parse.util';
import { valueOrNull } from '../../util/utils';
import { SlormancerItemParserService } from './slormancer-item-parser.service';

@Injectable()
export class SlormancerSaveParserService {

    private readonly KEYWORDS = [
        QUEST_LIST,
        TEMPLE_DATA,
        WEAPON_EQUIP,
        STATS_FETCHED,
        VERSION,
        TEMPLE_UPGRADES,
        SLORMITE_LIST,
        SHARED_INVENTORY,
        CORRUPTED_SLORM,
        
        FIRST_HERO,
        WEAPON_DATA,
        GAMEMODE,
        SKILL_EQUIP,
        HERO,
        MISSIONS,
        TEMPLE_BLESSING,
        DATE,
        STORE_REFRESH_LIST,
        TRAITS,
        
        REPUTATION,
        WRATH,
        
        SKILL_RANK,
        REAPER_PITY,
        GOLD,
        XP,
        INVENTORY,
        SLORM,
        INFLUENCE,
        ELEMENT_EQUIP,
        TUTORIALS,
        EQUIPMENT_LIST,
        ELEMENT_RANK,
        ENEMY_MATCH,
        AURAS,
        PROFILE,
        ENEMY_LEVEL,
        PURE_SLORM,
    ];

    constructor(private slormancerItemService: SlormancerItemParserService) { }

    private parseStatsFetched(data: string): GameStatsFetched {
        return toHeroes(mapHeroesArray(splitHeroesData(data), v => toNumberArray(v)));
    }

    private parseVersion(data: string): string {
        return data;
    }

    private parseSlormiteList(data: string): string {
        return data;
    }

    private parseSharedInventory(data: string): GameSharedInventory {        
        return  data.split(';').map(item => this.slormancerItemService.parseItem(item));
    }

    private parseFirstHero(data: string): string {        
        return data;
    }

    private parseWeaponData(data: string): GameWeaponData {
        return toHeroes(mapHeroesArray(splitHeroesData(data), v => v.split(',').map((data, index) => toWeapon(data, index))));
    }

    private parseGameMode(data: string): GameHeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseSkillEquip(data: string): GameSkillEquip {
        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseHero(data: string): string {
        return data;
    }

    private parseMissions(data: string): GameMissions {
        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseStoreRefreshList(data: string): string {
        return data;
    }

    private parseTraits(data: string): GameTraits {
        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseReputation(data: string): string {
        return data;
    }

    private parseWrath(data: string): GameHeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseSkillRank(data: string): GameSkillRank {
        return toHeroes(mapHeroesArray(splitHeroesData(data), toFloatArray));
    }

    private parseReaperPity(data: string): GameHeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseGold(data: string): string {
        return data;
    }

    private parseXp(data: string): GameXp {
        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt))
    }

    private parseHeroInventory(items: Array<string>): GameHeroInventory {
        const parsedItems = items.map(item => this.slormancerItemService.parseItem(item));

        const equipment = parsedItems.splice(0, 11);

        return {
            helm: <GameItem | null>equipment[0],
            body: <GameItem | null>equipment[1],
            shoulder: <GameItem | null>equipment[2],
            bracer: <GameItem | null>equipment[3],
            glove: <GameItem | null>equipment[4],
            boot: <GameItem | null>equipment[5],
            ring_l: <GameItem | null>equipment[6],
            ring_r: <GameItem | null>equipment[7],
            amulet: <GameItem | null>equipment[8],
            belt: <GameItem | null>equipment[9],
            cape: <GameItem | null>equipment[10],
            bag: parsedItems
        }
    }

    private parseInventory(data: string): GameInventory {
        return toHeroes(mapHeroesArray(splitHeroesData(data), v => this.parseHeroInventory(v.split(';'))));
    }

    private parseSlorm(data: string): GameHeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseInfluence(data: string): GameInfluence {
        return data.split('|').map(strictParseFloat);
    }

    private parseElementEquip(data: string): GameHeroesData<Array<number>> {
        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseTutorials(data: string): GameTutorials {
        return data.split('|').map(strictParseInt);
    }

    private parseEquipmentList(data: string): GameEquipmentList {
        return toHeroes(mapHeroesArray(splitHeroesData(data), v => v.split(';')));
    }

    private parseElementRank(data: string): GameElementRank {
        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseEnemyMatch(data: string): GameHeroesData<number> {
        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseAuras(data: string): GameAuras {
        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseProfile(data: string): GameProfile {
        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseEnemyLevel(data: string): GameHeroesData<number> {        
        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseWeaponEquipped(data: string): GameWeaponEquipped {        
        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseKeys(bytes: Bytes): { [key: string]: string } {
        let data: { [key: string]: string } = {};

        let keys = bytesFindPositions(bytes, this.KEYWORDS).map((pos, i) => ({ key: <Bytes>this.KEYWORDS[i], pos }))
            .filter(v => v.pos !== -1)
            .sort((a, b) => a.pos > b.pos ? 1 : (a.pos < b.pos ? -1 : 0));

        keys.forEach((key, index) => {
            const next = valueOrNull(keys[index + 1]);

            let value = null;
            const min = key.pos + key.key.length;
            value = slice(bytes, min, next === null ? bytes.length - min : next.pos - min);

            data[bytesToString(key.key)] = bytesToString(value);
        });

        return data;
    }

    private getOrFail(data: { [key: string]: string}, key: string): string {
        const found = data[key];

        if (found === undefined) {
            throw new Error('No data found for key "' + key + '"');
        }

        return found;
    }

    public parseSaveFile(content: string): GameSave {
        const [data, hash] = content.split('#', 2);
        
        const bytes = toBytes(<string>data);

        const parsedData = this.parseKeys(bytes);

        // console.log('parsedData : ', parsedData);

        return {
            stats_fetched: this.parseStatsFetched(this.getOrFail(parsedData, 'stats_fetched')),
            version: this.parseVersion(this.getOrFail(parsedData, 'version')),
            slormite_list: this.parseSlormiteList(this.getOrFail(parsedData, 'slormite_list')),
            shared_inventory: this.parseSharedInventory(this.getOrFail(parsedData, 'shared_inventory')),
            first_hero: this.parseFirstHero(this.getOrFail(parsedData, 'first_hero')),
            weapon_data: this.parseWeaponData(this.getOrFail(parsedData, 'weapon_data')),
            gamemode: this.parseGameMode(this.getOrFail(parsedData, 'gamemode')),
            skill_equip: this.parseSkillEquip(this.getOrFail(parsedData, 'skill_equip')),
            hero: this.parseHero(this.getOrFail(parsedData, 'hero')),
            missions: this.parseMissions(this.getOrFail(parsedData, 'missions')),
            store_refresh_list: this.parseStoreRefreshList(this.getOrFail(parsedData, 'store_refresh_list')),
            traits: this.parseTraits(this.getOrFail(parsedData, 'traits')),
            reputation: this.parseReputation(this.getOrFail(parsedData, 'reputation')),
            wrath: this.parseWrath(this.getOrFail(parsedData, 'wrath')),
            skill_rank: this.parseSkillRank(this.getOrFail(parsedData, 'skill_rank')),
            reaper_pity: this.parseReaperPity(this.getOrFail(parsedData, 'reaper_pity')),
            gold: this.parseGold(this.getOrFail(parsedData, 'gold')),
            xp: this.parseXp(this.getOrFail(parsedData, 'xp')),
            inventory: this.parseInventory(this.getOrFail(parsedData, 'inventory')),
            slorm: this.parseSlorm(this.getOrFail(parsedData, 'slorm')),
            influence: this.parseInfluence(this.getOrFail(parsedData, 'influence')),
            element_equip: this.parseElementEquip(this.getOrFail(parsedData, 'element_equip')),
            tutorials: this.parseTutorials(this.getOrFail(parsedData, 'tutorials')),
            equipment_list: this.parseEquipmentList(this.getOrFail(parsedData, 'equipment_list')),
            element_rank: this.parseElementRank(this.getOrFail(parsedData, 'element_rank')),
            enemy_match: this.parseEnemyMatch(this.getOrFail(parsedData, 'enemy_match')),
            auras: this.parseAuras(this.getOrFail(parsedData, 'auras')),
            profile: this.parseProfile(this.getOrFail(parsedData, 'profile')),
            enemy_level: this.parseEnemyLevel(this.getOrFail(parsedData, 'enemy_level')),
            weapon_equip: this.parseWeaponEquipped(this.getOrFail(parsedData, 'weapon_equip')),
            hash: <string>hash
        };
    }
}