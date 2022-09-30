import { Injectable } from '@angular/core';

import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { bankerRound } from '../../util/math.util';
import { isEffectValueSynergy, isEffectValueVariable } from '../../util/utils';

@Injectable()
export class SlormancerEffectValueService {

    constructor() { }

    public getEffectValueClone<T extends AbstractEffectValue>(effectValue: T): T {
        return { ...effectValue };
    }

    // TODO update effect value model / view
    public updateEffectValue(effectValue: AbstractEffectValue, upgradeMultiplier: number): AbstractEffectValue {
        if (isEffectValueSynergy(effectValue) || isEffectValueVariable(effectValue)) {
            let value = effectValue.baseValue;
            if (effectValue.upgradeType === EffectValueUpgradeType.Every3 || effectValue.upgradeType === EffectValueUpgradeType.Every3RuneLevel) {
                value += effectValue.upgrade * Math.floor((upgradeMultiplier) / 3);
            } else {
                value += effectValue.upgrade * upgradeMultiplier;
            }

            if (effectValue.upgradeType === EffectValueUpgradeType.Every3RuneLevel && effectValue.baseValue === 7) {
                console.log('updateEffectValue every 3', effectValue, ' - ', effectValue.baseValue, effectValue.upgrade, upgradeMultiplier, value);
            }

            effectValue.value = value
            effectValue.displayValue = bankerRound(value, 3);
            if (isEffectValueVariable(effectValue)) {
                effectValue.upgradedValue = value;
            }
        }

        return effectValue;
    }
}