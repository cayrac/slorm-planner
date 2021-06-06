import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root'})
export class JsonPrintService {

    public readonly TAB = '&nbsp;&nbsp;&nbsp;&nbsp;';
    public readonly RETURN = "\n";

    private tabs(quantity: number): string {
        return this.TAB.repeat(quantity);
    }

    private toText(value: string): string {
        return '<span class="text">"' + value + '"</span>'
    }

    private toNumber(value: number): string {
        const classes = ['number'];

        if (value === -1) {
            classes.push('minus-one');
        } else if (value !== 0) {
            classes.push('non-zero');
        }
        
        return '<span class="' + classes.join(' ') + '">' + value + '</span>';
    }


    public jsonToString(data: any, level: number = 0): string {
        let value = '[value]';

        if (data === null) {
            value = 'null';
        } else if (typeof data === 'string') {
            value = this.toText(data);
        } else if (typeof data === 'number') {
            value = this.toNumber(data);
        } else if (Array.isArray(data)) {
            value = '[' + data.map(v => this.jsonToString(v, level + 1)).join(', ') + ']';
        } else {
            const content = Object.keys(data)
                .map(key => this.tabs(level + 1) + '"' + key + '": ' + this.jsonToString(data[key], level + 1)).join(',' + this.RETURN);
            value = '{ ' + this.RETURN + content + this.RETURN + this.tabs(level) + '}';
        }


        return value
    }
}