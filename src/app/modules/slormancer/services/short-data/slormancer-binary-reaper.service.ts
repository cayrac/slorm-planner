import { Injectable } from '@angular/core';

import { HeroClass } from '../../model/content/enum/hero-class';
import { Reaper } from '../../model/content/reaper';
import { Bits } from '../../model/export/bits';
import { binaryToBoolean, binaryToNumber, booleanToBinary, numberToBinary, takeBitsChunk } from '../../util/bits.util';
import { SlormancerReaperService } from '../content/slormancer-reaper.service';

@Injectable()
export class SlormancerBinaryReaperService {
    
    constructor(private slormancerReaperService: SlormancerReaperService) { }

    public reaperToBinary(reaper: Reaper): Bits {
        let result: Bits = [];

        result.push(...numberToBinary(reaper.id, 10));
        result.push(...booleanToBinary(reaper.primordial));
        result.push(...numberToBinary(reaper.baseLevel, 7))
        // result.push(...numberToBinary(reaper.kills, 20))

        return result;
    }

    public binaryToReaper(binary: Bits, heroClass: HeroClass): Reaper {
        const reaperId = binaryToNumber(takeBitsChunk(binary, 10));
        const primordial = binaryToBoolean(takeBitsChunk(binary, 1));
        const level = binaryToNumber(takeBitsChunk(binary, 7));
        const kills = 0; // binaryToNumber(takeBitsChunk(binary, 20));

        const reaper = this.slormancerReaperService.getReaperById(reaperId, heroClass, primordial, level, level, kills, kills);

        if (reaper === null) {
            throw new Error('Failed to parse reaper from binary : ' + binary.join());
        }

        return reaper;
    }
}