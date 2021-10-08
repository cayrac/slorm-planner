import { Injectable } from '@angular/core';

import { MAX_HERO_LEVEL } from '../constants/common';
import { Character } from '../model/character';
import { CharacterConfig } from '../model/character-config';
import { SkillCostType } from '../model/content/enum/skill-cost-type';

@Injectable()
export class SlormancerConfigurationService {

    private readonly DEFAULT_CONFIG: CharacterConfig = {
        mana_lost_last_second: 0,
        mana_gained_last_second: 0,
        knight_other_level: MAX_HERO_LEVEL,
        enemy_under_command: 0,
        elite_under_command: 0,
        totems_under_control: 0,
        traps_nearby: 0,
        serenity: 0,
        arcanic_emblems: 5,
        temporal_emblems: 5,
        obliteration_emblems: 5,
        last_cast_tormented: false,
        last_cast_delighted: false,
        next_cast_is_fortunate: false,
        next_cast_is_perfect: false,
        next_cast_is_new_emblem: true,
        enemy_percent_missing_health: 0,
        percent_missing_health: 0,
        percent_missing_mana: 50,
        percent_lock_health: 0,
        percent_lock_mana: 0,
        overall_reputation: 0,
        seconds_since_last_crit: 100, // Remplacer par crit recently
        seconds_since_last_dodge: 100, // Remplacer par dodge recently
        hits_taken_recently: 0,
        skill_cast_recently: 0,
        frostbold_shot_recently: 0,
        slormocide_60: 0,
        goldbane_5: 0,
        rebounds_before_hit: 0,
        pierces_before_hit: 0,
        enemies_in_aoe: 0,
        enemies_affected_by_latent_storm: 0,
        target_is_close: true,
        target_is_isolated: false,
        target_is_tracked: false,
        target_is_time_locked: false,
        enemy_is_poisoned: false,
        enemy_has_military_oppression: false,
        target_has_negative_effect: false,
        target_is_skewered: false,
        target_is_splintered: false,
        target_has_broken_armor: false,
        is_first_hit: false,
        is_hit_blocked: true,
        is_last_volley: false,
        is_channeling_whirlwind: false,
        is_remnant: false,
        void_arrow_fully_charged: false,
        elites_in_radius: {
            10: 0
        },
        ennemies_in_radius: {
            2: 0,
            3: 0
        },
        negative_effects_on_ennemies_in_radius: {
            2: 0,
        },
        poison_enemies: 0,
        trap_triggered_recently: false,
        took_elemental_damage_recently: false,
        took_damage_before_next_cast: false,
        cast_support_before_next_cast: false,
        victims_reaper_104: 0,
        banners_nearby: 0,
        controlled_minions: 0,
        elemental_prowess_stacks: 0,
        totem_dexterity_stacks: 0,
        greed_stacks: 0,
        strider_stacks: 0,
        merchant_stacks: 0,
        nimble_champion_stacks: 0,
        ancestral_legacy_stacks: 0,
        conquest_stacks: 0,
        stability_stacks: 0,
        enlightenment_stacks: 0,
        delightful_rain_stacks: 0,
        target_latent_storm_stacks: 0,
        exhilerating_senses_stacks: 0,
        impatient_arrow_stacks: 0,
        frenzy_stacks: 0,
        oak_bark_armor_stacks: 0,
        enemy_bleed_stacks: 0,
        block_stacks: 17,
        melee_defense_stacks: 0,
        projectile_defense_stacks: 0,
        aoe_defense_stacks: 0,
        vitality_stacks: 0,
        cosmic_stacks: 0,
        invigorate_stacks: 100,
        distance_with_target: 0,
        has_aura_air_conditionner: true,
        has_aura_neriya_shield: true,
        has_aura_elemental_swap: true,
        has_aura_risk_of_pain: true,
        has_aura_inextricable_torment: true,
        has_elemental_temper_buff: false,
        has_burning_shadow_buff: false,
        has_gold_armor_buff: false,
        has_soul_bound_buff: false,
        has_adam_blessing_buff: false,
        has_manabender_buff: false,
        has_nimble_buff: false,
        has_ancient_recognition_buff: false,
        has_elemental_fervor_buff: false,
        has_ancestral_fervor_buff: false,
        has_assassin_haste_buff: false,
        has_smoke_screen_buff: false,
        has_ancestral_stab_slash_buff: false,
        has_banner_regeneration_buff: true,
        has_banner_haste_buff: false,
        has_enduring_protector_buff: false,
        has_speed_gate_buff: false,
        all_characters_level: 120,
        idle: false,
        damage_stored: 0,
        overdrive_bounces_left: 0,
        time_spend_channeling: 10,
        overdrive_last_bounce: false,
        hero_close_to_turret_syndrome: false,
        turret_syndrome_on_cooldown: false,
        projectile_passed_through_wall_of_omen: true,
    }

