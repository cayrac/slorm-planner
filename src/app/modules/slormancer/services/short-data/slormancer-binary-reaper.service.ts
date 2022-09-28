import { Injectable } from '@angular/core';
import { MAX_REAPER_AFFINITY_BASE } from '@slormancer/constants/common';
import { compareVersions } from '@slormancer/util/utils';

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
        result.push(...numberToBinary(reaper.level, 7))
        result.push(...numberToBinary(reaper.baseAffinity, 7))

        return result;
    }

    public binaryToReaper(binary: Bits, heroClass: HeroClass, version: string): Reaper {
        const reaperId = binaryToNumber(takeBitsChunk(binary, 10));
        const primordial = binaryToBoolean(takeBitsChunk(binary, 1));
        const level = binaryToNumber(takeBitsChunk(binary, 7));
        const kills = 0;

        const hasAffinityData = compareVersions(version, '0.2.0') >= 0;

        const affinity = hasAffinityData ? binaryToNumber(takeBitsChunk(binary, 7)) : MAX_REAPER_AFFINITY_BASE;

        const reaper = this.slormancerReaperService.getReaperById(reaperId, heroClass, primordial, level, level, kills, kills, affinity);

        if (reaper === null) {
            throw new Error('Failed to parse reaper from binary : ' + binary.join());
        }

        return reaper;
    }
}