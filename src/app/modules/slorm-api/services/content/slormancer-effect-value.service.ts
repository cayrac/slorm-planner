import { Injectable } from '@angular/core';

import { EffectValueValueType } from '../../model';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { bankerRound, round } from '../../util/math.util';
import { isEffectValueSynergy, isEffectValueVariable } from '../../util/utils';

export interface UpdateEffectValueContext {
    globalMultiplier?: number;
    globalMultiplierPrecision?: number;
    affinityMultiplier?: number;
    useOldAffinityFormula?: boolean;
}

@Injectable()
export class SlormancerEffectValueService {

    public getEffectValueClone<T extends AbstractEffectValue>(effectValue: T): T {
        return { ...effectValue };
    }
    // TODO update effect value model / view
    public updateRuneEffectValue(effectValue: AbstractEffectValue, upgradeMultiplier: number, effectMultiplier: number): AbstractEffectValue {
        if (isEffectValueSynergy(effectValue) || isEffectValueVariable(effectValue)) {
            let value = effectValue.baseValue;
            let displayValue = effectValue.baseValue;
            let precision = 3;

            value = bankerRound(value * effectMultiplier, precision);
            displayValue = value;
            const realUpgrade = effectValue.baseUpgrade * effectMultiplier
            effectValue.upgrade = bankerRound(effectValue.baseUpgrade * effectMultiplier, precision);
            
            if (effectValue.upgradeType === EffectValueUpgradeType.Every3RuneLevel) {
                value += realUpgrade * Math.floor(upgradeMultiplier / 3);
                displayValue = value;
            } else if (effectValue.upgradeType === EffectValueUpgradeType.Every5RuneLevel ) {
                value += realUpgrade * Math.floor(upgradeMultiplier / 5);
                displayValue = value;
            } else {
                value += realUpgrade * upgradeMultiplier;
                displayValue = value;
            }

            effectValue.value = round(value, 5);
            effectValue.displayValue = bankerRound(displayValue, 3);
            if (isEffectValueVariable(effectValue)) {
                effectValue.upgradedValue = effectValue.value;
            }
        }

        return effectValue;
    }

    // TODO update effect value model / view
    public updateEffectValue(effectValue: AbstractEffectValue, upgradeMultiplier: number, context: UpdateEffectValueContext = {}): AbstractEffectValue {
        if (isEffectValueSynergy(effectValue) || isEffectValueVariable(effectValue)) {
            let value = effectValue.baseValue;
            let displayValue = effectValue.baseValue;

            if (context.globalMultiplier !== undefined && context.globalMultiplierPrecision !== undefined) {
                // TODO bankerRound à remplacer par round ?
                value = bankerRound(value * context.globalMultiplier, context.globalMultiplierPrecision);
                displayValue = value;
                effectValue.upgrade = round(effectValue.baseUpgrade * context.globalMultiplier, context.globalMultiplierPrecision);
            }
            
            if (effectValue.upgradeType === EffectValueUpgradeType.Every3) {
                value += effectValue.upgrade * Math.floor(upgradeMultiplier / 3);
                displayValue = value;
            } else if (effectValue.upgradeType === EffectValueUpgradeType.Every3RuneLevel) {
                // activation rune every 3 bug
                if (context.globalMultiplier !== undefined && context.globalMultiplier !== 1) {
                    value += Math.ceil(effectValue.upgrade * upgradeMultiplier / 3);
                } else {
                    value += effectValue.upgrade * Math.floor(upgradeMultiplier / 3);
                }
                displayValue = value;
            } else if (effectValue.upgradeType === EffectValueUpgradeType.Every5RuneLevel ) {
                value += effectValue.upgrade * Math.floor(upgradeMultiplier / 5);
                displayValue = value;
            } else {
                if (context.affinityMultiplier !== undefined) {
                    const affinityMultiplier = effectValue.valueType === EffectValueValueType.Static ? 1 : context.affinityMultiplier;
                    if (context.useOldAffinityFormula === true) {
                        effectValue.upgrade = effectValue.baseUpgrade;
                        displayValue += effectValue.upgrade * affinityMultiplier * upgradeMultiplier;
                        value += effectValue.upgrade * affinityMultiplier * upgradeMultiplier;
                        effectValue.upgrade = round(effectValue.baseUpgrade * affinityMultiplier, 2);
                    } else {
                        effectValue.upgrade = effectValue.baseUpgrade;
                        displayValue += effectValue.upgrade * affinityMultiplier * upgradeMultiplier;
                        effectValue.upgrade = round(effectValue.baseUpgrade * affinityMultiplier, 2);
                        value += effectValue.upgrade * upgradeMultiplier;
                    }
                } else {
                    value += effectValue.upgrade * upgradeMultiplier;
                    displayValue = value;
                }
            }

            effectValue.value = round(value, 5);
            effectValue.displayValue = bankerRound(displayValue, 3);
            if (isEffectValueVariable(effectValue)) {
                effectValue.upgradedValue = effectValue.value;
            }
        }

        return effectValue;
    }
}