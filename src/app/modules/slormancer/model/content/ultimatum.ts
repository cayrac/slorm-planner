import { EffectValueVariable } from './effect-value';
import { UltimatumType } from './enum/ultimatum-type';

export interface Ultimatum {
    level: number;
    type: UltimatumType;
    icon: string;
    locked: boolean;

    value: EffectValueVariable;

    title: string;
    levelLabel: string;

    bonusTitle: string;
    bonusLabel: string;
    bonusLabelTemplate: string;

    malusTitle: string;
    malusLabel: string;

    levelIcon: string;
}