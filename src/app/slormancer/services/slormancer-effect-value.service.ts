import { Injectable } from '@angular/core';

import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { strictParseFloat } from '../util/parse.util';
import { isEffectValueSynergy, isEffectValueVariable, splitData, valueOrNull } from '../util/utils';

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
                baseValue: 0,
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
                baseValue: 0,
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