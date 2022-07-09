import { Injectable } from '@angular/core';
import { APP_TO_GAME_VERSION_MAPPER } from '@shared/constants';

import { environment } from '../../../../../environments/environment';
import { GAME_VERSION } from '../../constants/common';
import { Character } from '../../model/character';
import { Bits } from '../../model/export/bits';
import { binaryToNumber, numberToBinary, takeBitsChunk } from '../../util/bits.util';
import { SlormancerBinaryCharacterService } from './slormancer-binary-character.service';
import { SlormancerCompressorService } from './slormancer-compressor.service';

@Injectable()
export class SlormancerShortDataService {

    constructor(private slormancerBinaryService: SlormancerBinaryCharacterService,
                private slormancerCompressorService: SlormancerCompressorService) { }

    private versionToBinary(version: string): Bits {
        const [ major, minor, fix ] = version.split('.');

        return [
            ...numberToBinary(major ? parseInt(major, 10) : 0, 4),
            ...numberToBinary(minor ? parseInt(minor, 10) : 0, 4),
            ...numberToBinary(fix ? parseInt(fix, 10) : 0, 6)
        ];
    }

    private binaryToVersion(bits: Bits): string {
        return [
            binaryToNumber(takeBitsChunk(bits, 4)),
            binaryToNumber(takeBitsChunk(bits, 4)),
            binaryToNumber(takeBitsChunk(bits, 6))
        ].join('.')
    }

    public characterToShortData(character: Character): string {
        const bits = [ ...this.versionToBinary(environment.version), ...this.slormancerBinaryService.characterToBinary(character) ];
        return this.slormancerCompressorService.compressBinary(bits);
    }
    
    public shortDataToCharacter(data: string): Character | null {
        let character: Character | null = null;

        try {
            const bits = this.slormancerCompressorService.decompressBinary(data);
            const version = this.binaryToVersion(bits);
            const originalGameVersion = APP_TO_GAME_VERSION_MAPPER[version];
            character = this.slormancerBinaryService.binaryToCharacter(bits, originalGameVersion ? originalGameVersion : GAME_VERSION);
        } catch (e) {
            console.error(e)
        }

        return character;
    }
}