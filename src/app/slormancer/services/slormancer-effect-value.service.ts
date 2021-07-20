import { Injectable } from '@angular/core';

import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { splitData, valueOrNull } from '../util/utils';

@Injectable()
export class SlormancerEffectValueService {

    public parseLegendaryEffectValue(type: string | null, value: number, upgrade: number, range: boolean): AbstractEffectValue {
        let result: AbstractEffectValue;
        
        if (type === null || type === '%') {
            result = {
                type: EffectValueType.Variable,
                value,
                upgrade: upgrade === null ? 0 : upgrade,
                upgradeType: EffectValueUpgradeType.Reinforcment,
                percent: type === '%',
                range
            } as EffectValueVariable;
        } else {
            const typeValues = splitData(type, ':');
            const source = valueOrNull(typeValues[1]);

            result = {
                type: EffectValueType.Synergy,
                ratio: value,
                upgrade,
                upgradeType: EffectValueUpgradeType.Reinforcment,
                source,
                range
            } as EffectValueSynergy;
        }

        return result;
    }

    public parseReaperEffectValue() {
        
    }
    // TODO reaper doit avoir info level et level primordial, il faut donc regrouper les 2
}