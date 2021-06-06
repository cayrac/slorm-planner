import { Injectable } from '@angular/core';

import { Bytes } from '../../slormancer/model/bytes';

@Injectable({providedIn: 'root'})
export class BytesService {

    public extract(bytes: Bytes, position: number, n: number): Bytes {
        return bytes.slice(Math.min(Math.max(position, 0), bytes.length), Math.min(Math.max(position + n, 0), bytes.length));
    }

    public stringToBytes(content: string): Bytes {
        return content.match(/.{2}/g);
    }

    public parseInt(bytes: Bytes): number {
        return parseInt(bytes.join(''), 16);
    }

    public byteToChar(byte: string) {
        return this.codeToChar(this.parseInt([byte]));
    }

    public codeToChar(code: number) {
        let char: string;

        char = String.fromCharCode(code);
        
        return char;
    }

    public parseString(bytes: Bytes): string {
        return bytes.map(byte => this.codeToChar(parseInt(byte, 16))).join('');
    }

    public bytesEqual(a: Bytes, b: Bytes, size: number): boolean {
        return Array.from(new Array(size).keys()).map(i => a[i] === b[i]).find(v => !v) === undefined;
    }

    private bytesPos(data: Bytes, needle: Bytes): number | null {
        let pos = null;

        for (let cursor = 0 ; cursor < data.length ; cursor++) {
            if (this.bytesEqual(this.extract(data, cursor, needle.length), needle, needle.length)) {
                pos = cursor;
                break;
            }
        }

        return pos;
    }

    public getBytesBetween(data: Bytes, before: Bytes, after: Bytes | null = null) {
        let min = this.bytesPos(data, before);
        let max = after === null ? data.length : this.bytesPos(data, after);

        if (min < max) {
            min = min + before.length;
        } else {
            const tmp = max;
            max = min;
            min = tmp + after.length;
        }

        return this.extract(data, min, max - min);
    }
}