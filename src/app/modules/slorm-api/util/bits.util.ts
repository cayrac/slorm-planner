import { Bit, Bits } from '../model/export/bits';

export function numberToBinary(value: number, maxBits: number): Bits  {
    let result: Bits = [];

    value = Math.min(Math.pow(2, maxBits), value);

    for (let i = 0 ; i < maxBits ; i++) {
        result.push(<Bit>(value % 2))
        value = Math.floor(value / 2);
    }

    return result.reverse();
}

export function binaryToNumber(bits: Bits): number  {
    return parseInt(bits.join(''), 2);
}

export function booleanToBinary(value: boolean): Bits  {
    return [ value ? 1 : 0 ];
}

export function binaryToBoolean(bits: Bits): boolean  {
    return bits[0] === 1;
}

export function takeBitsChunk(bits: Bits, size: number): Bits {
    let chunk: Bits = bits.splice(0, size);

    if (chunk.length > 0) {
        while (chunk.length < size) {
            chunk.push(0);
        }
    }

    return chunk;
}