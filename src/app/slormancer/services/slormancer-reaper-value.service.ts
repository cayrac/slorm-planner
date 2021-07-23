import { Injectable } from '@angular/core';

import { EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { MinMax } from '../model/minmax';

@Injectable()
export class SlormancerReaperValueService {

    public computeEffectVariableValue(effectValue: EffectValueVariable, level: number, nonPrimordialLevel: number): number {
        return Math.round((effectValue.value + effectValue.upgrade * level) * 1000) / 1000;
    }
    public computeEffectSynergyValue(effectValue: EffectValueSynergy): number | MinMax {
        const sourceIsDamages = effectValue.source === 'elemental_damage' || effectValue.source === 'physical_damage' || effectValue.source === 'weapon_damage';
        return sourceIsDamages && effectValue.valueType === EffectValueValueType.Damage ? {min: 0, max: 0} : 0;
    }
}