import { Component, Input, OnChanges } from '@angular/core';

import { JsonPrintService } from '../../service/json-print.service';

@Component({
  selector: 'app-json',
  templateUrl: './json.component.html',
  styleUrls: ['./json.component.scss']
})
export class JsonComponent implements OnChanges {

    @Input()
    public readonly data: any;

    public formatted: string | null = null;

    constructor(private savePrintService: JsonPrintService) { }

    public ngOnChanges() {
        this.formatted = this.savePrintService.jsonToString(this.data);
    }
}
