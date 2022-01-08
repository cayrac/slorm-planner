import { Injectable } from '@angular/core';

import { GameEnchantmentTarget } from '../../model/parser/game/game-enchantment-target';
import {
    GameAffix,
    GameEnchantment,
    GameEquippableItem,
    GameItem,
    GameRessourceItem,
} from '../../model/parser/game/game-item';
import { GameRarity } from '../../model/parser/game/game-rarity';
import { strictParseFloat, strictParseInt, strictSplit, toNumberArray } from '../../util/parse.util';
import { splitData } from '../../util/utils';

@Injectable()
export class SlormancerItemParserService {

    private AFFIXE_RARITIES = ['N', 'M', 'R', 'E', 'L'];
    private ENCHANTMENT_TARGETS = ['MA', 'AT', 'RP'];

    private isRessource(value: string): boolean {
        return value.startsWith('0') && splitData(value, '.').length > 5;
    }

    private isEquipable(value: string): boolean {
        return !value.startsWith('0') && value.length > 1;
    }

    private isAffixe(value: string): boolean {
        const length = value.split('.').length
        return length === 6 || length === 5 ||length === 4;
    }

    private isEnchantment(value: string): boolean {
        return value.split('.').length === 3;
    }

    private parseAffixe(affixe: string): GameAffix {
        const [rarity, type, value, locked, pure, _ ] = strictSplit(affixe, '.', { min: 4, max: 6 });

        if (this.AFFIXE_RARITIES.indexOf(<string>rarity) === -1) {
            throw new Error('parse affixe error : Unknown rarity "' + rarity + '"');
        }

        let parsedPureValue: number | null = null;
        if (pure !== undefined) {
            parsedPureValue = strictParseInt(pure);
        }


        return {
            rarity: <GameRarity>rarity,
            type: strictParseInt(<string>type),
            value: strictParseInt(<string>value),
            locked: locked === '1',
            pure: parsedPureValue
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

        const item: GameEquippableItem = {
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
        const data = toNumberArray(source, '.');
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