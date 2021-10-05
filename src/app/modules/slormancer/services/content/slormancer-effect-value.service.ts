import { Injectable } from '@angular/core';

import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { isEffectValueSynergy, isEffectValueVariable } from '../../util/utils';

@Injectable()
export class SlormancerEffectValueService {

    constructor() { }

    public getEffectValueClone<T extends AbstractEffectValue>(effectValue: T): T {
        return { ...effectValue };
    }

    public updateEffectValue(effectValue: AbstractEffectValue, upgradeMultiplier: number): AbstractEffectValue {
        if (isEffectValueSynergy(effectValue) || isEffectValueVariable(effectValue)) {
            let value = effectValue.baseValue;
            if (effectValue.upgradeType === EffectValueUpgradeType.Every3) {
                value = Math.max(value, effectValue.upgrade * Math.ceil((upgradeMultiplier + 1) / 3));
            } else {
                value += effectValue.upgrade * upgradeMultiplier;
            }

            if (isEffectValueVariable(effectValue)) {
                effectValue.upgradedValue = value;
            } else {
                effectValue.value = value;
            }
        }

        return effectValue;
    }
}