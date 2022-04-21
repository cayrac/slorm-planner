import { MechanicType } from '../../../model/content/enum/mechanic-type';

export const DATA_TEMPLATE_MECHANIC: { [key: string]: MechanicType } = {
    '<lucky>': MechanicType.Lucky,
    '<shield globe>': MechanicType.ShieldGlobe,
    '<shield globes>': MechanicType.ShieldGlobe,
    '<fireball>': MechanicType.Fireball,
    '<fireballs>': MechanicType.Fireball,
    '<walking bomb>': MechanicType.WalkingBomb,
    '<flashing dart>': MechanicType.Dart,
    '<flashing darts>': MechanicType.Dart,
    '<frostbolts>': MechanicType.Frostbolt,
    '<lightning rod>': MechanicType.LightningRod,
    '<soul bound>': MechanicType.SoulBound,
    '<burn>': MechanicType.Burn,
};