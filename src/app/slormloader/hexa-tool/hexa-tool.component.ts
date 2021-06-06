import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Bytes } from '../../slormancer';
import { SlormSave } from '../../slormancer/model/slormsave';
import { BytesService } from '../services/bytes.service';
import { SavePrintService } from '../services/save-print.service';

@Component({
  selector: 'app-hexa-tool',
  templateUrl: './hexa-tool.component.html',
  styleUrls: ['./hexa-tool.component.scss']
})
export class HexaToolComponent {

    @Input()
    public readonly data: Bytes;

    @Input()
    public readonly save: SlormSave;

    @Input()
    public min: number;

    @Output()
    public readonly minChange = new EventEmitter<number>();

    @Input()
    public max: number;

    @Output()
    public readonly maxChange = new EventEmitter<number>();

    constructor(private bytesService: BytesService,
                private savePrintService: SavePrintService) { }

    public hasSelection(): boolean {
        return this.min >= 0 && this.max >= 0;
    }

    public getSelection(): Bytes {
        return this.bytesService.extract(this.data, this.min, this.max - this.min + 1);
    }

    public reduceMin() {
        this.min = Math.max(this.min - 1, 0);
        this.minChange.emit(this.min);
    }    
    
    public increaseMin() {
        this.min = Math.min(this.min + 1, this.max);
        this.minChange.emit(this.min);
    }

    public reduceMax() {
        this.max = Math.max(this.max - 1, this.min);
        this.maxChange.emit(this.max);
    }    
    
    public increaseMax() {
        this.max = Math.min(this.max + 1, this.data.length - 1);
        this.maxChange.emit(this.max);
    }

    public getAscii(): string {
        return this.bytesService.parseString(this.getSelection());
    }

    public getInteger(): number {
        return this.bytesService.parseInt(this.getSelection());
    }

    private convertByte(byte: string): string {
        let char = '';

        if (byte === '0A') {
            char = '\n';
        } else if (byte !== '00' && (byte.startsWith('1') || byte.startsWith('0'))) {
            char = '<' + byte + '>';
        } else {
            char = this.bytesService.byteToChar(byte);
        }

        return char;
    }

    public allText(): string {
        return this.data.map(c => this.convertByte(c)).join('');
    }

    public formatedSave(): string {
        return this.savePrintService.saveToString(this.save);
    }
}