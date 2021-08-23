import { AbstractEffectValue } from '../effect-value';
import { MechanicType } from '../enum/mechanic-type';
import { SkillCostType } from '../enum/skill-cost-type';

export interface DataSkill {
    masteryRequired: number | null;
    override: (values: Array<AbstractEffectValue>) => void;
    additionalClassMechanics: Array<number>;
    additionalMechanics?: Array<MechanicType>;
    costTypeOverride?: SkillCostType;
};

