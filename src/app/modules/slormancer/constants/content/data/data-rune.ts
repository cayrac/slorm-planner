import { DataRune } from '@slormancer/model/content/data/data-rune';
import { Rune } from '@slormancer/model/content/rune';


function setStat(rune: Rune, index: number, stat: string) {
    const value = rune.values[index]

    if (value) {
        value.stat = stat;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}
/*
function valueMultiply100(effect: LegendaryEffect, index: number) {
    const value = effect.effects[index]

    if (value) {
        value.score = value.score * 100;
    } else {
        throw new Error('failed to multiply synergy percent at index ' + index);
    }
}

function synergySetAllowMinMax(effect: LegendaryEffect, index: number, allowMinMaw: boolean) {
    const value = effect.effects[index]

    if (value && isEffectValueSynergy(value.effect)) {
        value.effect.allowMinMax = allowMinMaw;
    } else {
        throw new Error('failed to update allow min max at index ' + index);
    }
}

function addConstant(effect: LegendaryEffect, value: number, stat: string, valueType: EffectValueValueType) {

    effect.effects.push({
        score: value,
        craftedValue: 0,
        possibleCraftedValues: [],
        maxPossibleCraftedValue: 0,
        minPossibleCraftedValue: 0,
        effect: effectValueConstant(value, false, stat, valueType)
    });
}*/

export const DATA_RUNE: { [key: number]: DataRune } = {
    4: {
        override: rune => {
            setStat(rune, 0, 'trigger_effect_rune_cooldown_reduction');
        }
    }
}