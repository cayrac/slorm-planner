import { Item } from './item';

export interface SlormSave {
    quest_list: string,
    weapon_equip: HeroesData<number>,
    stats_fetched: StatsFetched,
    version: string,
    slormite_list: string,
    shared_inventory: SharedInventory,
    first_hero: string,
    weapon_data: WeaponData,
    gamemode: HeroesData<number>,
    skill_equip: SkillEquip,
    hero: string,
    missions: Missions,
    store_refresh_list: string,
    traits: Traits,
    reputation: string,
    wrath: HeroesData<number>,
    skill_rank: SkillRank,
    reaper_pity: HeroesData<number>,
    gold: string,
    xp: Xp,
    inventory: Inventory,
    slorm: HeroesData<number>,
    influence: Influence,
    element_equip: HeroesData<Array<number>>,
    tutorials: Tutorials,
    equipment_list: EquipmentList,
    element_rank: ElementRank,
    enemy_match: HeroesData<number>,
    auras: Auras,
    profile: Profile,
    enemy_level: HeroesData<number>,

    hash: string;
}

export declare type Auras = HeroesData<Array<number>>;
export declare type SkillRank = HeroesData<Array<number>>;
export declare type ElementRank = HeroesData<Array<number>>;
export declare type EquipmentList = HeroesData<Array<string>>;
export declare type Influence = Array<number>;
export declare type Inventory = HeroesData<HeroInventory>;
export declare type Missions = HeroesData<Array<number>>;
export declare type Profile = HeroesData<Array<number>>;
export declare type SharedInventory = Array<Item | null>;
export declare type SkillEquip = HeroesData<Array<number>>;
export declare type StatsFetched = HeroesData<Array<number>>;
export declare type Traits = HeroesData<Array<number>>;
export declare type Tutorials = Array<number>;
export declare type WeaponData = HeroesData<Array<Weapon>>;
export declare type Xp = HeroesData<number>;

export interface HeroesData<T> {
    mage: T,
    warrior: T,
    huntress: T
}

export interface HeroInventory {
    hemlet: Item | null;
    chest: Item | null;
    spaulder: Item | null;
    bracers: Item | null;
    gloves: Item | null;
    boots: Item | null;
    ring_l: Item | null;
    ring_r: Item | null;
    amulet: Item | null;
    belt: Item | null;
    cape: Item | null;
    bag: Array<Item | null>;
};

export interface Weapon {
    basic: Array<number>; // TODO, pas de basic / primordial
    primordial: Array<number>;
};