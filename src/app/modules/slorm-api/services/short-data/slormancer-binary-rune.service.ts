import { Injectable } from '@angular/core';

import { HeroClass } from '../../model/content/enum/hero-class';
import { Bits } from '../../model/export/bits';
import { RunesCombination } from '../../model/runes-combination';
import { binaryToBoolean, binaryToNumber, booleanToBinary, numberToBinary, takeBitsChunk } from '../../util/bits.util';
import { compareVersions } from '../../util/utils';
import { SlormancerRuneService } from '../content/slormancer-rune.service';

@Injectable()
export class SlormancerBinaryRuneService {
    
    constructor(private slormancerRuneService: SlormancerRuneService) { }

    public runesCombinationToBinary(runes: RunesCombination): Bits {
        let result: Bits = [];

        result.push(...booleanToBinary(runes.activation !== null));
        if (runes.activation !== null) {
            result.push(...numberToBinary(runes.activation.id, 6));
            result.push(...numberToBinary(runes.activation.level, 5))
        }
        result.push(...booleanToBinary(runes.effect !== null));
        if (runes.effect !== null) {
            result.push(...numberToBinary(runes.effect.id, 6));
            result.push(...numberToBinary(runes.effect.level, 5))
        }
        result.push(...booleanToBinary(runes.enhancement !== null));
        if (runes.enhancement !== null) {
            result.push(...numberToBinary(runes.enhancement.id, 6));
            result.push(...numberToBinary(runes.enhancement.level, 5))
        }

        return result;
    }

    public binaryToRunesCombination(binary: Bits, heroClass: HeroClass, version: string, reaperId: number | null): RunesCombination {
        const result: RunesCombination = { activation: null, effect: null, enhancement: null };

        if (compareVersions(version, '0.2.0') >= 0) {
            if (binaryToBoolean(takeBitsChunk(binary, 1))) {
                const runeId = binaryToNumber(takeBitsChunk(binary, 6));
                const runeLevel = binaryToNumber(takeBitsChunk(binary, 5));
                result.activation = this.slormancerRuneService.getRuneById(runeId, heroClass, runeLevel, reaperId);
            }
            if (binaryToBoolean(takeBitsChunk(binary, 1))) {
                const runeId = binaryToNumber(takeBitsChunk(binary, 6));
                const runeLevel = binaryToNumber(takeBitsChunk(binary, 5));
                result.effect = this.slormancerRuneService.getRuneById(runeId, heroClass, runeLevel, reaperId);
            }
            if (binaryToBoolean(takeBitsChunk(binary, 1))) {
                const runeId = binaryToNumber(takeBitsChunk(binary, 6));
                const runeLevel = binaryToNumber(takeBitsChunk(binary, 5));
                result.enhancement = this.slormancerRuneService.getRuneById(runeId, heroClass, runeLevel, reaperId);
            }
        }

        return result;
    }
}