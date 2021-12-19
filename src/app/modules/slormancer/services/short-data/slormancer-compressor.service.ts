import { Injectable } from '@angular/core';

import { Bits } from '../../model/export/bits';
import { binaryToNumber, numberToBinary, takeBitsChunk } from '../../util/bits.util';

@Injectable()
export class SlormancerCompressorService {
    
    private readonly CHUNK_SIZE = 6;
    private readonly CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789$';

    constructor() { }

    public compressBinary(bits: Bits): string {
        let result = '';

        const cursor = [...bits];
        let chunk: Bits = takeBitsChunk(cursor, this.CHUNK_SIZE);

        while (chunk.length > 0) {
            const index = binaryToNumber(chunk);
            result = result + this.CHARACTERS[index];
            chunk = takeBitsChunk(cursor, this.CHUNK_SIZE);
        }

        return result;
    }

    public decompressBinary(data: string): Bits {
        return data.split('')
            .map(c => numberToBinary(this.CHARACTERS.indexOf(c), this.CHUNK_SIZE))
            .flat();
    }
}