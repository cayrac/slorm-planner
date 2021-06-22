import { Bytes } from '../model/game/bytes';

export function toBytes(content: string): Bytes {
    return <Bytes>content.match(/.{2}/g);
}

export function byteToNumber(byte: string): number {
    return parseInt(byte, 16);
}

export function byteToChar(byte: string): string {
    const code = byteToNumber(byte);
    let char: string;

    if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 14, 16, 18, 22, 23, 127].find(c => c === code) !== undefined) {
        char = ' ';
    } else {
        char = String.fromCharCode(code);
    }

    return char;
}

export function removeUnwantedChar(value: string): string {
    return value.trim().replace(/^.+\s{2,}/g, '');
}

export function bytesToString(bytes: Bytes): string {
    return removeUnwantedChar(bytes.map(byteToChar).join(''));
}

export function bytesEqual(a: Bytes, b: Bytes, size: number): boolean {
    return Array.from(new Array(size).keys()).map(i => a[i] === b[i]).find(v => !v) === undefined;
}

export function bytesIndexOf(data: Bytes, needle: Bytes): number | null {
    let pos = null;

    for (let cursor = 0 ; cursor < data.length ; cursor++) {
        if (bytesEqual(slice(data, cursor, needle.length), needle, needle.length)) {
            pos = cursor;
            break;
        }
    }

    return pos;
}

export function slice(bytes: Bytes, position: number, n: number) {
    return bytes.slice(Math.min(Math.max(position, 0), bytes.length), Math.min(Math.max(position + n, 0), bytes.length));
}

export function splice(bytes: Bytes, position: number, n: number) {
    return bytes.splice(Math.min(Math.max(position, 0), bytes.length), Math.min(Math.max(n, 0), bytes.length));
}

export function takeUntil(data: Bytes, end: Bytes | null = null): Bytes {
    let max = end === null ? data.length : bytesIndexOf(data, end);
    let result: Bytes = [];

    if (max !== null) {
        result = splice(data, 0, max);
        if (end !== null) {
            splice(data, 0, end.length);
        }
    }

    console.log('take until : ', bytesToString(result));

    return result;
}