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
import { Bytes } from '../model/bytes';
import {
    Auras,
    ElementRank,
    EquipmentList,
    HeroesData,
    HeroInventory,
    Influence,
    Inventory,
    Missions,
    Profile,
    SharedInventory,
    SkillEquip,
    SkillRank,
    SlormSave,
    StatsFetched,
    Traits,
    Tutorials,
    WeaponData,
    Xp,
} from '../model/slormsave';
import { bytesToString, takeUntil, toBytes } from '../util/bytes.util';
import {
    mapHeroesArray,
    splitHeroesData,
    strictParseFloat,
    strictParseInt,
    toHeroes,
    toNumberArray,
    toWeapon,
} from '../util/save.util';
import { SlormancerItemParserService } from './slormancer-item-parser.service';

@Injectable()
export class SlormancerSaveParserService {

    constructor(private slormancerItemService: SlormancerItemParserService) { }

    private parseQuestList(bytes: Bytes): string {
        return bytesToString(bytes);
    }

    private parseWeaponEquip(bytes: Bytes): HeroesData<number> {
        const data = bytesToString(bytes)
        return toHeroes(mapHeroesArray(splitHeroesData(data), v => strictParseInt(v)));
    }

    private parseStatsFetched(bytes: Bytes): StatsFetched {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), v => toNumberArray(v)));
    }

    private parseVersion(bytes: Bytes): string {
        return bytesToString(bytes);
    }

    private parseSlormiteList(bytes: Bytes): string {
        return bytesToString(bytes);
    }

    private parseSharedInventory(bytes: Bytes): SharedInventory {
        const data = bytesToString(bytes);
        return  data.split(';').map(item => this.slormancerItemService.parseItem(item));
    }

    private parseFirstHero(data: Bytes): string {        
        return bytesToString(data);
    }

    private parseWeaponData(bytes: Bytes): WeaponData {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), v => v.split(',').map(toWeapon)));
    }

    private parseGameMode(bytes: Bytes): HeroesData<number> {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseSkillEquip(bytes: Bytes): SkillEquip {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseHero(bytes: Bytes): string {
        return bytesToString(bytes);
    }

    private parseMissions(bytes: Bytes): Missions {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseStoreRefreshList(bytes: Bytes): string {
        return bytesToString(bytes);
    }

    private parseTraits(bytes: Bytes): Traits {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseReputation(bytes: Bytes): string {
        return bytesToString(bytes);
    }

    private parseWrath(bytes: Bytes): HeroesData<number> {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseSkillRank(bytes: Bytes): SkillRank {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseReaperPity(bytes: Bytes): HeroesData<number> {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseGold(data: Bytes): string {
        return bytesToString(data);
    }

    private parseXp(bytes: Bytes): Xp {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt))
    }

    private parseHeroInventory(items: Array<string>): HeroInventory {
        const parsedItems = items.map(item => this.slormancerItemService.parseItem(item));

        const equipment = parsedItems.splice(0, 11);

        return {
            hemlet: equipment[0],
            chest: equipment[1],
            spaulder: equipment[2],
            bracers: equipment[3],
            gloves: equipment[4],
            boots: equipment[5],
            ring_l: equipment[6],
            ring_r: equipment[7],
            amulet: equipment[8],
            belt: equipment[9],
            cape: equipment[10],
            bag: parsedItems
        }
    }

    private parseInventory(bytes: Bytes): Inventory {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), v => this.parseHeroInventory(v.split(';'))));
    }

    private parseSlorm(bytes: Bytes): HeroesData<number> {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseInfluence(bytes: Bytes): Influence {
        const data = bytesToString(bytes);

        return data.split('|').map(strictParseFloat);
    }

    private parseElementEquip(bytes: Bytes): HeroesData<Array<number>> {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseTutorials(bytes: Bytes): Tutorials {
        const data = bytesToString(bytes);

        return data.split('|').map(strictParseInt);
    }

    private parseEquipmentList(bytes: Bytes): EquipmentList {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), v => v.split(';')));
    }

    private parseElementRank(bytes: Bytes): ElementRank {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseEnemyMatch(bytes: Bytes): HeroesData<number> {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
    }

    private parseAuras(bytes: Bytes): Auras {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseProfile(bytes: Bytes): Profile {
        const data = bytesToString(bytes);

        return toHeroes(mapHeroesArray(splitHeroesData(data), toNumberArray));
    }

    private parseEnemyLevel(bytes: Bytes): HeroesData<number> {
        const data = bytesToString(bytes);
        
        return toHeroes(mapHeroesArray(splitHeroesData(data), strictParseInt));
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