import { Auras } from './auras';
import { ElementRank } from './element-rank';
import { EquipmentList } from './equipment_list';
import { HeroesData } from './heroes-data';
import { Influence } from './influence';
import { Inventory } from './inventory';
import { Missions } from './missions';
import { Profile } from './profile';
import { SharedInventory } from './shared-inventory';
import { SkillEquip } from './skill-equip';
import { SkillRank } from './skill-rank';
import { StatsFetched } from './stats-fetched';
import { Traits } from './traits';
import { Tutorials } from './tutorials';
import { WeaponData } from './weapon-data';
import { Xp } from './xp';

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
