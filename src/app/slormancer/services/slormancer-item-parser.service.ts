import { Injectable } from '@angular/core';

import { Affixe, AffixeRarity, Enchantment, EnchantmentTarget, EquippableItem, Item, RessourceItem } from '../model/item';
import { strictParseFloat, strictParseInt, strictSplit, toNumberArray } from '../util/save.util';

@Injectable()
export class SlormancerItemParserService {

    public AFFIXE_RARITIES = ['N', 'M', 'R', 'E', 'L'];
    public ENCHANTMENT_TARGETS = ['MA', 'AT', 'RP'];

    private isRessource(value: string): boolean {
        return value.startsWith('0') && value.length > 1;
    }

    private isEquipable(value: string): boolean {
        return !value.startsWith('0') && value.length > 1;
    }

    private isAffixe(value: string): boolean {
        return value.split('.').length === 4;
    }

    private isEnchantment(value: string): boolean {
        return value.split('.').length === 3;
    }

    private parseAffixe(affixe: string): Affixe {
        const [rarity, type, value, locked] = strictSplit(affixe, '.', 4);

        if (this.AFFIXE_RARITIES.indexOf(rarity) === -1) {
            throw new Error('parse affixe error : Unknown rarity "' + rarity + '"');
        }

        return {
            rarity: <AffixeRarity>rarity,
            type: strictParseInt(type),
            value: strictParseInt(value),
            locked: locked === '1'
        }
    }

    private parseEnchantment(affixe: string): Enchantment {
        const [target, type, value] = strictSplit(affixe, '.', 3);

        if (this.ENCHANTMENT_TARGETS.indexOf(target) === -1) {
            throw new Error('parse enchantment error : Unknown target "' + target + '"');
        }

        return {
            target: <EnchantmentTarget>target,
            type: strictParseInt(type),
            value: strictParseInt(value)
        }
    }

    private parseEquipable(source: string): EquippableItem {
        const [base, ...bonuses] = source.split(':');

        const [generic, xp] = base.split('-');
        const [ generic_1, slot, level, generic_4, q, reinforcment ] = toNumberArray(generic, '.', 6);
        let potential = xp.split('.');

        if (potential.length === 4) {
            potential = [ potential[0] + '.' + potential[1], potential[2], potential[3] ];
        }

        const item: Item = {
            generic_1,
            slot,
            level,
            reinforcment,
            potential: strictParseFloat(potential[0]),
            rarity: strictParseInt(potential[2]),
            generic_4,
            generic_5: strictParseInt(potential[1]),
            affixes: bonuses.filter(a => this.isAffixe(a)).map(a => this.parseAffixe(a)),
            enchantments: bonuses.filter(a => this.isEnchantment(a)).map(a => this.parseEnchantment(a))
        }

        return item;
    }

    private parseRessource(source: string): RessourceItem {
        const [a, typea, quality, typeb, quantity, e, f, g] = toNumberArray(source, '.', 8);

        return {
            quantity,
            quality,
            type: typea + '.' + typeb
        }
    }

    public parseItem(value: string): Item | null {
        let item: Item | null = null;

        if (this.isRessource(value)) {
            item = this.parseRessource(value);
        } else if (this.isEquipable(value)) {
            item = this.parseEquipable(value);
        }
        
        return item;
    }
}