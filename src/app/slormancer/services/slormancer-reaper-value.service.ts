import { Injectable } from '@angular/core';

import { EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { MinMax } from '../model/minmax';

@Injectable()
export class SlormancerReaperValueService {

    public computeEffectVariableValue(effectValue: EffectValueVariable, level: number, nonPrimordialLevel: number): number {
        return effectValue.value + effectValue.upgrade * level;
    }
    public computeEffectSynergyValue(effectValue: EffectValueSynergy): number | MinMax {
        return effectValue.source === 'elemental_damage' || effectValue.source === 'physical_damage' || effectValue.source === 'weapon_damage' ? {min: 0, max: 0} : 0;
    }
}