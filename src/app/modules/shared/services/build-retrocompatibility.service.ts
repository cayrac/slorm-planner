import { Injectable } from '@angular/core';
import { compareVersions, DEFAULT_CONFIG, GAME_VERSION, MAX_REAPER_AFFINITY_BASE } from 'slormancer-api';

import { Build } from '../model/build';

@Injectable({ providedIn: 'root' })
export class BuildRetrocompatibilityService {

    private readonly CHANGES: Array<{ version: string, update: (build: Build) => void }> = [
        {
            version: '0.0.2',
            update: build => {
                build.configuration['frostbolt_shot_recently'] = 0;
                build.configuration['has_elemental_prowess_buff'] = false;
                build.configuration['has_splash_splash_buff'] = false;
                build.configuration['has_booster_max_buff'] = false;
                build.version = '0.0.2';
            }
        },
        {
            version: '0.0.4',
            update: build => {
                build.configuration['use_enemy_state'] = false;
                build.version = '0.0.4';
            }
        },
        {
            version: '0.0.8',
            update: build => {
                build.version = '0.0.8';

                for (const layer of build.layers) {
                    layer.character.originalVersion = layer.character.version;
                    layer.character.version = GAME_VERSION;
                }

                build.configuration['has_electrify_buff'] = false;
                build.configuration['elemental_spirit_stacks'] = 0;
                build.configuration['is_channeling_focus'] = false;
            }
        },
        {
            version: '0.0.9',
            update: build => {
                build.version = '0.0.9';

                for (const layer of build.layers) {
                    layer.character.version = GAME_VERSION;
                }
            }
        },
        {
            version: '0.0.10',
            update: build => {
                build.version = '0.0.10';
            }
        },
        {
            version: '0.0.11',
            update: build => {
                build.version = '0.0.11';
                build.name = 'New build'
            }
        },
        {
            version: '0.0.12',
            update: build => {
                build.version = '0.0.12';

                for (const layer of build.layers) {
                    layer.character.importVersion = null;
                }
            }
        },
        {
            version: '0.1.0',
            update: build => {
                build.version = '0.1.0';

                if (build.configuration.concentration_buff === undefined) {
                    build.configuration.concentration_buff = false;
                }
                if (build.configuration.summoned_skeleton_squires === undefined) {
                    build.configuration.summoned_skeleton_squires = 0;
                }
                if (build.configuration.always_summon_maximum_skeleton_squires === undefined) {
                    build.configuration.always_summon_maximum_skeleton_squires = false;
                }
                if (build.configuration.minimum_unreserved_mana === undefined) {
                    build.configuration.minimum_unreserved_mana = 0;
                }
                if (build.configuration.fulgurorn_dedication_stacks === undefined) {
                    build.configuration.fulgurorn_dedication_stacks = 0;
                }
                if (build.configuration.enemy_inner_weakness_stacks === undefined) {
                    build.configuration.enemy_inner_weakness_stacks = 0;
                }
                if (build.configuration.add_totem_tag_to_prime_totem_skills === undefined) {
                    build.configuration.add_totem_tag_to_prime_totem_skills = false;
                }
                if (build.configuration.highest_slorm_temple_floor === undefined) {
                    build.configuration.highest_slorm_temple_floor = 0;
                }
                if (build.configuration.show_temple_keeper_as_totem === undefined) {
                    build.configuration.show_temple_keeper_as_totem = false;
                }
                if (build.configuration.ultima_momentum_buff === undefined) {
                    build.configuration.ultima_momentum_buff = false;
                }
                if (build.configuration.elder_slorms === undefined) {
                    build.configuration.elder_slorms = 0;
                }
                if (build.configuration.show_elder_inner_fire_damage === undefined) {
                    build.configuration.show_elder_inner_fire_damage = false;
                }
                if (build.configuration.exposed_armor_buff === undefined) {
                    build.configuration.exposed_armor_buff = false;
                }
                if (build.configuration.apex_predator_stacks === undefined) {
                    build.configuration.apex_predator_stacks = 0;
                }
                if (build.configuration.enemy_enfeeble_stacks === undefined) {
                    build.configuration.enemy_enfeeble_stacks = 0;
                }
                if (build.configuration.enfeeble_stacks_in_radius === undefined) {
                    build.configuration.enfeeble_stacks_in_radius = 0;
                }
                if ('all_characters_level' in build.configuration) {
                    (<any>build.configuration).all_characters_level = undefined;
                    build.configuration.all_other_characters_level = 100;
                }
            }
        },
        {
            version: '0.1.1',
            update: build => {
                build.version = '0.1.1';
            }
        },
        {
            version: '0.1.2',
            update: build => {
                build.version = '0.1.2';

                if (build.configuration.chilled_enemy_nearby === undefined) {
                    build.configuration.chilled_enemy_nearby = DEFAULT_CONFIG.chilled_enemy_nearby;
                }
                if (build.configuration.in_combat === undefined) {
                    build.configuration.in_combat = DEFAULT_CONFIG.in_combat;
                }
            }
        },
        {
            version: '0.1.3',
            update: build => {
                build.version = '0.1.3';
            }
        },
        {
            version: '0.1.4',
            update: build => {
                build.version = '0.1.4';
            }
        },
        {
            version: '0.1.5',
            update: build => {
                build.version = '0.1.5';
            }
        },
        {
            version: '0.2.0',
            update: build => {
                build.version = '0.2.0';

                for (const layer of build.layers) {
                    layer.character.reaper.baseAffinity = MAX_REAPER_AFFINITY_BASE;
                    layer.character.reaper.bonusAffinity = 0
                    layer.character.runes = {
                        effect: null,
                        enhancement: null,
                        activation: null
                    }
                }

                if (build.configuration.is_rune_active === undefined) {
                    build.configuration.is_rune_active = false;
                }
                if (build.configuration.effect_rune_affinity === undefined) {
                    build.configuration.effect_rune_affinity = 100;
                }
                if (build.configuration.effective_rune_stacks === undefined) {
                    build.configuration.effective_rune_stacks = 225;
                }
            }
        },
        {
            version: '0.2.1',
            update: build => {
                build.version = '0.2.1';
            }
        },
        {
            version: '0.2.2',
            update: build => {
                build.version = '0.2.2';
            }
        },
        {
            version: '0.2.3',
            update: build => {
                build.version = '0.2.3';
            }
        },
        {
            version: '0.2.5',
            update: build => {
                build.version = '0.2.5';
            }
        },
        {
            version: '0.2.5.1',
            update: build => {
                build.version = '0.2.5.1';
            }
        },
        {
            version: '0.2.5.2',
            update: build => {
                build.version = '0.2.5.2';
            }
        },
        {
            version: '0.3.0',
            update: build => {
                build.version = '0.3.0';
                build.configuration.has_living_inferno_buff = false;
                build.configuration.has_shadow_shield_buff = false;
                build.configuration.has_shadow_bargain_buff = false;
                build.configuration.has_flawless_defense_buff = false;
                build.configuration.aurelon_bargain_stacks = 0;
                build.configuration.cleansing_surge_stacks = 0;
                build.configuration.overcharged_stacks = 0;
                build.configuration.has_frostfire_buff = false;
                build.configuration.target_is_burning = false;
                if (build.configuration.all_other_characters_level === 100) {
                    build.configuration.all_other_characters_level = 140;
                }
            }
        },
        {
            version: '0.3.1',
            update: build => {
                build.version = '0.3.1';
            }
        },
        {
            version: '0.4.0',
            update: build => {
                build.version = '0.4.0';
                build.configuration.has_ancestral_instability_buff = false;
                build.configuration.ancestral_instability_buff_duration = 0;
                build.configuration.target_negative_effects = 0;
                build.configuration.efficiency_buff = false;
                build.configuration.has_avatar_of_shadow_buff = false;
                build.configuration.highest_same_type_reaper_level = 100;
            }
        },
        {
            version: '0.4.1',
            update: build => {
                build.version = '0.4.1';
            }
        },
        {
            version: '0.4.2',
            update: build => {
                build.version = '0.4.2';
            }
        },
        {
            version: '0.5.0',
            update: build => {
                build.version = '0.5.0';

                build.configuration.is_triggered_by_book_smash = false;

                for (const layer of build.layers) {
                    layer.character.ancestralLegacies.activeFirstNode = null;
                }
            }
        },
        {
            version: '0.5.1',
            update: build => {
                build.version = '0.5.1';
            }
        },
        {
            version: '0.6.0',
            update: build => {
                build.version = '0.6.0';
                build.configuration.indirect_defense_stacks = 0;
                build.configuration.other_characters_mastery_total = 30;
                build.configuration.support_streak_stacks = 0;
                build.configuration.victims_combo = 0;
                build.configuration.enemy_horrified_stacks = 0;
                build.configuration.bloodthirst_stacks = 0;
                build.configuration.has_blood_frenzy_buff = false;
                build.configuration.elemental_fury_stacks = 0;
                build.configuration.fighter_bane_stacks = 0;
                build.configuration.mage_bane_stacks = 0;
                build.configuration.moonlight_stacks = 0;
                build.configuration.sunlight_stacks = 0;
                build.configuration.moonlight_side = true;
                build.configuration.life_orbs_count = 0;
                build.configuration.ancestral_wrath_stacks = 0;
                build.configuration.is_curving_time_or_time_shifting = false;
            }
        },
    ];

    constructor() { }

    public updateToLatestVersion(build: Build) {
        
        if (build.version === undefined) {
            build.version = '0.0.1';
            build.configuration = DEFAULT_CONFIG;
        }

        for (let change of this.CHANGES) {
            if (compareVersions(change.version, build.version) > 0) {
                change.update(build);
            }
        }
    }

}