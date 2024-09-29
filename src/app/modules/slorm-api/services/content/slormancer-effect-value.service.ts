import { Injectable } from '@angular/core';

import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { bankerRound, round } from '../../util/math.util';
import { isEffectValueSynergy, isEffectValueVariable } from '../../util/utils';

export interface UpdateEffectValueContext {
    globalMultiplier?: number;
    globalMultiplierPrecision?: number;
    affinityMultiplier?: number;
}

@Injectable()
export class SlormancerEffectValueService {

    public getEffectValueClone<T extends AbstractEffectValue>(effectValue: T): T {
        return { ...effectValue };
    }

    // TODO update effect value model / view
    public updateEffectValue(effectValue: AbstractEffectValue, upgradeMultiplier: number, context: UpdateEffectValueContext = {}): AbstractEffectValue {
        if (isEffectValueSynergy(effectValue) || isEffectValueVariable(effectValue)) {
            let value = effectValue.baseValue;
            let displayValue = effectValue.baseValue;

            if (context.globalMultiplier !== undefined && context.globalMultiplierPrecision !== undefined) {
                // TODO bankerRound à remplacer par round ?
                value = bankerRound(value * context.globalMultiplier, context.globalMultiplierPrecision);
                displayValue = value;
                effectValue.upgrade = bankerRound(effectValue.baseUpgrade * context.globalMultiplier, context.globalMultiplierPrecision);
            }
            
            if (effectValue.upgradeType === EffectValueUpgradeType.Every3) {
                value += effectValue.upgrade * Math.floor(upgradeMultiplier / 3);
                displayValue = value;
            } else if (effectValue.upgradeType === EffectValueUpgradeType.Every3RuneLevel) {
                // activation rune every 3 bug
                if (context.globalMultiplier !== undefined && context.globalMultiplier !== 1) {
                    value += Math.ceil(effectValue.upgrade * upgradeMultiplier / 3);
                } else {
                    value += effectValue.upgrade * Math.floor(upgradeMultiplier / 3);
                }
                displayValue = value;
            } else if (effectValue.upgradeType === EffectValueUpgradeType.Every5RuneLevel ) {
                value += effectValue.upgrade * Math.floor(upgradeMultiplier / 5);
                displayValue = value;
            } else {
                if (context.affinityMultiplier !== undefined) {
                    effectValue.upgrade = effectValue.baseUpgrade;
                    displayValue += effectValue.upgrade * context.affinityMultiplier * upgradeMultiplier;
                    effectValue.upgrade = bankerRound(effectValue.baseUpgrade * context.affinityMultiplier, 2);
                    value += effectValue.upgrade * upgradeMultiplier;
                    console.log('reaper affinity value : ', value, displayValue, effectValue.upgrade)
                } else {
                    value += effectValue.upgrade * upgradeMultiplier;
                    displayValue = value;
                }
            }

            effectValue.value = round(value, 5);
            effectValue.displayValue = round(displayValue, 3);
            if (isEffectValueVariable(effectValue)) {
                effectValue.upgradedValue = effectValue.value;
            }
        }

        return effectValue;
    }
}