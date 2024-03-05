import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildStorageService } from '@shared/services/build-storage.service';
import {
    ALL_GEAR_SLOT_VALUES,
    Attribute,
    Character,
    DEFAULT_CONFIG,
    HeroClass,
    isNotNullOrUndefined,
    SkillGenre,
    UNITY_REAPERS,
    valueOrDefault,
} from 'slormancer-api';

import { ConfigEntry, ConfigGroup } from './config';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent extends AbstractUnsubscribeComponent implements OnInit {
    
    private EXTRA_VALIDATORS: { [key: string]: Array<ValidatorFn> } = {
        percent_missing_health: [Validators.max(100)],
        percent_missing_mana: [Validators.max(100)],
        enemy_percent_missing_health: [Validators.max(100)],
        block_stacks: [Validators.max(100)],
        nimble_champion_stacks: [Validators.max(200)],
        nimble_chaserenitympion_stacks: [Validators.max(12)]
    }

    public readonly GENERAL_CONFIG_GROUPS: Array<ConfigGroup> = [
        {
            title: 'General',
            condition: () => true,
            configurations: [
                { type: 'number', key: 'all_other_characters_level', label: 'Sum of all your other character\'s level' },
                { type: 'number', key: 'highest_same_type_reaper_level', label: 'Highest level among reapers of the same type of equipped reaper' },
                { type: 'number', key: 'completed_achievements', label: 'Number of completed achievements' },
                { type: 'number', key: 'elder_slorms', label: 'Total Elder Slorm' },
                { type: 'number', key: 'overall_reputation', label: 'Overall reputation' },
                { type: 'number', key: 'percent_missing_health', label: 'Missing life (%)', info: 'Total locked life will be used instead if higher' },
                { type: 'number', key: 'percent_missing_mana', label: 'Missing mana (%)', info: 'Total locked mana will be used instead if higher' },
                { type: 'number', key: 'controlled_minions', label: 'Minions under your control', info: 'Totems are not minions' },
                { type: 'number', key: 'totems_under_control', label: 'Totems under your control', info: 'Minions are not totems' },
                { type: 'number', key: 'highest_slorm_temple_floor', label: 'Highest Slorm Temple floor' },
                { type: 'boolean', key: 'idle', label: 'Are you idle ?' },
                { type: 'boolean', key: 'is_rune_active', label: 'Is your effect rune active ?' },
                { type: 'number', key: 'effect_rune_affinity', label: 'Affinity of your effect rune', info: 'Used if rune and reaper smith are differents' },
                { type: 'number', key: 'other_characters_mastery_total', label: 'Total mastery of other characters', info: 'Computed value is currently wrong in game, so the result based on this config may be different' },
            ]
        },
        {
            title: 'When in Combat',
            condition: () => true,
            configurations: [
                { type: 'number', key: 'mana_lost_last_second', label: 'Mana lost last second' },
                { type: 'number', key: 'mana_gained_last_second', label: 'Mana gained last second' },
                { type: 'number', key: 'active_inner_fire', label: 'Active inner fires' },
                { type: 'number', key: 'hits_taken_recently', label: 'Hits taken recently' },
                { type: 'number', key: 'skill_cast_recently', label: 'Skills cast recently' },
                { type: 'number', key: 'ennemies_in_radius', label: 'Number of ennemies close to you' },
                { type: 'number', key: 'elites_in_radius', label: 'Number of elites close to you' },
                { type: 'number', key: 'chilled_enemy_nearby', label: 'Number of frozen or chilled enemies close to you' },
                { type: 'number', key: 'victims_combo', label: 'Current combo counter' },
                { type: 'boolean', key: 'cast_support_before_next_cast', label: 'Did you cast a support skill recently' },
                { type: 'boolean', key: 'took_elemental_damage_recently', label: 'Did you take elemental damage recently' },
                { type: 'boolean', key: 'took_physical_damage_recently', label: 'Did you take physical damage recently' },
                { type: 'boolean', key: 'crit_recently', label: 'Did you deal a critical strike recently' },
                { type: 'boolean', key: 'dodge_recently', label: 'Did you dodge recently' },
                { type: 'boolean', key: 'in_combat', label: 'Are you in combat' },
            ]
        },
        {
            title: 'Enemy',
            condition: () => true,
            configurations: [
                { type: 'boolean', key: 'use_enemy_state', label: 'Use enemy state', info:'If unchecked, will ignore any stat given by a specific enemy state' },
                { type: 'number', key: 'enemy_percent_missing_health', label: 'Missing health (%)' },
                { type: 'number', key: 'distance_with_target', label: 'Distance with your hero (in yards)' },
                { type: 'boolean', key: 'target_is_close', label: 'Is close to you' },
                { type: 'boolean', key: 'target_is_isolated', label: 'Is isolated' },
                { type: 'boolean', key: 'target_has_broken_armor', label: 'Has broken armor' },
                { type: 'boolean', key: 'target_has_negative_effect', label: 'Has any negative effect' },
                { type: 'boolean', key: 'target_is_burning', label: 'Is burning' },
            ]
        },
    ];

    public readonly EQUIPMENT_CONFIG_GROUPS: Array<ConfigGroup> = [
        {
            title: 'Reaper (Adam Nostrus)',
            condition: character => character.reaper.id === 2,
            configurations: [
                { type: 'boolean', key: 'has_adam_blessing_buff', label: 'Do you have adam\'s blessing' },
            ]
        },
        {
            title: 'Reaper (Relentless Transferance)',
            condition: character => character.reaper.id === 5,
            configurations: [
                { type: 'number', key: 'indirect_defense_stacks', label: 'Number of indirect defense stacks' },
            ]
        },
        {
            title: 'Reaper (Master)',
            condition: character => character.reaper.id === 12 || character.reaper.id === 13 || character.reaper.id === 14,
            configurations: [
                { type: 'number', key: 'support_streak_stacks', label: 'Number of support streak stacks' },
            ]
        },
        {
            title: 'Reaper (Spectral Shapeshifter)',
            condition: character => character.reaper.id === 19 || character.reaper.id === 20 || character.reaper.id === 21,
            configurations: [
                { type: 'number', key: 'bloodthirst_stacks', label: 'Number of bloodthirst stacks' },
            ]
        },
        {
            title: 'Reaper (Bloodthirsty)',
            condition: character => character.reaper.id === 36,
            configurations: [
                { type: 'number', key: 'bloodthirst_stacks', label: 'Number of bloodthirst stacks' },
                { type: 'boolean', key: 'has_blood_frenzy_buff', label: 'Is blood frenzy active' },
            ]
        },
        {
            title: 'Reaper (Elemental Overload)',
            condition: character => character.reaper.id === 32 || character.reaper.id === 33 ||character.reaper.id === 34,
            configurations: [
                { type: 'number', key: 'elemental_fury_stacks', label: 'Number of elemental fury stacks' },
            ]
        },
        {
            title: 'Reaper (Recurring Nightmare)',
            condition: character => character.reaper.id === 45,
            configurations: [
                { type: 'number', key: 'mage_bane_stacks', label: 'Number of mage bane stacks' },
                { type: 'number', key: 'fighter_bane_stacks', label: 'Number of figher bane stacks' },
            ]
        },
        {
            title: 'Reaper (Unity)',
            condition: character => UNITY_REAPERS.includes(character.reaper.id),
            configurations: [
                { type: 'number', key: 'unity_level_0_47', label: 'Level of Legion, the first sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_48', label: 'Level of Legion, the second sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_49', label: 'Level of Legion, the third sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_50', label: 'Level of Legion, the fourth sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_51', label: 'Level of Legion, the fifth sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_52', label: 'Level of Legion, the sixth sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_47', label: 'Level of Legion, the first bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_48', label: 'Level of Legion, the second bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_49', label: 'Level of Legion, the third bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_50', label: 'Level of Legion, the fourth bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_51', label: 'Level of Legion, the fifth bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_52', label: 'Level of Legion, the sixth bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_47', label: 'Level of Legion, the first staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_48', label: 'Level of Legion, the second staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_49', label: 'Level of Legion, the third staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_50', label: 'Level of Legion, the fourth staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_51', label: 'Level of Legion, the fifth staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_52', label: 'Level of Legion, the sixth staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_47_p', label: 'Level of Legion, the first primordial sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_48_p', label: 'Level of Legion, the second primordial sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_49_p', label: 'Level of Legion, the third primordial sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_50_p', label: 'Level of Legion, the fourth primordial sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_51_p', label: 'Level of Legion, the fifth primordial sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_0_52_p', label: 'Level of Legion, the sixth primordial sword of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_47_p', label: 'Level of Legion, the first primordial bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_48_p', label: 'Level of Legion, the second primordial bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_49_p', label: 'Level of Legion, the third primordial bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_50_p', label: 'Level of Legion, the fourth primordial bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_51_p', label: 'Level of Legion, the fifth primordial bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_1_52_p', label: 'Level of Legion, the sixth primordial bow of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_47_p', label: 'Level of Legion, the first primordial staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_48_p', label: 'Level of Legion, the second primordial staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_49_p', label: 'Level of Legion, the third primordial staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_50_p', label: 'Level of Legion, the fourth primordial staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_51_p', label: 'Level of Legion, the fifth primordial staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
                { type: 'number', key: 'unity_level_2_52_p', label: 'Level of Legion, the sixth primordial staff of Unity', info:'Used for unity reapers values if not the currently equipped reaper' },
            ]
        },
        {
            title: 'Reaper (TimeShifter)',
            condition: character => character.reaper.id === 76,
            configurations: [
                { type: 'boolean', key: 'is_curving_time_or_time_shifting', label: 'Are you curving time or time shifting' },
            ]
        },
        {
            title: 'Reaper (Ancestral Wrath)',
            condition: character => character.reaper.id === 77,
            configurations: [
                { type: 'number', key: 'ancestral_wrath_stacks', label: 'Number of ancestral wrath stacks' },
            ]
        },
        {
            title: 'Reaper (Ancestral Harmony)',
            condition: character => character.reaper.id === 86,
            configurations: [
                { type: 'number', key: 'ancestral_preparation_stacks', label: 'Number of ancestral preparation stacks' },
            ]
        },
        {
            title: 'Reaper (Havoc)',
            condition: character => character.reaper.id === 90,
            configurations: [
                { type: 'number', key: 'wreak_havoc_stacks', label: 'Number of wreak havoc stacks' },
            ]
        },
        {
            title: 'Reaper (Sun and Moon)',
            condition: character => character.reaper.id === 96,
            configurations: [
                { type: 'number', key: 'moonlight_stacks', label: 'Number of moonlight stacks' },
                { type: 'number', key: 'sunlight_stacks', label: 'Number of sunlight stacks' },
                { type: 'boolean', key: 'moonlight_side', label: 'Is the reaper on the moonlight side' },
            ]
        },
        {
            title: 'Reaper (of the Many)',
            condition: character => character.reaper.id === 103,
            configurations: [
                { type: 'number', key: 'life_orbs_count', label: 'Number of life orbs' }
            ]
        },
        {
            title: 'Reaper (Manificient Leviathan)',
            condition: character => character.reaper.id === 105,
            configurations: [
                { type: 'number', key: 'victims_reaper_104', label: 'Kills with Goldfish reaper' },
            ]
        },
        {
            title: 'Reaper (Lifebender)',
            condition: character => character.reaper.id === 73,
            configurations: [
                { type: 'number', key: 'damage_stored', label: 'Last damage received' },
            ]
        },
        {
            title: 'Reaper (Manabender)',
            condition: character => character.reaper.id === 74,
            configurations: [
                { type: 'boolean', key: 'has_manabender_buff', label: 'Is manabender (buff) active' },
            ]
        },
        {
            title: 'Reaper (Nimble warrior)',
            condition: character => character.reaper.id === 75,
            configurations: [
                { type: 'boolean', key: 'has_nimble_buff', label: 'Is nimble effect active' },
                { type: 'number', key: 'nimble_champion_stacks', label: 'Nimble champion stacks' },
            ]
        },
        {
            title: 'Reaper (Chrysalis)',
            condition: character => character.reaper.id === 79 || character.reaper.id === 80,
            configurations: [
                { type: 'number', key: 'negative_effects_on_ennemies_in_radius', label: 'Total number of negative effect on enemies' },
            ]
        },
        {
            title: 'Reaper (Ancestral Legacy)',
            condition: character => character.reaper.id === 82 || character.reaper.id === 83,
            configurations: [
                { type: 'number', key: 'ancestral_legacy_stacks', label: 'Number of ancient legacy stacks' },
                { type: 'boolean', key: 'has_elemental_fervor_buff', label: 'Is elemental fervor active' },
                { type: 'boolean', key: 'has_elemental_fervor_buff', label: 'Is elemental fervor active' },
            ]
        },
        {
            title: 'Reaper (Slormbane)',
            condition: character => character.reaper.id === 111,
            configurations: [
                { type: 'number', key: 'slormocide_60', label: 'Amount of slorm found recently' },
            ]
        },
        {
            title: 'Reaper (Goldbane)',
            condition: character => character.reaper.id === 112,
            configurations: [
                { type: 'number', key: 'goldbane_5', label: 'Amount of gold found recently' },
            ]
        },
        {
            title: 'Reaper (Aurifurious)',
            condition: character => character.reaper.id === 113,
            configurations: [
                { type: 'number', key: 'slormocide_60', label: 'Amount of slorm found recently' },
                { type: 'number', key: 'goldbane_5', label: 'Amount of gold found recently' },
            ]
        },
        {
            title: 'Reaper (Concentrated Inner Strength)',
            condition: character => character.reaper.id === 23,
            configurations: [
                { type: 'boolean', key: 'concentration_buff', label: 'Is Concentration active' },
            ]
        },
        {
            title: 'Reaper (Fate-Crusher)',
            condition: character => character.reaper.id === 53,
            configurations: [
                { type: 'number', key: 'fulgurorn_dedication_stacks', label: 'Fulgurorn\'s Dedication stacks' },
            ]
        },
        {
            title: 'Reaper (Inner Fireworks)',
            condition: character => character.reaper.id === 57 || character.reaper.id === 58,
            configurations: [
                { type: 'number', key: 'enemy_inner_weakness_stacks', label: 'Inner weakness stacks on enemy', info: 'Effect is applied if "use enemy state" is checked' },
            ]
        },
        {
            title: 'Reaper (Temple Keeper)',
            condition: character => character.reaper.id === 84,
            configurations: [
                { type: 'boolean', key: 'show_temple_keeper_as_totem', label: 'Display temple keeper stats on it\'s totem\'s form' },
            ]
        },
        {
            title: 'Reaper (Slorm Temple)',
            condition: character => character.reaper.id === 85,
            configurations: [
                { type: 'boolean', key: 'ultima_momentum_buff', label: 'Is Ultima-Momentum active' },
                { type: 'boolean', key: 'show_elder_inner_fire_damage', label: 'Show inner fire damages as elder' },
            ]
        },
        {
            title: 'Reaper (Giant Slayer)',
            condition: character => character.reaper.id === 91 ||character.reaper.id === 92,
            configurations: [
                { type: 'number', key: 'enemy_enfeeble_stacks', label: 'Enemy enfeeble stacks', info: 'Effect is applied if "use enemy state" is checked' },
                { type: 'number', key: 'apex_predator_stacks', label: 'Apex predator stacks' },
                { type: 'number', key: 'enfeeble_stacks_in_radius', label: 'Enfeeble stacks on enemies around you' },
            ]
        },
        {
            title: 'Rune (Enhancement of Hagan)',
            condition: character => character.runes.enhancement !== null && character.runes.enhancement.id === 23,
            configurations: [
                { type: 'number', key: 'effective_rune_stacks', label: 'Effective rune stacks' },
            ]
        },
        {
            title: 'Gold Armor',
            condition: character => this.hasActivable(character, 0),
            configurations: [
                { type: 'boolean', key: 'has_gold_armor_buff', label: 'Is Gold Armor active' },
            ]
        },
        {
            title: 'Splash Splash',
            condition: character => this.hasActivable(character, 3),
            configurations: [
                { type: 'boolean', key: 'has_splash_splash_buff', label: 'Is splash splash active', info: 'It really does nothing, i checked' },
            ]
        },
        {
            title: 'Booster Max',
            condition: character => this.hasActivable(character, 6),
            configurations: [
                { type: 'boolean', key: 'has_booster_max_buff', label: 'Is booster max active' },
            ]
        },
        {
            title: 'Summon Skeleton Squire',
            condition: character => this.hasActivable(character, 17),
            configurations: [
                { type: 'number', key: 'summoned_skeleton_squires', label: 'Number of summoned skeleton squires' },
                { 
                    type: 'boolean',
                    key: 'always_summon_maximum_skeleton_squires',
                    label: 'Always summon the maximum number of skeleton squires',
                    info: 'Based on your available mana after other skills reservation. Override fixed number of summoned skeleton squires'
                },
                { 
                    type: 'number',
                    key: 'minimum_unreserved_mana',
                    label: 'Minimum unreserved mana',
                    info: 'When summoning skeleton squires, will make sure that your mana do not go under this value. When exporting a build, this value is set to your highest skill cost.'
                },
            ]
        },
        {
            title: 'Summon Prime Totem',
            condition: character => this.hasActivable(character, 19),
            configurations: [
                { 
                    type: 'boolean',
                    key: 'add_totem_tag_to_prime_totem_skills',
                    label: 'Apply totem tags to Wood Sticks / Arrow Shots / Arcane Missiles'
                }
            ]
        },
        {
            title: 'Exposed Armor',
            condition: character => this.hasActivable(character, 23),
            configurations: [
                { 
                    type: 'boolean',
                    key: 'exposed_armor_buff',
                    label: 'Is exposed armor active'
                }
            ]
        },
        {
            title: 'Willpower',
            condition: character => this.isAttributeAllocated(character, Attribute.Willpower),
            configurations: [
                { type: 'boolean', key: 'has_elemental_prowess_buff', label: 'Is elemental prowess active' },
            ]
        },
        {
            title: 'Dexterity',
            condition: character => this.isAttributeAllocated(character, Attribute.Dexterity),
            configurations: [
                { type: 'number', key: 'totem_dexterity_stacks', label: 'Number of totem dexterity stacks' },
            ]
        },
        {
            title: 'Bravery',
            condition: character => this.isAttributeAllocated(character, Attribute.Bravery),
            configurations: [
                { type: 'number', key: 'greed_stacks', label: 'Number of greed stacks' },
                { type: 'number', key: 'strider_stacks', label: 'Number of strider stacks' },
                { type: 'number', key: 'merchant_stacks', label: 'Number of merchant stacks' },
            ]
        },
        {
            title: 'Burning Shadow',
            condition: character => this.isAncestralLegacyEquipped(character, 80),
            configurations: [
                { type: 'boolean', key: 'has_burning_shadow_buff', label: 'Is burning shadow active' },
            ]
        },
        {
            title: 'Elemental Temper',
            condition: character => this.isAncestralLegacyEquipped(character, 85),
            configurations: [
                { type: 'boolean', key: 'has_elemental_temper_buff', label: 'Is elemental temper active' },
            ]
        },
        {
            title: 'Electrify',
            condition: character => this.isAncestralLegacyEquipped(character, 33),
            configurations: [
                { type: 'boolean', key: 'has_electrify_buff', label: 'Are you on Electrify' },
            ]
        },
        {
            title: 'Elemental Spirit',
            condition: character => this.isAncestralLegacyEquipped(character, 106),
            configurations: [
                { type: 'number', key: 'elemental_spirit_stacks', label: 'Number of elemental spirit stacks' },
            ]
        },
        {
            title: 'Focus',
            condition: character => this.isAncestralLegacyEquipped(character, 82),
            configurations: [
                { type: 'boolean', key: 'is_channeling_focus', label: 'Are you channeling Focus' },
            ]
        },
        {
            title: 'Living inferno',
            condition: character => this.isAncestralLegacyEquipped(character, 14),
            configurations: [
                { type: 'boolean', key: 'has_living_inferno_buff', label: 'Is Living inferno active' },
            ]
        },
        {
            title: 'Shadow Shield',
            condition: character => this.isAncestralLegacyEquipped(character, 65),
            configurations: [
                { type: 'boolean', key: 'has_shadow_shield_buff', label: 'Is Shadow Shield active' },
            ]
        },
        {
            title: 'Flawless Defense',
            condition: character => this.isAncestralLegacyEquipped(character, 83),
            configurations: [
                { type: 'boolean', key: 'has_flawless_defense_buff', label: 'Is Flawless Defense active' },
            ]
        },
        {
            title: 'Shadow Bargain',
            condition: character => this.isAncestralLegacyEquipped(character, 74),
            configurations: [
                { type: 'boolean', key: 'has_shadow_bargain_buff', label: 'Is Shadow Bargain active' },
            ]
        },
        {
            title: 'Frostfire Armor',
            condition: character => this.isAncestralLegacyEquipped(character, 76),
            configurations: [
                { type: 'boolean', key: 'has_frostfire_buff', label: 'Is Frostfire Armor active' },
            ]
        },
        {
            title: 'Faith of the Ancients',
            condition: character => this.hasLegendaryEffect(character, 31),
            configurations: [
                { type: 'boolean', key: 'has_ancient_recognition_buff', label: 'Is ancient recognition active' },
            ]
        },
        {
            title: 'Steaming Ancestral Fervor',
            condition: character => this.hasLegendaryEffect(character, 29),
            configurations: [
                { type: 'boolean', key: 'has_ancestral_fervor_buff', label: 'Is ancestral fervor active' },
            ]
        },
        {
            title: 'The Voltaroid',
            condition: character => this.hasLegendaryEffect(character, 75),
            configurations: [
                { type: 'number', key: 'high_voltage_stacks', label: 'Number of high voltage stacks' },
            ]
        },
        {
            title: 'Repercussive Cloak',
            condition: character => this.hasLegendaryEffect(character, 77),
            configurations: [
                { type: 'boolean', key: 'has_shadow_repercussion_buff', label: 'Is shadow repercussion active' },
            ]
        },
        {
            title: 'Gazloka\'s Conquest',
            condition: character => this.hasLegendaryEffect(character, 26),
            configurations: [
                { type: 'number', key: 'conquest_stacks', label: 'Number of conquest stacks' },
            ]
        },
        {
            title: 'Wizard\'s Catalyst',
            condition: character => this.hasLegendaryEffect(character, 63),
            configurations: [
                { type: 'number', key: 'elemental_weakness_stacks', label: 'Number of elemental weakness stacks on your target' },
            ]
        },
        {
            title: 'Greaves of Stability',
            condition: character => this.hasLegendaryEffect(character, 16),
            configurations: [
                { type: 'number', key: 'stability_stacks', label: 'Number of stability stacks' },
            ]
        },
        {
            title: 'Art of Retribution',
            condition: character => this.hasLegendaryEffect(character, 16),
            configurations: [
                { type: 'number', key: 'revengeance_stacks', label: 'Number of reveangence stacks' },
            ]
        },
        {
            title: 'Enlightening Journey',
            condition: character => this.hasLegendaryEffect(character, 76),
            configurations: [
                { type: 'number', key: 'enlightenment_stacks', label: 'Number of enlightenment stacks' },
            ]
        },
        {
            title: 'Aurelon\'s Bargain',
            condition: character => this.isAncestralLegacyEquipped(character, 78),
            configurations: [
                { type: 'number', key: 'aurelon_bargain_stacks', label: 'Number of Aurelon\'s stacks' },
            ]
        },
        {
            title: 'Cleansing Surge',
            condition: character => this.isAncestralLegacyEquipped(character, 37),
            configurations: [
                { type: 'number', key: 'cleansing_surge_stacks', label: 'Number of Cleansing surge stacks' },
            ]
        },
        {
            title: 'Charging up!',
            condition: character => this.isAncestralLegacyEquipped(character, 39),
            configurations: [
                { type: 'number', key: 'overcharged_stacks', label: 'Number of Overcharged stacks' },
            ]
        },
        {
            title: 'A Path to the First',
            condition: character => this.hasLegendaryEffect(character, 32),
            configurations: [
                { type: 'boolean', key: 'overdrive_last_bounce', label: 'Is it the last bounce' },
                { type: 'number', key: 'overdrive_bounces_left', label: 'Number of bounces left' },
            ]
        },
        {
            title: 'A Link to the Last',
            condition: character => this.hasLegendaryEffect(character, 33),
            configurations: [
                { type: 'boolean', key: 'overdrive_last_bounce', label: 'Is it the last bounce' },
            ]
        },
        {
            title: 'Neriya\'s Frenzy',
            condition: character => this.hasLegendaryEffect(character, 74),
            configurations: [
                { type: 'boolean', key: 'frostbolt_shot_recently', label: 'Frostbolt shot recently' },
            ]
        },
        {
            title: 'Ancestral Instability',
            condition: character => this.isAncestralLegacyEquipped(character, 91),
            configurations: [
                { type: 'boolean', key: 'has_ancestral_instability_buff', label: 'Is ancestral instability active' },
                { type: 'number', key: 'ancestral_instability_buff_duration', label: 'Ancestral instability duration (in seconds)' },
            ]
        },
        {
            title: 'Efficiency',
            condition: character => this.isAncestralLegacyEquipped(character, 84),
            configurations: [
                { type: 'boolean', key: 'efficiency_buff', label: 'Is efficiency active' },
            ]
        },
        {
            title: 'Avatar of Shadow',
            condition: character => this.isAncestralLegacyEquipped(character, 70),
            configurations: [
                { type: 'boolean', key: 'has_avatar_of_shadow_buff', label: 'Is avatar of shadow active' },
            ]
        }

    ];

    public readonly CLASS_CONFIG_GROUPS: Array<ConfigGroup> = [
        {
            title: 'Knight',
            condition: character => character.heroClass === HeroClass.Warrior,
            configurations: [
                { type: 'number', key: 'knight_other_level', label: 'Highest level between Mage and Huntress' },
                { type: 'number', key: 'block_stacks', label: 'Number of block stacks' },
                { type: 'boolean', key: 'next_cast_is_fortunate', label: 'Is your next cast fortunate' },
                { type: 'boolean', key: 'next_cast_is_perfect', label: 'Is your next cast perfect' },
                { type: 'boolean', key: 'is_hit_blocked', label: 'Are you blocking a hit', info: 'Used to computed additional effects on block (like thorn or retaliate)' },
                { type: 'boolean', key: 'target_is_skewered', label: 'Is your target skewered' },
            ]
        },
        {
            title: 'Banner of War',
            condition: character => this.isSkillEquipped(character, HeroClass.Warrior, 0),
            configurations: [
                { type: 'number', key: 'banners_nearby', label: 'Number of banners are under your control' },
                { type: 'boolean', key: 'has_banner_regeneration_buff', label: 'Is banner of regeneration active' },
                { type: 'boolean', key: 'has_banner_haste_buff', label: 'Is banner of haste active' },
            ]
        },
        {
            title: 'Enduring Protector',
            condition: character => this.isSkillEquipped(character, HeroClass.Warrior, 2),
            configurations: [
                { type: 'boolean', key: 'has_enduring_protector_buff', label: 'Is enduring protector active' },
            ]
        },
        {
            title: 'Mighty Swing',
            condition: character => this.isSkillEquipped(character, HeroClass.Warrior, 3),
            configurations: [
                { type: 'number', key: 'frenzy_stacks', label: 'Number of frenzy stacks' },
            ]
        },
        {
            title: 'Wood Stick',
            condition: character => this.isSkillEquipped(character, HeroClass.Warrior, 4),
            configurations: [
                { type: 'number', key: 'oak_bark_armor_stacks', label: 'Number of oak-bark armor stacks' },
                { type: 'number', key: 'enemy_splintered_stacks', label: 'Number of splintered stacks on your target' },
            ]
        },
        {
            title: 'Throwing sword',
            condition: character => this.isSkillEquipped(character, HeroClass.Warrior, 5),
            configurations: [
                { type: 'number', key: 'enemy_bleed_stacks', label: 'Number of bleed stacks on enemies around you' },
                { type: 'number', key: 'enemy_splintered_stacks', label: 'Number of splintered stacks on your target' },
            ]
        },
        {
            title: 'Cadence',
            condition: character => this.isSkillEquipped(character, HeroClass.Warrior, 6),
            configurations: [
                { type: 'boolean', key: 'enemy_has_military_oppression', label: 'Is your target affected by military oppression' },
            ]
        },
        {
            title: 'Grappling Hook',
            condition: character => this.isSkillEquipped(character, HeroClass.Warrior, 7),
            configurations: [
                { type: 'number', key: 'enemy_under_command', label: 'Number of enemies under your control' },
                { type: 'number', key: 'elite_under_command', label: 'Number of elites under your control' },
                { type: 'number', key: 'melee_defense_stacks', label: 'Number of melee defense stacks' },
                { type: 'number', key: 'projectile_defense_stacks', label: 'Number of projectile defense stacks' },
                { type: 'number', key: 'aoe_defense_stacks', label: 'Number of aoe defense stacks' },
                { type: 'number', key: 'vitality_stacks', label: 'Number of vitality stacks' },
            ]
        },
        {
            title: 'Whirlwind',
            condition: character => this.isSkillEquipped(character, HeroClass.Warrior, 9),
            configurations: [
                { type: 'number', key: 'time_spend_channeling', label: 'For how long have you been channeling (seconds)' },
                { type: 'boolean', key: 'is_channeling_whirlwind', label: 'Are you channeling whirlwind' },
            ]
        },
        {
            title: 'Elder Lance',
            condition: character => this.isSkillEquipped(character, HeroClass.Warrior, 10),
            configurations: [
                { type: 'number', key: 'cosmic_stacks', label: 'Number of cosmic stacks' }
            ]
        },
        {
            title: 'Huntress',
            condition: character => character.heroClass === HeroClass.Huntress,
            configurations: [
                { type: 'number', key: 'serenity', label: 'What is your serenity level' },
                { type: 'number', key: 'traps_nearby', label: 'Number of traps nearby' },
                { type: 'number', key: 'poison_enemies', label: 'Number of poisoned enemies nearby' },
                { type: 'boolean', key: 'trap_triggered_recently', label: 'Did you trigger a trap recently' },
                { type: 'boolean', key: 'last_cast_tormented', label: 'Was your last cast tormented' },
                { type: 'boolean', key: 'last_cast_delighted', label: 'Was your last cast delighted' },
                { type: 'boolean', key: 'enemy_is_poisoned', label: 'Is your target poisoned' },
            ]
        },
        {
            title: 'Turret Syndrome',
            condition: character => this.isSkillEquipped(character, HeroClass.Huntress, 0),
            configurations: [
                { type: 'boolean', key: 'turret_syndrome_on_cooldown', label: 'Is turret syndrome on cooldown' },
                { type: 'boolean', key: 'hero_close_to_turret_syndrome', label: 'Are you close to your turret' },
            ]
        },
        {
            title: 'Tumble',
            condition: character => this.isSkillEquipped(character, HeroClass.Huntress, 1),
            configurations: [
                { type: 'boolean', key: 'has_assassin_haste_buff', label: 'Is assassin\'s haste active' },
            ]
        },
        {
            title: 'Smoke screen',
            condition: character => this.isSkillEquipped(character, HeroClass.Huntress, 2),
            configurations: [
                { type: 'boolean', key: 'has_smoke_screen_buff', label: 'Is smoke screen active' },
            ]
        },
        {
            title: 'Arrow Shot',
            condition: character => this.isSkillEquipped(character, HeroClass.Huntress, 3),
            configurations: [
                { type: 'number', key: 'rebounds_before_hit', label: 'Number of rebounds before hit' },
                { type: 'number', key: 'pierces_before_hit', label: 'Number of enemies pierced before hit' },
                { type: 'boolean', key: 'is_first_arrow_shot_hit', label: 'Is arrow shot hiting for the first time', info: 'Used to compute effects on first hit and before the first hit' },
                { type: 'boolean', key: 'target_is_tracked', label: 'Is your target tracked' },
            ]
        },
        {
            title: 'Rain of Arrows',
            condition: character => this.isSkillEquipped(character, HeroClass.Huntress, 4),
            configurations: [
                { type: 'number', key: 'delightful_rain_stacks', label: 'Number of delightful rain stacks' },
                { type: 'number', key: 'enemies_in_rain_of_arrow', label: 'Number of enemies inside your rain of arrow' },
                { type: 'boolean', key: 'is_last_volley', label: 'Is it the last volley' },
            ]
        },
        {
            title: 'Stab',
            condition: character => this.isSkillEquipped(character, HeroClass.Huntress, 5),
            configurations: [
                { type: 'boolean', key: 'has_ancestral_stab_slash_buff', label: 'Is ancestral stab slash active' },
            ]
        },
        {
            title: 'Fist of the wild',
            condition: character => this.isSkillEquipped(character, HeroClass.Huntress, 7),
            configurations: [
                { type: 'number', key: 'target_latent_storm_stacks', label: 'Number of latent storms on your target' },
                { type: 'number', key: 'enemies_affected_by_latent_storm', label: 'Number of enemies affected by latent storm' },
            ]
        },
        {
            title: 'Void Arrow',
            condition: character => this.isSkillEquipped(character, HeroClass.Huntress, 8),
            configurations: [
                { type: 'boolean', key: 'void_arrow_fully_charged', label: 'Is void arrow fully charged' },
            ]
        },
        {
            title: 'Immortal Arrow',
            condition: character => this.isSkillEquipped(character, HeroClass.Huntress, 9),
            configurations: [
                { type: 'number', key: 'exhilerating_senses_stacks', label: 'Number of exhilerating sense stacks' },
                { type: 'number', key: 'impatient_arrow_stacks', label: 'Number of impatient arrow stacks' },
            ]
        },
        {
            title: 'Mage',
            condition: character => character.heroClass === HeroClass.Mage,
            configurations: [
                { type: 'number', key: 'arcanic_emblems', label: 'Number of arcanic emblems' },
                { type: 'number', key: 'temporal_emblems', label: 'Number of temporal emblems' },
                { type: 'number', key: 'obliteration_emblems', label: 'Number of obliteration emblems' },
                { type: 'boolean', key: 'is_remnant', label: 'Is your skill a remnant version' },
                { type: 'boolean', key: 'target_is_time_locked', label: 'Is your target time locked' },
                { type: 'boolean', key: 'next_cast_is_new_emblem', label: 'Next cast on an emblem you do not have' },
            ]
        },
        {
            title: 'Wall of Omen',
            condition: character => this.isSkillEquipped(character, HeroClass.Mage, 0),
            configurations: [
                { type: 'number', key: 'invigorate_stacks', label: 'Number of invigorate stacks' },
                { type: 'boolean', key: 'projectile_passed_through_wall_of_omen', label: 'Did your projectile passed through Wall of Omen' },
                { type: 'boolean', key: 'has_speed_gate_buff', label: 'Did your hero passed through Wall of Omen' },
            ]
        },
        {
            title: 'Arcane Barrier',
            condition: character => this.isSkillEquipped(character, HeroClass.Mage, 2),
            configurations: [
                { type: 'boolean', key: 'is_channeling_arcane_barrier', label: 'Are you channeling Arcane Barrier' },
            ]
        },
        {
            title: 'Ray of Obliteration',
            condition: character => this.isSkillEquipped(character, HeroClass.Mage, 4),
            configurations: [
                { type: 'number', key: 'ray_of_obliteration_grow_stacks', label: 'Number of Ray of Obliteration grow stacks' },
                { type: 'boolean', key: 'is_channeling_ray_of_obliteration', label: 'Are you channeling Ray of Obliteration' },
                { type: 'boolean', key: 'ray_of_obliteration_is_short', label: 'Are you casting a short ray' },
            ]
        },
        {
            title: 'Book Smash',
            condition: character => this.isSkillEquipped(character, HeroClass.Mage, 5),
            configurations: [
                { type: 'boolean', key: 'is_triggered_by_book_smash', label: 'Is inner fire and overdrive triggered by book smash' },
            ]
        },
        {
            title: 'Rift Nova',
            condition: character => this.isSkillEquipped(character, HeroClass.Mage, 6),
            configurations: [
                { type: 'boolean', key: 'high_spirit_stacks', label: 'Number of spirit stacks' },
                { type: 'boolean', key: 'rift_nova_fully_charged', label: 'Is Rift Nova fully charged' },
                { type: 'boolean', key: 'target_has_remnant_vulnerability', label: 'Is your target affected by remnant vulnerability' },
            ]
        },
        {
            title: 'Chrono-Puncture',
            condition: character => this.isSkillEquipped(character, HeroClass.Mage, 7),
            configurations: [
                { type: 'number', key: 'chrono_manamorphosis_stacks', label: 'Number of chrono manamorphosis stacks' },
                { type: 'number', key: 'chrono_armor_stacks', label: 'Number of chrono armor stacks' },
                { type: 'number', key: 'chrono_empower_stacks', label: 'Number of chrono empower stacks' },
                { type: 'number', key: 'chrono_speed_stacks', label: 'Number of chrono speed stacks' },
                { type: 'number', key: 'enemy_traumatized_stacks', label: 'Number of traumatized stacks on your target' },
            ]
        },
        {
            title: 'Attunment Pulse',
            condition: character => this.isSkillEquipped(character, HeroClass.Mage, 8),
            configurations: [
                { type: 'enum', key: 'attunment_pulse_current_school', label: 'Current school', values: [ { value: SkillGenre.Arcanic, label: 'Arcanic'}, { value: SkillGenre.Temporal, label: 'Temporal'}, { value: SkillGenre.Obliteration, label: 'Obliteration'}] },
                { type: 'boolean', key: 'target_has_arcane_discordance', label: 'Does your target have arcane discordance' },
                { type: 'boolean', key: 'target_has_temporal_discordance', label: 'Does your target have temporal discordance' },
                { type: 'boolean', key: 'target_has_obliteration_discordance', label: 'Does your target have obliteration discordance' },
            ]
        },
        {
            title: 'Arcane Breach',
            condition: character => this.isSkillEquipped(character, HeroClass.Mage, 9),
            configurations: [
                { type: 'number', key: 'enemies_in_breach_range', label: 'Number of enemies in your breachs' },
                { type: 'number', key: 'arcane_flux_stacks', label: 'Number of arcane flux stacks' },
                { type: 'number', key: 'arcane_breach_collision_stacks', label: 'Number of arcane skills that collided with your breach' },
                { type: 'number', key: 'temporal_breach_collision_stacks', label: 'Number of temporal skills that collided with your breach' },
                { type: 'number', key: 'obliteration_breach_collision_stacks', label: 'Number of obliteration skills that collided with your breach' },
                { type: 'boolean', key: 'clone_is_in_breach_range', label: 'Is your clone inside a breach' },
                { type: 'boolean', key: 'target_is_in_breach_range', label: 'Is your target inside a breach' },
            ]
        },
    ];

    public config: FormGroup | null = null;

    constructor(private buildStorageService: BuildStorageService) {
        super();
    }

    public ngOnInit() {
        this.config = this.generateConfigurationForm();

        this.config.valueChanges
            .subscribe(() => this.updateConfiguration())
    }

    private generateConfigurationForm() {
        let formData: { [key: string]: FormControl } = {};

        const build = this.buildStorageService.getBuild();
        const configEntries = Object.entries(build !== null ? build.configuration : DEFAULT_CONFIG);
        for (const entry of configEntries) {
            let validators = [Validators.required, ...valueOrDefault(this.EXTRA_VALIDATORS[entry[0]], [])];
            if (entry[1] === 'number') {
                validators.push(Validators.min(0));
            }
            formData[entry[0]] = new FormControl(entry[1], validators);
        }

        return new FormGroup(formData);
    }

    private updateConfiguration() {
        const build = this.buildStorageService.getBuild();
        if (this.config !== null && build !== null && this.config.valid) {
            build.configuration = this.config.value;
            this.buildStorageService.saveBuild();
        }
    }

    public getControl(entry: ConfigEntry): FormControl | null {
        return this.config === null ? null : <FormControl>this.config.get(entry.key);
    }

    public isGroupValid(group: ConfigGroup): boolean {
        const layer = this.buildStorageService.getLayer();
        return layer !== null && group.condition(layer.character);
    }

    public hasActivable(character: Character, id: number): boolean {
        return [character.activable1, character.activable2, character.activable3, character.activable4]
            .filter(isNotNullOrUndefined)
            .some(activable => !('element' in activable) && activable.id === id);
    }

    public isSkillEquipped(character: Character, heroClass: HeroClass, id: number): boolean {
        return character.heroClass === heroClass && [character.primarySkill, character.secondarySkill, character.supportSkill]
            .filter(isNotNullOrUndefined)
            .some(skill => skill.id === id);
    }

    public isAttributeAllocated(character: Character, attribute: Attribute): boolean {
        const att = character.attributes.allocated[attribute];
        return att.rank > 0;
    }

    public isAncestralLegacyEquipped(character: Character, ancestralLegacy: number): boolean {
        return character.ancestralLegacies.activeAncestralLegacies.includes(ancestralLegacy);
    }

    public hasLegendaryEffect(character: Character, legendaryId: number): boolean {
        return ALL_GEAR_SLOT_VALUES.map(slot => character.gear[slot]?.legendaryEffect)
            .filter(isNotNullOrUndefined)
            .some(effect => effect.id === legendaryId);
    }
}
