import { Item } from './item';

export interface SharedInventory {
    unknown_value: number;
    items: Array<Item | null>
}