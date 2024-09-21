import { Injectable } from '@angular/core';

import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { bankerRound, round } from '../../util/math.util';
import { isEffectValueSynergy, isEffectValueVariable } from '../../util/utils';

@Injectable()
export class SlormancerEffectValueService {

    constructor() { }

    public getEffectValueClone<T extends AbstractEffectValue>(effectValue: T): T {
        return { ...effectValue };
    }

    // TODO update effect value model / view
    public updateEffectValue(effectValue: AbstractEffectValue, upgradeMultiplier: number, globalMultiplier: number | null = null, globalMultiplierPrecision: number | null = null): AbstractEffectValue {
        if (isEffectValueSynergy(effectValue) || isEffectValueVariable(effectValue)) {
            let value = effectValue.baseValue;
            if (globalMultiplier !== null && globalMultiplierPrecision !== null) {
                // TODO bankerRound à remplacer par round ?
                value = bankerRound(value * globalMultiplier, globalMultiplierPrecision);
                effectValue.upgrade = bankerRound(effectValue.baseUpgrade * globalMultiplier, globalMultiplierPrecision);
            }
            if (effectValue.upgradeType === EffectValueUpgradeType.Every3) {
                value += effectValue.upgrade * Math.floor(upgradeMultiplier / 3);
            } else if (effectValue.upgradeType === EffectValueUpgradeType.Every3RuneLevel) {
                // activation rune every 3 bug
                if (globalMultiplier !== null && globalMultiplier !== 1) {
                    value += Math.ceil(effectValue.upgrade * upgradeMultiplier / 3);
                } else {
                    value += effectValue.upgrade * Math.floor(upgradeMultiplier / 3);
                }
            } else if (effectValue.upgradeType === EffectValueUpgradeType.Every5RuneLevel ) {
                value += effectValue.upgrade * Math.floor(upgradeMultiplier / 5);
            } else {
                value += effectValue.upgrade * upgradeMultiplier;
            }

            effectValue.value = round(value, 5);
            effectValue.displayValue = round(effectValue.value, 3);
            if (isEffectValueVariable(effectValue)) {
                effectValue.upgradedValue = effectValue.value;
            }
        }

        return effectValue;
    }
}