import { Injectable } from '@angular/core';

import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { round } from '../../util/math.util';
import { isEffectValueSynergy, isEffectValueVariable } from '../../util/utils';

@Injectable()
export class SlormancerEffectValueService {

    constructor() { }

    public getEffectValueClone<T extends AbstractEffectValue>(effectValue: T): T {
        return { ...effectValue };
    }

    public updateEffectValue(effectValue: AbstractEffectValue, upgradeMultiplier: number): AbstractEffectValue {
        const displayUpgradeMultiplier = Math.max(upgradeMultiplier, 0);
        if (isEffectValueSynergy(effectValue) || isEffectValueVariable(effectValue)) {
            let value = effectValue.baseValue * 1000;
            let displayValue = effectValue.baseValue * 1000;
            if (effectValue.upgradeType === EffectValueUpgradeType.Every3) {
                value = Math.max(value, 1000 * effectValue.upgrade * Math.ceil((upgradeMultiplier + 1) / 3));
                // 1 => 2
                // 2 => 2
                // 3 => 2
                // 4 => 2
                // 5 => 2
                // 6 => 3
                // 7 => 3
                // 8 => 3
                // 9 => 4
                // 10 => 4
                // 11 => 4
                // 12 => 5
                // 13 => 5
                // 14 => 5
                // 15 => 6
                displayValue = value;
            } else {
                value += 1000 * effectValue.upgrade * upgradeMultiplier;
                displayValue += 1000 * effectValue.upgrade * displayUpgradeMultiplier;
            }
            effectValue.value = value / 1000;

            if (isEffectValueVariable(effectValue)) {
                effectValue.upgradedValue = effectValue.value;
            }

            // TODO the round here is necessary on the displayValue to keep the real hidden value
            effectValue.displayValue = round(displayValue / 1000, 3);
        }

        return effectValue;
    }
}