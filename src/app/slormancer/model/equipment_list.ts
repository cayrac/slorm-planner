import { HeroesData } from './heroes-data';

export interface EquipmentList {
    unknown_value: number;
    equipments: HeroesData<Array<string>>
}