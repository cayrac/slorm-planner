import { Injectable } from '@angular/core';

import { SlormSave } from '../../slormancer';

@Injectable({providedIn: 'root'})
export class SavePrintService {

    public readonly TAB = '&nbsp;&nbsp;&nbsp;&nbsp;';
    public readonly RETURN = "\n";

    private toText(value: string): string {
        return '<span class="text">"' + value + '"</span>'
    }

    private toNumber(value: number): string {
        const classes = ['number'];

        if (value !== 0) {
            classes.push('non-zero')
        }

        return '<span class="' + classes.join(' ') + '">' + value + '</span>';
    }


    private valueTostring(data: any): string {
        let value = '[value]';

        if (data === null) {
            value = 'null';
        } else if (typeof data === 'string') {
            value = this.toText(data);
        } else if (typeof data === 'number') {
            value = this.toNumber(data);
        } else if (Array.isArray(data)) {
            value = '[' + data.map(v => this.valueTostring(v)).join(', ') + ']';
        } else {
            value = '{ ' + Object.keys(data).map(key => '"' + key + '": ' + this.valueTostring(data[key])).join(', ') + ' }';
        }


        return value
    }

    public saveToString(save: SlormSave): string {
        return [
            '{',
            ...Object.keys(save).map(key => this.TAB + '"' + key + '": ' + this.valueTostring(save[key])),
            '}'
        ].join(this.RETURN);
    }
}