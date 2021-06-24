import { Injectable } from '@angular/core';

import { Bytes } from '../model/game/bytes';
import { GameItem } from '../model/game/game-item';
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
    GameXp,
} from '../model/game/game-save';
import { bytesToString, removeUnwantedChar, toBytes } from '../util/bytes.util';
import {
    mapHeroesArray,
    splitHeroesData,
    strictParseFloat,
    strictParseInt,
    toHeroes,
    toNumberArray,
    toWeapon,
} from '../util/parse.util';
import { findFirst } from '../util/utils';
import { SlormancerItemParserService } from './slormancer-item-parser.service';

@Injectable()
export class SlormancerSaveParserService {

    private readonly KEYWORDS = [
        'quest_list',
        'weapon_equi',
        'stats_fetched',
        'version',
        'slormite_list',
        'shared_inventory',
        'first_hero',
        'weapon_data',
        'gamemode',
        'skill_equip',
        'hero',
        'missions',
        'store_refresh_list',
        'traits',
        'reputation',
        'wrath',
        'skill_rank',
        'reaper_pity',
        'gold',
        'xp',
        'inventory',
        'slorm',
        'influence',
        'element_equip',
        'tutorials',
        'equipment_list',
        'element_rank',
        'enemy_match',
        'auras',
        'profile',
        'enemy_level',
        'hash',
        'pure_slorm'
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

    private parseSharedInventory(data: string): GameSharedInventory {        return  data.split(';').map(item => this.slormancerItemService.parseItem(item));
    }

    private parseFirstHero(data: string): string {        
        return data;
    }

    private parseWeaponData(data: string): GameWeaponData {
        return toHeroes(mapHeroesArray(splitHeroesData(data), v => v.split(',').map(toWeapon)));
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
        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
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
            hemlet: <GameItem | null>equipment[0],
            chest: <GameItem | null>equipment[1],
            spaulder: <GameItem | null>equipment[2],
            bracers: <GameItem | null>equipment[3],
            gloves: <GameItem | null>equipment[4],
            boots: <GameItem | null>equipment[5],
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

    private newParsing(bytes: Bytes): { [key: string]: string } {
        let content = bytesToString(bytes);
        let data: { [key: string]: string } = {};

        let nextKey = findFirst(content, this.KEYWORDS);
        if (nextKey !== null) {
            const maxIndex = nextKey !== null ? content.indexOf(nextKey) : content.length;
            content = content.substr(maxIndex + nextKey.length);
        }

        while (nextKey !== null) {
            let key: string | null = nextKey;
            nextKey = findFirst(content, this.KEYWORDS);
            const maxIndex = nextKey !== null ? content.indexOf(nextKey) : content.length;
            
            data[key] = removeUnwantedChar(content.substr(0, maxIndex));

            content = content.substr(maxIndex + (nextKey !== null ? nextKey.length : 0));
        }

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

        console.log('checking hexas : ');
        for (let i = 0 ; i < bytes.length; i++) {
            const byte = bytes[i];
            if (byte && parseInt(byte, 16) === 75) {
                console.log('value found at index : ', i);
            }
        }

        const parsedData = this.newParsing(bytes);

        console.log(parsedData);

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
            hash: <string>hash
        };
    }
}