import { MechanicType } from '../../model/enum/mechanic-type';

export const DATA_TEMPLATE_MECHANIC: { [key: string]: MechanicType } = {
    '<lucky>': MechanicType.Lucky,
    '<shield globe>': MechanicType.ShieldGlove,
    '<shield globes>': MechanicType.ShieldGlove,
};