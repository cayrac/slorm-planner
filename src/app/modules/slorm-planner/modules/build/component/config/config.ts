import { Character } from '@slorm-api';

export interface ConfigEntryNumber {
    type: 'number';
    key: string;
    label: string;
    info?: string;
}
export interface ConfigEntryBoolean {
    type: 'boolean';
    key: string;
    label: string;
    info?: string;
}

export interface ConfigEntryEnum {
    type: 'enum';
    key: string;
    label: string;
    info?: string;
    values?: Array<{ value: string, label: string }>;
}

export declare type ConfigEntry = ConfigEntryNumber | ConfigEntryBoolean | ConfigEntryEnum;

export interface ConfigGroup {
    condition: (character: Character) => boolean;
    title: string;
    configurations: Array<ConfigEntry>
}