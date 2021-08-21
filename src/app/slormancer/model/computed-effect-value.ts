import { EffectValueUpgradeType } from './enum/effect-value-upgrade-type';
import { MinMax } from './minmax';

export interface ComputedEffectValue {
    value: number;
    baseValue: number,
    range: { [ key: number]: number } | null;
    baseRange: { [ key: number]: number } | null;
    upgrade: number;
    baseFormulaUpgrade: number;
    upgradeType: EffectValueUpgradeType;
    percent: boolean;
    synergy: number | MinMax | null; 
}