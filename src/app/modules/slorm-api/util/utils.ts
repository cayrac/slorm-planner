import { environment } from 'src/environments/environment';
import { CharacterGear, EquipableItem, LegendaryEffect, MinMax } from '../model';
import { CraftableEffect } from '../model/content/craftable-effect';
import {
    AbstractEffectValue,
    EffectValueConstant,
    EffectValueSynergy,
    EffectValueVariable,
} from '../model/content/effect-value';
import { EffectValueType } from '../model/content/enum/effect-value-type';
import { Rarity } from '../model/content/enum/rarity';

export function debugNumber(value: number | MinMax): string {
    return typeof value === 'number' ? value.toString() : value.min + '-' + value.max;
}

export function getAllItems(gear: CharacterGear): EquipableItem[] {
    return [
        gear.amulet,
        gear.belt,
        gear.body,
        gear.boot,
        gear.bracer,
        gear.cape,
        gear.glove,
        gear.helm,
        gear.ring_l,
        gear.ring_r,
        gear.shoulder,
    ].filter(isNotNullOrUndefined);
}

export function getAllLegendaryEffects(gear: CharacterGear): LegendaryEffect[] {
    return getAllItems(gear)
        .map(item => item.legendaryEffect)
        .filter(isNotNullOrUndefined);
}

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
    if (a === Rarity.Defensive) numA = 1;
    if (a === Rarity.Normal) numA = 0;
    if (b === Rarity.Legendary) numB = 5;
    if (b === Rarity.Epic) numB = 4;
    if (b === Rarity.Rare) numB = 3;
    if (b === Rarity.Magic) numB = 2;
    if (b === Rarity.Defensive) numB = 1;
    if (b === Rarity.Normal) numB = 0;

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

export function lastIndex(values: { [key: number]: any }): number | null {
    let index: number | null = null;

    if (values !== null) {
        const keys = Object.keys(values);
        const valueIndex = valueOrNull(keys[keys.length - 1]);

        if (valueIndex) {
            index = parseInt(valueIndex);
        }
    }

    return index;
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

export function isNotEffectValueSynergy(value: AbstractEffectValue): value is EffectValueVariable | EffectValueConstant {
    return value.type !== EffectValueType.Synergy;    
}

export function getCraftValue(craftedValue: CraftableEffect, craft: number, defaultValue: number = 0) {
    const found = craftedValue.possibleCraftedValues.find(v => v.craft === craft);
    return found ? found.value : defaultValue;
}

export function getBaseCraftValue(craftedValue: CraftableEffect, craft: number, defaultValue: number = 0) {
    const found = craftedValue.basePossibleCraftedValues.find(v => v.craft === craft);
    return found ? found.value : defaultValue;
}

export function isDamageType(stat: string): boolean {
    return stat === 'elemental_damage'
        || stat === 'physical_damage'
        || stat === 'basic_damage'
        || stat === 'weapon_damage'
        || stat === 'bleed_damage'
        || stat === 'damage'
        || stat === 'ravenous_dagger_damage'
        || stat === 'trap_damage'
        || stat === 'poison_damage'
        || stat === 'righteous_sunlight_damage'
        || stat === 'butterfly_elemental_damage'
        || stat === 'wandering_arrow_damage'
    ;
}

/**
 * 
 * @param a:  version as string
 * @param b:  version as string
 * @returns > 0 if a > b, 0 if a and b are equal, < 0 if a < b
 */
export function compareVersions(a: string, b: string): number {
    const regExStrip0 = /(\.0+)+$/;
    const segmentsA = a.replace(regExStrip0, '').split('.');
    const segmentsB = b.replace(regExStrip0, '').split('.');
    const minLength = Math.min(segmentsA.length, segmentsB.length);

    let diff;
    for (let i = 0; i < minLength; i++) {
        diff = parseInt(<string>segmentsA[i], 10) - parseInt(<string>segmentsB[i], 10);
        if (diff) {
            return diff;
        }
    }
    return segmentsA.length - segmentsB.length;
}

export function minAndMax(min: number, value: number, max: number): number {
    return Math.max(Math.min(max, value), min);
}

export function warnIfEqual(a: any, b: any, ...message: any[]) {
    if (a === b && environment.debug) {
        console.warn(...message);
    }
}

export function numberToString(value: number): string {
    return value.toLocaleString().replace(/(\s)/g, '$1$1');
}

export function getOlorinUltimatumBonusLevel(gear: CharacterGear): number {
    return getAllLegendaryEffects(gear)
    .filter(legendaryEffect => legendaryEffect.id === 147)
    .map(legendaryEffect => legendaryEffect.effects[0]?.effect.value)[0] ?? 0;
}

export function adaptOverlay(element: HTMLElement) {
    const clientRect = element.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    if (clientRect.top < 0) {
        const cdk = document.getElementsByClassName('cdk-overlay-pane');
        for (const element of Array.from(cdk)) {
            if (!element.classList.contains('force-top')) {
                element.classList.add('force-top');
            }
        }
    } else if (clientRect.bottom > screenHeight) {
        const cdk = document.getElementsByClassName('cdk-overlay-pane');
        for (const element of Array.from(cdk)) {
            if (!element.classList.contains('force-bottom')) {
                element.classList.add('force-bottom');
            }
        }
    }
}

export function resetOverlay() {
    const cdk = document.getElementsByClassName('cdk-overlay-pane');
    for (const element of Array.from(cdk)) {
        element.classList.remove('force-bottom');
        element.classList.remove('force-top');
    }
}