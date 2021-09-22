import { DataAttribute } from '../../../model/content/data/data-attribute';
import { Trait } from '../../../model/content/trait';


function setStat(trait: Trait, index: number, stat: string) {
    const value = trait.values[index]

    if (value) {
        value.stat = stat;
    }
}

export const DATA_ATTRIBUTE: { [key: number]: DataAttribute } = {
    12: {
        override: trait => {
            setStat(trait, 0, 'res_phy_global_mult_on_low_life');
            setStat(trait, 1, 'garbage_stat');
        }
    },
    19: {
        override: trait => {
            setStat(trait, 0, 'primary_chance_ignore_def_phy');
        }
    }
}