import { Injectable } from '@angular/core';

import { API_VERSION } from '../../constants/common';
import { Character } from '../../model/character';
import { Bits } from '../../model/export/bits';
import { binaryToNumber, numberToBinary, takeBitsChunk } from '../../util/bits.util';
import { SlormancerBinaryCharacterService } from './slormancer-binary-character.service';
import { SlormancerCompressorService } from './slormancer-compressor.service';
import { SlormancerBinaryConfigurationService } from './slormancer-binary-configuration.service';
import { CharacterConfig } from '../../model';

@Injectable()
export class SlormancerShortDataService {

    constructor(private slormancerBinaryCharacterService: SlormancerBinaryCharacterService,
                private slormancerCompressorService: SlormancerCompressorService,
                private slormancerBinaryConfigurationService: SlormancerBinaryConfigurationService) { }

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

    public characterToShortData(character: Character, config: CharacterConfig): string {
        const bits = [
            ...this.versionToBinary(API_VERSION),
            ...this.slormancerBinaryCharacterService.characterToBinary(character),
            ...this.slormancerBinaryConfigurationService.configurationToBinary(config, character, API_VERSION),
        ];
        return this.slormancerCompressorService.compressBinary(bits);
    }
    
    public shortDataToCharacter(data: string): { character: Character | null, configuration: Partial<CharacterConfig> | null } {
        let result: { character: Character | null, configuration: Partial<CharacterConfig> | null } = {
            character: null,
            configuration: null
        };

        try {
            const bits = this.slormancerCompressorService.decompressBinary(data);
            const version = this.binaryToVersion(bits);
            result.character = this.slormancerBinaryCharacterService.binaryToCharacter(bits, version);
            if (result.character !== null) {
                result.configuration = this.slormancerBinaryConfigurationService.binaryToConfiguration(bits, result.character, version);
            }
        } catch (e) {
            console.error(e)
        }

        return result;
    }
}