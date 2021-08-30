import { Injectable } from '@angular/core';

import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { strictParseFloat } from '../util/parse.util';
import { splitData, valueOrNull } from '../util/utils';

@Injectable()
export class SlormancerEffectValueService {

    constructor() { }

    private parseUpgradeType(upgradeType: string | null): EffectValueUpgradeType {
        let result: EffectValueUpgradeType = EffectValueUpgradeType.Reinforcment;

        if (upgradeType === 'rl') {
            result = EffectValueUpgradeType.ReaperLevel;
        } else if (upgradeType === 'rln') {
            result = EffectValueUpgradeType.NonPrimordialReaperLevel;
        }

        return result;
    }

    public parseReaperEffectVariableValue(base: number, level: string | null, type: string | null): AbstractEffectValue {
        let result: AbstractEffectValue;

        if (level === null) {
            result = {
                type: EffectValueType.Variable,
                value: base,
                upgrade: 0,
                upgradeType: EffectValueUpgradeType.Reinforcment,
                range: false,
                percent: type === '%',
                valueType: EffectValueValueType.Unknown,
                stat: null
            } as EffectValueVariable;
        } else {
            result = {
                type: EffectValueType.Variable,
                value: 0,
                upgrade: base,
                upgradeType: this.parseUpgradeType(level),
                range: false,
                percent: type === '%',
                valueType: EffectValueValueType.Unknown,
                stat: null
            } as EffectValueVariable;
        }

        return result;        
    }

    public parseReaperEffectSynergyValue(real: string | null): AbstractEffectValue {
        let result: AbstractEffectValue;

        const typeValues = splitData(real, ':');
        const source = <string>typeValues[1];
        const brutValue = <string>typeValues[2];
        const isVariable = brutValue.indexOf('*') !== -1;
        const [upgrade, upgradeType] = splitData(brutValue, '*');

        result = {
            type: EffectValueType.Synergy,
            value: isVariable ? 0 : strictParseFloat(brutValue),
            upgrade: isVariable ? strictParseFloat(<string>upgrade) : 0,
            upgradeType: this.parseUpgradeType(valueOrNull(upgradeType)),
            percent: false,
            source,
            valueType: EffectValueValueType.Unknown,
            stat: null
        } as EffectValueSynergy;
        
        return result;   
    }

    public parseReaperEffectConstantValue(constant: number): AbstractEffectValue {
        return {
            type: EffectValueType.Constant,
            value: constant,
            percent: false,
            valueType: EffectValueValueType.Unknown,
            stat: null
        } as EffectValueConstant;
    }
}