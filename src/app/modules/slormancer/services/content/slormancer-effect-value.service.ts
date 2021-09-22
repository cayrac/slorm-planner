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
                value += 1000 * effectValue.upgrade * Math.ceil(upgradeMultiplier / 3);
                displayValue += 1000 * effectValue.upgrade * Math.ceil(displayUpgradeMultiplier / 3);
            } else {
                value += 1000 * effectValue.upgrade * upgradeMultiplier;
                displayValue += 1000 * effectValue.upgrade * displayUpgradeMultiplier;
            }
            effectValue.value = value / 1000;
            // TODO the round here is necessary on the displayValue to keep the real hidden value
            effectValue.displayValue = round(displayValue / 1000, 3);
        }

        return effectValue;
    }
}