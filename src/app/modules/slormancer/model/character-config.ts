export interface CharacterConfig {
    percent_missing_mana: number;
    percent_lock_mana: number;
    percent_missing_health: number;
    overall_reputation: number;
    hits_taken_recently: number;
    skill_cast_recently: number;
    ennemies_in_radius: { [key: number]: number};
    elites_in_radius: { [key: number]: number};
    took_elemental_damage_recently: boolean;
    took_damage_before_next_cast: boolean;
    cast_support_before_next_cast: boolean;
    seconds_since_last_crit: number;
    seconds_since_last_dodge: number;
    controlled_minions: number;
    elemental_prowess_stacks: number;
    greed_stacks: number;
    strider_stacks: number;
    merchant_stacks: number;
    totem_dexterity_stacks: number;
    distance_with_target: number;
}