import {
    AbstractEffectValue,
    EffectValueConstant,
    EffectValueSynergy,
    EffectValueVariable,
} from '../model/content/effect-value';
import { EffectValueType } from '../model/content/enum/effect-value-type';
import { Rarity } from '../model/content/enum/rarity';

export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}
export function isFirst<T>(value: T, index: number, array: Array<T>, compare: (a: T, b: T) => boolean = (a, b) => a === b): boolean {
    const found = array.find(v => compare(v, value)); 
    return found !== undefined && array.indexOf(found) === index;
}

export function compareString(a: string | null, b: string | null): number {
    if (a === null) {
        a = '';
    }    
    if (b === null) {
        b = '';
    }

    return a.localeCompare(b);
}

export function compareRarities(a: Rarity, b: Rarity): number {
    let numA = 1;
    let numB = 1;

    if (a === Rarity.Legendary) numA = 5;
    if (a === Rarity.Epic) numA = 4;
    if (a === Rarity.Rare) numA = 3;
    if (a === Rarity.Magic) numA = 2;
    if (b === Rarity.Legendary) numB = 5;
    if (b === Rarity.Epic) numB = 4;
    if (b === Rarity.Rare) numB = 3;
    if (b === Rarity.Magic) numB = 2;

    return compare(numA, numB);
}

export function compare(a: number, b: number): number {
    return a < b ? -1 : (a > b ? 1 : 0);
}

export function valueOrDefault<T>(value: T | null | undefined, defaultvalue: T): T {
    return isNotNullOrUndefined(value) ? value : defaultvalue;
}

export function valueOrNull<T>(value: T | null | undefined): T | null {
    return isNotNullOrUndefined(value) ? value : null;
}

export function notEmptyOrNull(value: string | null | undefined): string | null {
    return isNotNullOrUndefined(value) && value.length > 0 ? value : null;
}

export function findFirst(text: string, values: Array<string>): string | null {
    let closest: string | null = null
    let closestPos: number = text.length + 1;

    for (let value of values) {
        const pos = text.indexOf(value);
        if (pos !== -1 && pos < closestPos) {
            closest = value;
            closestPos = pos;
        }
    }

    return closest;
}

export function firstValue(values: { [key: number]: number }): number | null {
    let value: number | null = null;

    if (values !== null) {
        const keys = Object.keys(values);
        const index = keys[0];

        if (index) {
            value = index ? valueOrNull(values[parseInt(index)]) : null;
        }
    }

    return value;
}

export function lastValue(values: { [key: number]: number }): number | null {
    let value: number | null = null;

    if (values !== null) {
        const keys = Object.keys(values);
        const index = keys[keys.length - 1];

        if (index) {
            value = index ? valueOrNull(values[parseInt(index)]) : null;
        }
    }

    return value;
}

export function splitData(data: string | null | undefined, separator: string = '|'): Array<string> {
    return isNotNullOrUndefined(data) && data.length > 0 ? data.split(separator) : [];
}

export function removeEmptyValues(data: Array<string | undefined | null>): Array<string> {
    return data.filter(isNotNullOrUndefined).filter(v => v.length > 0);
}

export function splitNumberData(data: string, separator: string = '|'): Array<number | null> {
    return splitData(data, separator).map(v => parseInt(v)).map(v => isNaN(v) ? null : v);
}

export function splitFloatData(data: string, separator: string = '|'): Array<number | null> {
    return splitData(data, separator).map(v => parseFloat(v)).map(v => isNaN(v) ? null : v);
}

export function emptyStringToNull<T>(data: Array<T>): Array<T | null> {
    return data.map(s => typeof s === 'string' && s.length === 0 ? null : s);
}

export function isEffectValueVariable(value: AbstractEffectValue): value is EffectValueVariable {
    return value.type === EffectValueType.Variable;    
} 

export function isEffectValueConstant(value: AbstractEffectValue): value is EffectValueConstant {
    return value.type === EffectValueType.Constant;    
}

export function isEffectValueSynergy(value: AbstractEffectValue): value is EffectValueSynergy {
    return value.type === EffectValueType.Synergy;    
}

export function enumValues<T>(enumType: { [key: string]: T | string }): Array<T> {
    const values = Object.values(enumType);
    return <Array<T>><unknown>values.slice(values.length / 2);
}