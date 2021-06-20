import { LegendaryEffectValue } from './legendary-effect-value';
import { Skill } from './skill';

export interface LegendaryEffect {
    description: string;
    activable: Skill | null;
    icon: string | null;
    value: number;
    onlyStat: boolean;
    values: Array<LegendaryEffectValue>;
    constants: Array<number>;
}