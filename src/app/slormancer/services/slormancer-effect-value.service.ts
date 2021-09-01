import { Injectable } from '@angular/core';

import { AbstractEffectValue, EffectValueConstant } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { isEffectValueSynergy, isEffectValueVariable } from '../util/utils';

@Injectable()
export class SlormancerEffectValueService {

    constructor() { }

    public parseReaperEffectConstantValue(constant: number): AbstractEffectValue {
        return {
            type: EffectValueType.Constant,
            value: constant,
            percent: false,
            valueType: EffectValueValueType.Unknown,
            stat: null
        } as EffectValueConstant;
    }

    public updateEffectValue(effectValue: AbstractEffectValue, upgradeMultiplier: number): AbstractEffectValue {
        if (isEffectValueSynergy(effectValue) || isEffectValueVariable(effectValue)) {
            let value = effectValue.baseValue * 1000;
            if (effectValue.upgradeType === EffectValueUpgradeType.Every3) {
                value += 1000 * effectValue.upgrade * Math.ceil(upgradeMultiplier / 3);
            } else {
                value += 1000 * effectValue.upgrade * upgradeMultiplier;
            }
            effectValue.value = value / 1000;
        }

        if (isEffectValueSynergy(effectValue)) {            
            const sourceIsDamages = effectValue.source === 'elemental_damage' || effectValue.source === 'physical_damage' || effectValue.source === 'weapon_damage';
            effectValue.synergy = sourceIsDamages && effectValue.valueType === EffectValueValueType.Damage ? {min: 0, max: 0} : 0;
        }

        return effectValue;
    }
}