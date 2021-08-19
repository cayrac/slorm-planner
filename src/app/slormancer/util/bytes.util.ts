import { Bytes } from '../model/game/bytes';

export function toBytes(content: string): Bytes {
    return <Bytes>content.match(/.{2}/g);
}

export function byteToNumber(byte: string): number {
    return parseInt(byte, 16);
}

export function stringToBytes(value: string): Bytes {
    return Array.from(value).map(charToByte);
}

export function charToByte(char: string): string {
    let code = char.charCodeAt(0).toString(16).toUpperCase();
    return code.length === 1 ? '0' + code : code;
}

export function byteToChar(byte: string): string {
    const code = byteToNumber(byte);
    let char: string;

    if (code <= 31 || code >= 127 && code <= 159) {
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

export function bytesFindFirst(data: Bytes, values: Array<Bytes>): Bytes | null {
    let closest: Bytes | null = null;
    let closestPos: number = data.length + 1;

    for (let value of values) {
        const pos = bytesIndexOf(data, value);
        if (pos !== null && pos < closestPos) {
            closest = value;
            closestPos = pos;
        }
    }

    return closest;
}

export function bytesFindPositions(data: Bytes, values: Array<Bytes>): Array<number> {
    let positions: Array<number> = values.map(() => -1);

    let matcheds: Array<{ value: Bytes, index: number, length: number }> = [];
    for (let i = 0 ; i < data.length ; i++) {
        matcheds = [];
        values.forEach((value, index) => {
            if (data[i] === value[0]) {
                matcheds.push({ value, index, length: value.length });
            }
        });

        if (matcheds.length > 0) {
            matcheds = matcheds.sort((a, b) => a.length > b.length ? -1 : (a.length < b.length ? 1 : 0));

            const result = matcheds.find(matched => bytesEqual(matched.value, slice(data, i, matched.length), matched.length));

            if (result !== undefined) {
                positions[result.index] = i;
                i = i + result.length - 1;
            }
        }
    }

    return positions;
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

    return result;
}