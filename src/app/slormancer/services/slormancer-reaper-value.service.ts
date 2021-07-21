import { Injectable } from '@angular/core';

import { EffectValueSynergy, EffectValueVariable } from '../model/effect-value';

@Injectable()
export class SlormancerReaperValueService {

    public computeEffectVariableValue(effectValue: EffectValueVariable, level: number, nonPrimordialLevel: number): number {
        return effectValue.value + effectValue.upgrade * level;
    }
    public computeEffectSynergyValue(effectValue: EffectValueSynergy): number {
        return 0;
    }
}