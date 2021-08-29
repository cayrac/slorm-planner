import { Activable } from './activable';
import { AbstractEffectValue } from './effect-value';
import { EquippableItemBase } from './enum/equippable-item-base';

export interface LegendaryEffect {
    id: number;
    name: string;
    itemBase: EquippableItemBase;
    itemIcon: string;
    description: string;
    activable: Activable | null;
    skillIcon: string | null;
    value: number;
    onlyStat: boolean;
    values: Array<AbstractEffectValue>;
}