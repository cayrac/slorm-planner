import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';

import { Bytes } from '../../slormancer';
import { BytesService } from '../services/bytes.service';

@Component({
  selector: 'app-hexa-view',
  templateUrl: './hexa-view.component.html',
  styleUrls: ['./hexa-view.component.scss']
})
export class HexaViewComponent implements OnChanges {

    @Input()
    public readonly data: Bytes;

    @Input()
    public min: number;

    @Output()
    public readonly minChange = new EventEmitter<number>();

    @Input()
    public max: number;

    @Output()
    public readonly maxChange = new EventEmitter<number>();

    public byteLines: Array<Bytes> | null = null;

    public line = 0;

    public readonly PAGE_SIZE = 25;

    public readonly LINE_SIZE = 8;

    @HostListener('mousewheel', ['$event']) 
    scrollHandler(event: WheelEvent) {
        if (event.deltaY > 0) {
            this.addLine(1);
        } else {
             this.addLine(-1);
        }
    }

    constructor(private bytesService: BytesService) { }

    public ngOnChanges() {
        this.byteLines = [];

        let cursor = 0;
        while (cursor * this.LINE_SIZE < this.data.length) {
            this.byteLines.push(this.bytesService.extract(this.data, cursor * this.LINE_SIZE, this.LINE_SIZE));

            cursor++;
        }
    }

    public maxBytesLine(): number {
        return this.data !== null ? this.data.length / this.LINE_SIZE : 0;
    }

    public addLine(value: number) {
        this.line = Math.max(this.line + value, 0);
    }

    public getBytesView() {
        return this.byteLines.slice(
            Math.min(this.byteLines.length, this.line),
            Math.min(this.byteLines.length, this.line + this.PAGE_SIZE));
    }

    private convertByte(byte: string): string {
        let char = this.bytesService.byteToChar(byte);
        
        if (byte === '00') {
            char = '&nbsp;';
        }

        return char;
    }

    public getLineAsString(line: Bytes): Array<string> {
        return line.map(c => this.convertByte(c));
    }

    public isSelected(line: number, char: number): boolean {
        const cursor = line * this.LINE_SIZE + char;

        return this.min <= cursor && this.max >= cursor;
    }

    public selectLine(viewLine: number) {
        const cursor = (this.line + viewLine) * this.LINE_SIZE;
        this.minChange.emit(cursor);
        this.maxChange.emit(cursor + this.LINE_SIZE - 1);
    }
}
