export interface AffixText {
    name: string;
    prefix: string;
    suffix: string;
}

export const AFFIX_TEXT: { [key: string]: AffixText} = {
    retaliate_percent: {
        name: 'Retaliation',
        prefix: '%%',
        suffix: 'of havoc'
    },
    thorns_percent: {
        name: 'Thorns Damage',
        prefix: '%%',
        suffix: 'of stinging'
    },
    the_max_mana_add: {
        name: 'Max Mana',
        prefix: '%%',
        suffix: 'of mana'
    },
    mana_leech_percent: {
        name: 'Mana Leech',
        prefix: '%%',
        suffix: 'of extraction'
    },
    shadow_resistance_percent: {
        name: 'Shadow Resistance',
        prefix: '%%',
        suffix: '%%'
    },
    brut_chance_percent: {
        name: 'Ancestral Strike Chance',
        prefix: '%%',
        suffix: 'of the tyrant'
    },
    min_elemental_damage_add: {
        name: 'Elemental Damage',
        prefix: '%%',
        suffix: 'of enchantment'
    },
    the_speed_percent: {
        name: 'Movement Speed',
        prefix: '%%',
        suffix: 'of swiftness'
    },
    rebound_chance_percent: {
        name: 'Rebound Chance',
        prefix: '%%',
        suffix: 'of adaptation'
    },
    min_basic_damage_add: {
        name: 'Raw Damage',
        prefix: '%%',
        suffix: 'of anger'
    },
    dodge_percent: {
        name: 'Evasion',
        prefix: '%%',
        suffix: 'of agility'
    },
    inner_fire_duration_percent: {
        name: 'Inner Fire Duration',
        prefix: '%%',
        suffix: 'of intensity'
    },
    reduced_damage_from_melee_percent: {
        name: 'Melee Damage Reduction',
        prefix: '%%',
        suffix: 'of wrestler'
    },
    res_mag_add: {
        name: 'Elemental Resistance',
        prefix: '%%',
        suffix: 'of mind'
    },
    crit_chance_percent: {
        name: 'Critical Strike Chance',
        prefix: '%%',
        suffix: 'of viciousness'
    },
    gold_find_percent: {
        name: 'Goldus Find',
        prefix: '%%',
        suffix: 'of radiance'
    },
    dodge_add: {
        name: 'Evasion',
        prefix: '%%',
        suffix: 'of agility'
    },
    mana_regen_add: {
        name: 'Mana Regeneration',
        prefix: '%%',
        suffix: 'of restoration'
    },
    mana_on_hit_add: {
        name: 'Mana on Hit',
        prefix: '%%',
        suffix: 'of sustain'
    },
    tenacity_percent: {
        name: 'Tenacity',
        prefix: '%%',
        suffix: 'of determination'
    },
    res_phy_add: {
        name: 'Armor',
        prefix: '%%',
        suffix: 'of will'
    },
    health_leech_percent: {
        name: 'Life Leech',
        prefix: '%%',
        suffix: 'of blood'
    },
    res_mag_percent: {
        name: 'Elemental Resistance',
        prefix: '%%',
        suffix: 'of mind'
    },
    brut_damage_percent: {
        name: 'Ancestral Strike Damage',
        prefix: '%%',
        suffix: 'of ferocity'
    },
    xp_find_percent: {
        name: 'Experience Gain',
        prefix: '%%',
        suffix: 'of experience'
    },
    elemental_damage_percent: {
        name: 'Elemental Damage',
        prefix: '%%',
        suffix: 'of enchantment'
    },
    basic_damage_percent: {
        name: 'Raw Damage',
        prefix: '%%',
        suffix: 'of anger'
    },
    fork_chance_percent: {
        name: 'Fork Chance',
        prefix: '%%',
        suffix: 'of split'
    },
    reduced_damage_from_area_percent: {
        name: 'Area Damage Reduction',
        prefix: '%%',
        suffix: 'of absorption'
    },
    res_phy_percent: {
        name: 'Armor',
        prefix: '%%',
        suffix: 'of will'
    },
    cooldown_reduction_global_mult: {
        name: 'Attack Speed',
        prefix: '%%',
        suffix: 'of alacrity'
    },
    thorns_add: {
        name: 'Thorns Damage',
        prefix: '%%',
        suffix: 'of stinging'
    },
    the_max_health_add: {
        name: 'Max Life',
        prefix: '%%',
        suffix: 'of life'
    },
    health_on_hit_add: {
        name: 'Life on Hit',
        prefix: '%%',
        suffix: 'of drain'
    },
    health_regen_add: {
        name: 'Life Regeneration',
        prefix: '%%',
        suffix: 'of regeneration'
    },
    elemental_penetration_percent: {
        name: 'Elemental Penetration',
        prefix: '%%',
        suffix: 'of banishment'
    },
    armor_penetration_percent: {
        name: 'Armor Penetration',
        prefix: '%%',
        suffix: 'of perforation'
    },
    the_max_mana_percent: {
        name: 'Max Mana',
        prefix: '%%',
        suffix: 'of mana'
    },
    dot_increased_damage_percent: {
        name: 'Damage over Time',
        prefix: '%%',
        suffix: 'of oppression'
    },
    lightning_resistance_percent: {
        name: 'Lightning Resistance',
        prefix: '%%',
        suffix: '%%'
    },
    inner_fire_chance_percent: {
        name: 'Inner Fire Chance',
        prefix: '%%',
        suffix: 'of blaze'
    },
    overdrive_chance_percent: {
        name: 'Overdrive Chance',
        prefix: '%%',
        suffix: 'of stomp'
    },
    increased_proj_speed_percent: {
        name: 'Projectile Speed',
        prefix: '%%',
        suffix: 'of swiftness'
    },
    mf_find_percent: {
        name: 'Magic Items Quantity',
        prefix: '%%',
        suffix: 'of wealth'
    },
    reduced_damage_from_projectile_percent: {
        name: 'Projectile Damage Reduction',
        prefix: '%%',
        suffix: 'of deflection'
    },
    reduced_damage_on_elite_percent: {
        name: 'Elite Damage Reduction',
        prefix: '%%',
        suffix: 'of menace'
    },
    aura_increased_effect_percent: {
        name: 'Aura increased Effect',
        prefix: '%%',
        suffix: 'of command'
    },
    ice_resistance_percent: {
        name: 'Ice Resistance',
        prefix: '%%',
        suffix: '%%'
    },
    light_resistance_percent: {
        name: 'Light Resistance',
        prefix: '%%',
        suffix: '%%'
    },
    aoe_increased_effect_percent: {
        name: 'Area Increased Effect',
        prefix: '%%',
        suffix: 'of conjuration'
    },
    fire_resistance_percent: {
        name: 'Fire Resistance',
        prefix: '%%',
        suffix: '%%'
    },
    crit_damage_percent: {
        name: 'Critical Strike Damage',
        prefix: '%%',
        suffix: 'of cruelty'
    },
    health_on_kill_add: {
        name: 'Life on Kill',
        prefix: '%%',
        suffix: 'of assimilation'
    },
    inner_fire_damage_percent: {
        name: 'Inner Fire Damage',
        prefix: '%%',
        suffix: 'of heat'
    },
    chance_to_pierce_percent: {
        name: 'Pierce Chance',
        prefix: '%%',
        suffix: 'of accuracy'
    },
    health_on_kill_percent: {
        name: 'Health on Kill',
        prefix: '%%',
        suffix: 'of assimilation'
    },
    increased_damage_on_elite_percent: {
        name: 'Damages to Elite',
        prefix: '%%',
        suffix: 'of the broken'
    },
    health_regen_percent: {
        name: 'Life Regeneration',
        prefix: '%%',
        suffix: 'of regeneration'
    },
    the_max_health_percent: {
        name: 'Max Life',
        prefix: '%%',
        suffix: 'of life'
    },
    reduced_damage_from_all_percent: {
        name: 'All Damage Reduction',
        prefix: '%%',
        suffix: 'of resolution'
    },
    mf_qual_percent: {
        name: 'Magic Items Quality',
        prefix: '%%',
        suffix: 'of wealth'
    },
    totem_increased_effect_percent: {
        name: 'Totem Increased Effect',
        prefix: '%%',
        suffix: 'of symbol'
    },
    mana_on_hit_percent: {
        name: 'Mana on Hit',
        prefix: '%%',
        suffix: 'of sustain'
    },
    overdrive_damage_percent: {
        name: 'Overdrive Damage',
        prefix: '%%',
        suffix: 'of wreak'
    },
    health_on_hit_percent: {
        name: 'Life on Hit',
        prefix: '%%',
        suffix: 'of drain'
    },
    mana_on_kill_percent: {
        name: 'Mana ok Kill',
        prefix: '%%',
        suffix: '%%'
    },
    knockback_melee_percent: {
        name: 'Knockback on Melee',
        prefix: '%%',
        suffix: '%%'
    },
    aoe_increased_size_percent: {
        name: 'Area Increased Size',
        prefix: '%%',
        suffix: 'of augmentation'
    },
    overdrive_bounce_number_percent: {
        name: 'Overdrive Bounce Number',
        prefix: '%%',
        suffix: 'of augmentation'
    },
    minion_increased_damage_percent: {
        name: 'Minion Increased Damage',
        prefix: '%%',
        suffix: 'of domination'
    },
    knockback_projectile_percent: {
        name: 'Knockback on Projectile',
        prefix: '%%',
        suffix: '%%'
    },
    mana_regen_percent: {
        name: 'Mana Regeneration',
        prefix: '%%',
        suffix: 'of extraction'
    },
    mana_on_kill_add: {
        name: 'Mana on Kill',
        prefix: '%%',
        suffix: 'of punction'
    },
    additional_projectile_percent: {
        name: 'Additional Projectile',
        prefix: '%%',
        suffix: '%%'
    },
    essence_find_percent: {
        name: 'Slorm Find',
        prefix: '%%',
        suffix: 'of attraction'
    },
    scrap_find_percent: {
        name: 'Fragments Find',
        prefix: '%%',
        suffix: 'of ruin'
    },
    recast_chance_percent: {
        name: 'Melee Recast Chance',
        prefix: '%%',
        suffix: 'of echo'
    },
    inner_fire_max_number_percent: {
        name: 'Inner Fire Max. Charges',
        prefix: '%%',
        suffix: '%%'
    }
};