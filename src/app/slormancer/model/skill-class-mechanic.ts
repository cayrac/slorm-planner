import { AbstractEffectValue } from './effect-value';
import { SkillType } from './skill-type';

export interface SkillClassMechanic {
    id: number;
    type: SkillType.Mechanic | SkillType.Mechanics;
    name: string;
    icon: string;
    description: string;

    template: string;
    values: Array<AbstractEffectValue>;
}