    private readonly COMBAT_CONFIG: CharacterConfig = {
        mana_lost_last_second: 0,
        mana_gained_last_second: 0,
        knight_other_level: MAX_HERO_LEVEL,
        enemy_under_command: 0,
        elite_under_command: 0,
        totems_under_control: 0,
        traps_nearby: 0,
        serenity: 6,
        arcanic_emblems: 0,
        temporal_emblems: 0,
        obliteration_emblems: 0,
        last_cast_tormented: false,
        last_cast_delighted: false,
        next_cast_is_fortunate: false,
        next_cast_is_perfect: false,
        next_cast_is_new_emblem: true,
        enemy_percent_missing_health: 0,
        percent_missing_health: 0,
        percent_missing_mana: 0,
        percent_lock_health: 0,
        percent_lock_mana: 0,
        overall_reputation: 0,
        seconds_since_last_crit: 0,
        seconds_since_last_dodge: 0,
        hits_taken_recently: 0,
        skill_cast_recently: 0,
        frostbold_shot_recently: 0,
        slormocide_60: 0,
        goldbane_5: 0,
        rebounds_before_hit: 0,
        pierces_before_hit: 0,
        enemies_in_aoe: 0,
        enemies_affected_by_latent_storm: 1,
        target_is_close: false,
        target_is_isolated: false,
        target_is_tracked: false,
        target_is_time_locked: false,
        enemy_is_poisoned: false,
        enemy_has_military_oppression: true,
        target_has_negative_effect: false,
        target_is_skewered: false,
        target_is_splintered: false,
        target_has_broken_armor: false,
        is_first_hit: false,
        is_hit_blocked: false,
        is_last_volley: false,
        is_channeling_whirlwind: false,
        is_remnant: false,
        void_arrow_fully_charged: false,
        elites_in_radius: {
            10: 0
        },
        ennemies_in_radius: {
            2: 0,
            3: 0
        },
        negative_effects_on_ennemies_in_radius: {
            2: 0,
        },
        poison_enemies: 0,
        trap_triggered_recently: true,
        took_elemental_damage_recently: true,
        took_damage_before_next_cast: false,
        cast_support_before_next_cast: false,
        victims_reaper_104: 0,
        banners_nearby: 0,
        controlled_minions: 0,
        elemental_prowess_stacks: 1,
        totem_dexterity_stacks: 200,
        greed_stacks: 0,
        strider_stacks: 0,
        merchant_stacks: 0,
        nimble_champion_stacks: 10,
        ancestral_legacy_stacks: 0,
        conquest_stacks: 100,
        stability_stacks: 100,
        enlightenment_stacks: 999,
        delightful_rain_stacks: 100,
        target_latent_storm_stacks: 0,
        exhilerating_senses_stacks: 0,
        impatient_arrow_stacks: 20,
        frenzy_stacks: 15,
        oak_bark_armor_stacks: 10,
        enemy_bleed_stacks: 0,
        block_stacks: 0,
        melee_defense_stacks: 0,
        projectile_defense_stacks: 0,
        aoe_defense_stacks: 0,
        vitality_stacks: 10,
        cosmic_stacks: 0,
        invigorate_stacks: 5,
        distance_with_target: 0,
        has_aura_air_conditionner: true,
        has_aura_neriya_shield: true,
        has_aura_elemental_swap: true,
        has_aura_risk_of_pain: true,
        has_aura_inextricable_torment: true,
        has_elemental_temper_buff: true,
        has_burning_shadow_buff: true,
        has_gold_armor_buff: true,
        has_soul_bound_buff: true,
        has_adam_blessing_buff: true,
        has_manabender_buff: true,
        has_nimble_buff: true,
        has_ancient_recognition_buff: true,
        has_elemental_fervor_buff: true,
        has_ancestral_fervor_buff: true,
        has_assassin_haste_buff: true,
        has_smoke_screen_buff: true,
        has_ancestral_stab_slash_buff: true,
        has_banner_regeneration_buff: true,
        has_banner_haste_buff: true,
        has_enduring_protector_buff: true,
        has_speed_gate_buff: true,
        all_characters_level: 120,
        idle: true,
        damage_stored: 0,
        overdrive_bounces_left: 0,
        time_spend_channeling: 20,
        overdrive_last_bounce: false,
        hero_close_to_turret_syndrome: true,
        turret_syndrome_on_cooldown: true,
        projectile_passed_through_wall_of_omen: true,
    }

    private configuration: CharacterConfig;

    constructor() {
        this.configuration = { ...this.DEFAULT_CONFIG };
    }

    public updateAuraMissingResources(character: Character) {
        let missingMana = 0;
        let missingHealth = 0;

        for (const activable of [character.activable1, character.activable2, character.activable3, character.activable4]) {
            if (activable !== null && activable.cost !== null) {
                if (activable.costType === SkillCostType.LifeLock) {
                    missingHealth += activable.cost;
                }
                if (activable.costType === SkillCostType.ManaLock) {
                    missingMana += activable.cost;
                }
            }
        }

        this.configuration.percent_missing_mana = missingMana;
        this.configuration.percent_lock_mana = missingMana;
        this.configuration.percent_missing_health = missingHealth;
        this.configuration.percent_lock_health = missingHealth;
    }

    public getConfiguration(): CharacterConfig {
        return this.configuration;
    }

    public switchToCombatConfig(character: Character) {
        Object.assign(this.configuration, this.COMBAT_CONFIG);
        this.updateAuraMissingResources(character);
    }

    public switchToDefaultConfig(character: Character) {
        Object.assign(this.configuration, this.DEFAULT_CONFIG);
        this.updateAuraMissingResources(character);
    }
}