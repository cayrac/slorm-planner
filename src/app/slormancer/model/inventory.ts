import { HeroesData } from './heroes-data';
import { Item } from './item';

export interface Inventory {
    unknown_value: number;
    inventory: HeroesData<Array<Item>>
}