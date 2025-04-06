import { Injectable } from '@angular/core';

import { UltimatumType } from '../../model/content/enum/ultimatum-type';
import { Ultimatum } from '../../model/content/ultimatum';
import { Bits } from '../../model/export/bits';
import { binaryToNumber, numberToBinary, takeBitsChunk } from '../../util/bits.util';
import { SlormancerUltimatumService } from '../content/slormancer-ultimatum.service';

@Injectable()
export class SlormancerBinaryUltimatumService {
    
    constructor(private slormancerUltimatumService: SlormancerUltimatumService) { }

    public ultimatumToBinary(ultimatum: Ultimatum | null): Bits {
        let result: Bits = [];

        result.push(...numberToBinary(ultimatum === null ? 0 : ultimatum.type + 1, 5));
        result.push(...numberToBinary(ultimatum === null ? 0 : ultimatum.baseLevel, 5));
        
        return result;
    }

    public binaryToUltimatum(binary: Bits, bonusLevel: number): Ultimatum | null {
        const type = binaryToNumber(takeBitsChunk(binary, 5));
        const level = binaryToNumber(takeBitsChunk(binary, 5));

        return type === 0 ? null : this.slormancerUltimatumService.getUltimatum(<UltimatumType>type - 1, level, bonusLevel);
    }
}