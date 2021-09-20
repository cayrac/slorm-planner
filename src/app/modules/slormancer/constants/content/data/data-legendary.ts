import { DataLegendary } from '../../../model/content/data/data-legendary';
import { LegendaryEffect } from '../../../model/content/legendary-effect';
import { effectValueConstant } from '../../../util/effect-value.util';


function setStat(effect: LegendaryEffect, index: number, stat: string) {
    const value = effect.effects[index]

    if (value) {
        value.effect.stat = stat;
    }
}

function addConstant(effect: LegendaryEffect, value: number) {

    effect.effects.push({
        score: value,
        craftedValue: 0,
        possibleCraftedValues: [],
        maxPossibleCraftedValue: 0,
        minPossibleCraftedValue: 0,
        effect: effectValueConstant(value, false, null)
    });
}

export const DATA_LEGENDARY: { [key: number]: DataLegendary } = {
    28: {
        override: (effect) => {
            addConstant(effect, 10);
        }
    },
    29: {
        override: (effect) => {
            setStat(effect, 1, 'buff_ancestral_fervor_crit_chance_percent');
        }
    },
    33: {
        override: (effect) => {
            addConstant(effect, 100);
        }
    },
    57: {
        override: (effect) => {
            addConstant(effect, 4);
        }
    },
    62: {
        override: (effect) => {
            addConstant(effect, 5);
        }
    },
    69: {
        override: (effect) => {
            addConstant(effect, 2.6);
        }
    },
    78: {
        override: (effect) => {
            setStat(effect, 0, 'ancestral_rank_add');
        }
    }
}