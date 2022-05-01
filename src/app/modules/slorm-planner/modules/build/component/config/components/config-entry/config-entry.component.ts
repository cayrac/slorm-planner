import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { ConfigEntry, ConfigEntryBoolean, ConfigEntryEnum, ConfigEntryNumber } from '../../config';

@Component({
  selector: 'app-config-entry',
  templateUrl: './config-entry.component.html',
  styleUrls: ['./config-entry.component.scss']
})
export class ConfigEntryComponent {

    @Input()
    public readonly control: FormControl | null = null;

    @Input()
    public readonly config: ConfigEntry | null = null;

    constructor() { }

    public isNumber(config: ConfigEntry): config is ConfigEntryNumber {
        return config.type === 'number';
    } 

    public isEnum(config: ConfigEntry): config is ConfigEntryEnum {
        return config.type === 'enum';
    } 

    public isBoolean(config: ConfigEntry): config is ConfigEntryBoolean {
        return config.type === 'boolean';
    } 
}
