import { DataActivable } from '../../model/data/data-activable';
import { AbstractEffectValue, EffectValueConstant } from '../../model/effect-value';
import { EffectValueType } from '../../model/enum/effect-value-type';
import { EffectValueValueType } from '../../model/enum/effect-value-value-type';


function addConstant(values: Array<AbstractEffectValue>, value: number, percent: boolean, valueType: EffectValueValueType, stat: string | null = null) {
    values.push({
        type: EffectValueType.Constant,
        value,
        percent,
        valueType,
        stat
    } as EffectValueConstant)
}

export const DATA_ACTIVABLE: { [key: string]: DataActivable } = {
    10: {
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Stat, '');
        }
    }
}