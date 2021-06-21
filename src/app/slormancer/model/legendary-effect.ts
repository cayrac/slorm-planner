import { AbstractEffectValue } from './effect-value';
import { Skill } from './skill';

export interface LegendaryEffect {
    description: string;
    activable: Skill | null;
    icon: string | null;
    value: number;
    onlyStat: boolean;
    values: Array<AbstractEffectValue>;
}