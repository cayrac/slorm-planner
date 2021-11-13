import { GameItem } from './game-item';

export interface GameSave {
    stats_fetched: GameStatsFetched,
    original_version: string,
    version: string,
    slormite_list: string,
    shared_inventory: GameSharedInventory,
    first_hero: string,
    weapon_data: GameWeaponData,
    gamemode: GameHeroesData<number>,
    skill_equip: GameSkillEquip,
    hero: string,
    missions: GameMissions,
    store_refresh_list: string,
    traits: GameTraits,
    reputation: string,
    wrath: GameHeroesData<number>,
    skill_rank: GameSkillRank,
    ultimatums: GameUltimatums,
    reaper_pity: GameHeroesData<number>,
    gold: string,
    xp: GameXp,
    inventory: GameInventory,
    slorm: GameHeroesData<number>,
    influence: GameInfluence,
    element_equip: GameHeroesData<Array<number>>,
    tutorials: GameTutorials,
    equipment_list: GameEquipmentList,
    element_rank: GameElementRank,
    enemy_match: GameHeroesData<number>,
    weapon_equip: GameWeaponEquipped,
    auras: GameAuras,
    profile: GameProfile,
    enemy_level: GameHeroesData<number>,
    hash: string;
}

export declare type GameAuras = GameHeroesData<Array<number>>;
export declare type GameSkillRank = GameHeroesData<Array<number>>;
export declare type GameElementRank = GameHeroesData<Array<number>>;
export declare type GameEquipmentList = GameHeroesData<Array<string>>;
export declare type GameInfluence = Array<number>;
export declare type GameInventory = GameHeroesData<GameHeroInventory>;
export declare type GameMissions = GameHeroesData<Array<number>>;
export declare type GameProfile = GameHeroesData<Array<number>>;
export declare type GameSharedInventory = Array<GameItem | null>;
export declare type GameSkillEquip = GameHeroesData<Array<number>>;
export declare type GameStatsFetched = GameHeroesData<Array<number>>;
export declare type GameTraits = GameHeroesData<Array<number>>;
export declare type GameTutorials = Array<number>;
export declare type GameWeaponData = GameHeroesData<Array<GameWeapon>>;
export declare type GameXp = GameHeroesData<number>;
export declare type GameWeaponEquipped = GameHeroesData<number>;
export declare type GameUltimatums = Array<GameUltimatum>;

export interface GameHeroesData<T> {
    0: T,
    1: T
    2: T,
}

export interface GameHeroInventory {
    helm: GameItem | null;
    body: GameItem | null;
    shoulder: GameItem | null;
    bracer: GameItem | null;
    glove: GameItem | null;
    boot: GameItem | null;
    ring_l: GameItem | null;
    ring_r: GameItem | null;
    amulet: GameItem | null;
    belt: GameItem | null;
    cape: GameItem | null;
    bag: Array<GameItem | null>;
};

export interface GameWeapon {
    id: number,
    basic: { obtained: boolean, experience: number, kills: number, generic4: number },
    primordial: { obtained: boolean, experience: number, kills: number, generic4: number }
};

export interface GameUltimatum {
    unlocked: boolean;
    level: number;
    equipped: GameHeroesData<boolean>;
};