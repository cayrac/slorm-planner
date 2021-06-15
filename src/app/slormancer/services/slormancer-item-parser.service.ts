import { Injectable } from '@angular/core';

import { GameEnchantmentTarget } from '../constants/game/game-enchantment-target';
import { GameRarity } from '../constants/game/game-rarity';
import { GameAffix, GameEnchantment, GameEquippableItem, GameItem, GameRessourceItem } from '../model/game/game-item';
import { strictParseFloat, strictParseInt, strictSplit, toNumberArray } from '../util/save.util';

@Injectable()
export class SlormancerItemParserService {

    private AFFIXE_RARITIES = ['N', 'M', 'R', 'E', 'L'];
    private ENCHANTMENT_TARGETS = ['MA', 'AT', 'RP'];

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

    private parseAffixe(affixe: string): GameAffix {
        const [rarity, type, value, locked] = strictSplit(affixe, '.', 4);

        if (this.AFFIXE_RARITIES.indexOf(<string>rarity) === -1) {
            throw new Error('parse affixe error : Unknown rarity "' + rarity + '"');
        }

        return {
            rarity: <GameRarity>rarity,
            type: strictParseInt(<string>type),
            value: strictParseInt(<string>value),
            locked: locked === '1'
        }
    }

    private parseEnchantment(affixe: string): GameEnchantment {
        const [target, type, value] = strictSplit(affixe, '.', 3);

        if (this.ENCHANTMENT_TARGETS.indexOf(<string>target) === -1) {
            throw new Error('parse enchantment error : Unknown target "' + target + '"');
        }

        return {
            target: <GameEnchantmentTarget>target,
            type: strictParseInt(<string>type),
            value: strictParseInt(<string>value)
        }
    }

    private parseEquipable(source: string): GameEquippableItem {
        const [base, ...bonuses] = source.split(':');
        const [generic, xp] = (<string>base).split('-');
        const data = toNumberArray(<string>generic, '.', 6);
        let potentialData = (<string>xp).split('.');

        let generic_5 = potentialData[potentialData.length - 1];
        let rarity = potentialData[potentialData.length - 2];
        let potential =  potentialData.length === 4 ? potentialData[0] + '.' + potentialData[1] : potentialData[0];

        const item: GameItem = {
            generic_1: <number>data[0],
            slot: <number>data[1],
            level: <number>data[2],
            reinforcment: <number>data[5],
            potential: strictParseFloat(<string>potential),
            rarity: strictParseInt(<string>rarity),
            generic_4: <number>data[3],
            generic_5: strictParseInt(<string>generic_5),
            affixes: bonuses.filter(a => this.isAffixe(a)).map(a => this.parseAffixe(a)),
            enchantments: bonuses.filter(a => this.isEnchantment(a)).map(a => this.parseEnchantment(a))
        }

        return item;
    }

    private parseRessource(source: string): GameRessourceItem {
        const data = toNumberArray(source, '.', 8);

        return {
            quantity: <number>data[4],
            quality: <number>data[2],
            type: data[1] + '.' + data[3]
        }
    }

    public parseItem(value: string): GameItem | null {
        let item: GameItem | null = null;

        if (this.isRessource(value)) {
            item = this.parseRessource(value);
        } else if (this.isEquipable(value)) {
            item = this.parseEquipable(value);
        }
        
        return item;
    }
}