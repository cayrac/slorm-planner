import { HeroesData } from './heroes-data';
import { Weapon } from './weapon';

export interface WeaponData {
    unknown_value: number;
    weapon_data: HeroesData<Array<Weapon>>
}