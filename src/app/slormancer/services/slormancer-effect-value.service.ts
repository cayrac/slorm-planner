import { Injectable } from '@angular/core';

import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
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

    public parseReaperEffectValue(base: number | null, level: string, real: string, type: string): AbstractEffectValue {
        let result: AbstractEffectValue;

        console.log('parseReaperEffectValue : ', base, level, real, type);

        
        result = {
            type: EffectValueType.Constant,
            value: 0,
        } as EffectValueConstant;

        return result;        
    }
}