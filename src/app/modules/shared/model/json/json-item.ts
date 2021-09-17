import { EquipableItemBase } from '../../../slormancer/model/content/enum/equipable-item-base';
import { Rarity } from '../../../slormancer/model/content/enum/rarity';

export interface JsonItem {
    ba: EquipableItemBase;
    rar: Rarity;
    lvl: number;
    up: number;
    aff: Array<{ r: Rarity; p: number; s: string; c: number; }>;
    leg: { id: number; c: number } | null;
    rea: { r: number; c: number } | null;
    ski: { s: number; c: number } | null;
    att: { a: number; c: number } | null;
}
