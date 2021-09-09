import { Injectable } from '@angular/core';

import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { isEffectValueSynergy, isEffectValueVariable } from '../../util/utils';

@Injectable()
export class SlormancerEffectValueService {

    constructor() { }

    public getEffectValueClone<T extends AbstractEffectValue>(effectValue: T): T {
        return { ...effectValue };
    }

    public updateEffectValue(effectValue: AbstractEffectValue, upgradeMultiplier: number): AbstractEffectValue {
        const displayUpgradeMultiplier = Math.max(upgradeMultiplier, 1);
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
            effectValue.displayValue = displayValue / 1000;
        }

        if (isEffectValueSynergy(effectValue)) {            
            const sourceIsDamages = effectValue.source === 'elemental_damage' || effectValue.source === 'physical_damage' || effectValue.source === 'weapon_damage';
            effectValue.synergy = sourceIsDamages && effectValue.valueType === EffectValueValueType.Damage ? {min: 0, max: 0} : 0;
        }

        return effectValue;
    }
}