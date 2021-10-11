import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { DEFAULT_CONFIG } from '../../../slormancer/constants/content/data/default-configs';
import { Character } from '../../../slormancer/model/character';
import { isNotNullOrUndefined, valueOrDefault } from '../../../slormancer/util/utils';
import { ConfigEntry, ConfigGroup } from './config';

/*
attunment_pulse_current_school: SkillGenre;

    knight_other_level: number;
    serenity: number;
    arcanic_emblems: number;
    temporal_emblems: number;
    obliteration_emblems: number;

    enemy_under_command: number;
    enemies_in_breach_range: number;
    elite_under_command: number;
    last_cast_tormented: boolean;
    last_cast_delighted: boolean;
    next_cast_is_fortunate: boolean;
    next_cast_is_perfect: boolean;
    next_cast_is_new_emblem: boolean;

    enemy_is_poisoned: boolean;
    enemy_has_military_oppression: boolean;
    traps_nearby: number;
    slormocide_60: number;
    goldbane_5: number;

    frostbold_shot_recently: number;
    rebounds_before_hit: number;
    pierces_before_hit: number;
    enemies_in_rain_of_arrow: number;
    enemies_affected_by_latent_storm: number;
    clone_is_in_breach_range: boolean;

    is_first_hit: boolean;
    is_hit_blocked: boolean;
    is_last_volley: boolean;
    is_remnant: boolean;
    is_channeling_whirlwind: boolean;
    is_channeling_arcane_barrier: boolean;
    is_channeling_ray_of_obliteration: boolean;
    ray_of_obliteration_is_short: boolean;
    void_arrow_fully_charged: boolean;
    rift_nova_fully_charged: boolean;
    poison_enemies: number;
    trap_triggered_recently: boolean;

    target_is_tracked: boolean;
    target_is_skewered: boolean;
    target_is_time_locked: boolean;
    target_is_in_breach_range: boolean;
    target_has_remnant_vulnerability: boolean;
    target_has_arcane_discordance: boolean;
    target_has_temporal_discordance: boolean;
    target_has_obliteration_discordance: boolean;

    banners_nearby: number;
    elemental_prowess_stacks: number;
    greed_stacks: number;
    strider_stacks: number;
    merchant_stacks: number;
    totem_dexterity_stacks: number;
    ancestral_legacy_stacks: number;
    conquest_stacks: number;
    stability_stacks: number;
    enlightenment_stacks: number;
    delightful_rain_stacks: number;
    target_latent_storm_stacks: number;
    exhilerating_senses_stacks: number;
    impatient_arrow_stacks: number;
    frenzy_stacks: number;
    oak_bark_armor_stacks: number;
    block_stacks: number;
    melee_defense_stacks: number;
    projectile_defense_stacks: number;
    aoe_defense_stacks: number;
    vitality_stacks: number;
    cosmic_stacks: number;
    invigorate_stacks: number;
    arcane_stacks: number;
    ray_of_obliteration_grow_stacks: number;
    high_spirit_stacks: number;
    chrono_manamorphosis_stacks: number,
    chrono_armor_stacks: number,
    chrono_empower_stacks: number,
    chrono_speed_stacks: number,
    enemy_bleed_stacks: number;
    enemy_traumatized_stacks: number;
    arcane_flux_stacks: number;
    arcane_breach_collision_stacks: number;
    temporal_breach_collision_stacks: number;
    obliteration_breach_collision_stacks: number;
    elemental_weakness_stacks: number;
    high_voltage_stacks: number;
    enemy_splintered_stacks: number;
    revengeance_stacks: number;
    
    has_elemental_temper_buff: boolean;
    has_soul_bound_buff: boolean;
    has_burning_shadow_buff: boolean;
    has_elemental_fervor_buff: boolean;
    has_ancestral_fervor_buff: boolean;
    has_ancient_recognition_buff: boolean;
    has_assassin_haste_buff: boolean;
    has_smoke_screen_buff: boolean;
    has_ancestral_stab_slash_buff: boolean;
    has_banner_regeneration_buff: boolean;
    has_banner_haste_buff: boolean;
    has_enduring_protector_buff: boolean;
    has_speed_gate_buff: boolean;
    has_shadow_repercussion_buff: boolean;

    time_spend_channeling: number;
    hero_close_to_turret_syndrome: boolean;
    turret_syndrome_on_cooldown: boolean;
    projectile_passed_through_wall_of_omen: boolean;
*/

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
        nimble_champion_stacks: [Validators.max(200)]
    }

    public readonly ENEMY_CONFIG_GROUPS: Array<ConfigGroup> = [
        {
            title: 'Enemy',
            condition: () => true,
            configurations: [
                { type: 'number', key: 'enemy_percent_missing_health', label: 'Missing health (%)' },
                { type: 'number', key: 'distance_with_target', label: 'Distance with your hero (in yards)' },
                { type: 'boolean', key: 'target_is_close', label: 'Is close to you' },
                { type: 'boolean', key: 'target_is_isolated', label: 'Is isolated' },
                { type: 'boolean', key: 'target_has_broken_armor', label: 'Has broken armor' },
                { type: 'boolean', key: 'target_has_negative_effect', label: 'Has any negative effect' },
            ]
        },
        {
            title: 'Overdrive',
            condition: () => true,
            configurations: [
                { type: 'number', key: 'overdrive_bounces_left', label: 'How many bounce left' },
                { type: 'boolean', key: 'overdrive_last_bounce', label: 'Is it the last bounce' },
            ]
        },
        {
            title: 'Reaper (Adam Nostrus)',
            condition: character => character.reaper.id === 2,
            configurations: [
                { type: 'boolean', key: 'has_adam_blessing_buff', label: 'Do you have adam\'s blessing' },
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
                { type: 'number', key: 'has_manabender_buff', label: 'Is manabender (buff) active' },
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
            title: 'Gold Armor',
            condition: character => this.hasActivable(character, 0),
            configurations: [
                { type: 'boolean', key: 'has_gold_armor_buff', label: 'Is Gold Armor active' },
            ]
        },
    ];


    public readonly GENERAL_CONFIG_GROUPS: Array<ConfigGroup> = [
        {
            title: 'General',
            condition: () => true,
            configurations: [
                { type: 'number', key: 'all_characters_level', label: 'Sum of all your character\'s level' },
                { type: 'number', key: 'completed_achievements', label: 'Number of completed achievements' },
                { type: 'number', key: 'overall_reputation', label: 'Overall reputation' },
                { type: 'number', key: 'percent_missing_health', label: 'Missing life (%)', info: 'Total locked life will be used instead if higher' },
                { type: 'number', key: 'percent_missing_mana', label: 'Missing mana (%)', info: 'Total locked mana will be used instead if higher' },
                { type: 'number', key: 'controlled_minions', label: 'Minions under your control', info: 'Totems are not minions' },
                { type: 'number', key: 'totems_under_control', label: 'Totems under your control', info: 'Minions are not totems' },
                { type: 'boolean', key: 'idle', label: 'Are you idle ?' },
            ]
        },
        {
            title: 'When in Combat',
            condition: () => true,
            configurations: [
                { type: 'number', key: 'mana_lost_last_second', label: 'Mana lost last second' },
                { type: 'number', key: 'mana_gained_last_second', label: 'Mana gained last second' },
                { type: 'number', key: 'active_inner_fire', label: 'Actives inner fire' },
                { type: 'number', key: 'hits_taken_recently', label: 'Hits taken recently' },
                { type: 'number', key: 'skill_cast_recently', label: 'Skills cast recently' },
                { type: 'number', key: 'ennemies_in_radius', label: 'Ennemies close to you' },
                { type: 'number', key: 'ennemies_in_radius', label: 'Elites close to you' },
                { type: 'boolean', key: 'cast_support_before_next_cast', label: 'Did you cast a support skill recently' },
                { type: 'boolean', key: 'took_elemental_damage_recently', label: 'Did you take elemental damage recently' },
                { type: 'boolean', key: 'took_physical_damage_recently', label: 'Did you take physical damage recently' },
                { type: 'boolean', key: 'crit_recently', label: 'Did you deal a critical strike recently' },
                { type: 'boolean', key: 'dodge_recently', label: 'Did you dodge recently' },
            ]
        }
    ];

    public character: Character | null = null;

    public config: FormGroup | null = null;

    constructor(private plannerService: PlannerService) {
        super();
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }

    public ngOnInit() {
        this.config = this.generateConfigurationForm();

        this.config.valueChanges
            .subscribe(() => this.updateConfiguration())
    }

    private generateConfigurationForm() {
        let formData: { [key: string]: FormControl } = {};

        const configEntries = Object.entries(valueOrDefault(this.plannerService.getConfiguration(), DEFAULT_CONFIG));
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
        if (this.config !== null && this.config.valid) {
            this.plannerService.setConfiguration(this.config.value);
        }
    }

    public getControl(entry: ConfigEntry): FormControl | null {
        return this.config === null ? null : <FormControl>this.config.get(entry.key);
    }

    public isGroupValid(group: ConfigGroup): boolean {
        return this.character !== null && group.condition(this.character);
    }

    public hasActivable(character: Character, id: number): boolean {
        return [character.activable1, character.activable2, character.activable3, character.activable4]
            .filter(isNotNullOrUndefined)
            .some(activable => !('element' in activable) && activable.id === id);
    }
}
