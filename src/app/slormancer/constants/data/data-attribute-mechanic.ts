import { MechanicType } from '../../model/enum/mechanic-type';

export const DATA_ATTRIBUTE_MECHANIC: { [key: string]: MechanicType } = {
    inner_fire_max_number_add: MechanicType.InnerFire,
    inner_fire_damage_percent: MechanicType.InnerFire,
    inner_fire_lucky: MechanicType.InnerFire,
    overdrive_lucky: MechanicType.Overdrive,
};