import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { CharacterStat, CharacterStats } from '../../../slormancer/model/content/character-stats';
import { MinMax } from '../../../slormancer/model/minmax';
import { SlormancerTranslateService } from '../../../slormancer/services/content/slormancer-translate.service';

interface StatFormat {
    name: string;
    stat: string;
    sign: boolean;
    suffix: string;
}

interface SectionFormat {
    section: string;
    stats: Array<StatFormat>;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly SECTIONS: Array<SectionFormat> = [
        {
            section: this.slormancerTranslateService.translate('cat_adventure'),
            stats: [
                { name: this.slormancerTranslateService.translate('essence_find'), stat: 'essence_find', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('xp_find'), stat: 'xp_find', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('influence_gain'), stat: 'influence_gain', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('mf_find'), stat: 'mf_find', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('mf_qual'), stat: 'mf_qual', sign: true, suffix: '%' }
            ]
        },
        {
            section: this.slormancerTranslateService.translate('cat_health'),
            stats: [
                { name: this.slormancerTranslateService.translate('max_health'), stat: 'max_health', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('health_regeneration'), stat: 'health_regeneration', sign: true, suffix: '' },
                { name: this.slormancerTranslateService.translate('health_leech_percent'), stat: 'health_leech_percent', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('life_on_hit'), stat: 'life_on_hit', sign: true, suffix: '' },
                { name: this.slormancerTranslateService.translate('life_on_kill'), stat: 'life_on_kill', sign: true, suffix: '' }
            ]
        },
        {
            section: this.slormancerTranslateService.translate('cat_mana'),
            stats: [
                { name: this.slormancerTranslateService.translate('max_mana'), stat: 'max_mana', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('mana_regeneration'), stat: 'mana_regeneration', sign: true, suffix: '' },
                { name: this.slormancerTranslateService.translate('mana_leech_percent'), stat: 'mana_leech_percent', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('mana_on_hit'), stat: 'mana_on_hit', sign: true, suffix: '' },
                { name: this.slormancerTranslateService.translate('mana_on_kill'), stat: 'mana_on_kill', sign: true, suffix: '' }
            ]
        },
        {
            section: this.slormancerTranslateService.translate('cat_movement'),
            stats: [
                { name: this.slormancerTranslateService.translate('the_speed_percent'), stat: 'the_speed_percent', sign: false, suffix: '' }
            ]
        },
        {
            section: this.slormancerTranslateService.translate('cat_attack'),
            stats: [
                { name: this.slormancerTranslateService.translate('attack_speed'), stat: 'attack_speed', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('basic_damage'), stat: 'basic_damage', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('weapon_damage'), stat: 'weapon_damage', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('physical_damage'), stat: 'physical_damage', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('elemental_damage'), stat: 'elemental_damage', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('critical_chance'), stat: 'critical_chance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('critical_damage'), stat: 'critical_damage', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('ancestral_chance'), stat: 'ancestral_chance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('ancestral_damage'), stat: 'ancestral_damage', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('armor_penetration'), stat: 'armor_penetration', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('elemental_penetration'), stat: 'elemental_penetration', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('dot_increased_damage'), stat: 'dot_increased_damage', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('increased_on_elite'), stat: 'increased_on_elite', sign: false, suffix: '%' },
            ]
        },
        {
            section: this.slormancerTranslateService.translate('cat_defense'),
            stats: [
                { name: this.slormancerTranslateService.translate('armor'), stat: 'armor', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('elemental_resist'), stat: 'elemental_resist', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('fire_resistance'), stat: 'fire_resistance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('ice_resistance'), stat: 'ice_resistance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('lightning_resistance'), stat: 'lightning_resistance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('light_resistance'), stat: 'light_resistance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('shadow_resistance'), stat: 'shadow_resistance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('dodge'), stat: 'dodge', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('thorns'), stat: 'thorns', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('retaliate'), stat: 'retaliate', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('tenacity'), stat: 'tenacity', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('reduced_on_all'), stat: 'reduced_on_all', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('reduced_by_elite'), stat: 'reduced_by_elite', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('reduced_on_melee'), stat: 'reduced_on_melee', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('reduced_on_projectile'), stat: 'reduced_on_projectile', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('reduced_on_area'), stat: 'reduced_on_area', sign: false, suffix: '%' },
            ]
        },
        {
            section: this.slormancerTranslateService.translate('cat_secondary_resources'),
            stats: [
                { name: this.slormancerTranslateService.translate('gold_find'), stat: 'gold_find', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('scrap_find'), stat: 'scrap_find', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('slormite_find'), stat: 'slormite_find', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('slormeline_find'), stat: 'slormeline_find', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('reaper_find'), stat: 'reaper_find', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('skill_mastery_gain'), stat: 'skill_mastery_gain', sign: true, suffix: '%' },
            ]
        },
        {
            section: this.slormancerTranslateService.translate('cat_secondary_melee'),
            stats: [
                { name: this.slormancerTranslateService.translate('inner_fire_chance'), stat: 'inner_fire_chance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('inner_fire_max_number'), stat: 'inner_fire_max_number', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('inner_fire_duration'), stat: 'inner_fire_duration', sign: false, suffix: 's' },
                { name: this.slormancerTranslateService.translate('inner_fire_damage'), stat: 'inner_fire_damage', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('overdrive_chance'), stat: 'overdrive_chance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('overdrive_bounce_number'), stat: 'overdrive_bounce_number', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('overdrive_damage'), stat: 'overdrive_damage', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('recast_chance'), stat: 'recast_chance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('knockback_melee'), stat: 'knockback_melee', sign: false, suffix: '%' },
            ]
        },
        {
            section: this.slormancerTranslateService.translate('cat_secondary_projectile'),
            stats: [
                { name: this.slormancerTranslateService.translate('additional_projectile'), stat: 'additional_projectile', sign: true, suffix: '' },
                { name: this.slormancerTranslateService.translate('chance_to_pierce'), stat: 'chance_to_pierce', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('fork_chance'), stat: 'fork_chance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('chance_to_rebound'), stat: 'chance_to_rebound', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('projectile_speed'), stat: 'projectile_speed', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('knockback_projectile'), stat: 'knockback_projectile', sign: false, suffix: '%' },
            ]
        },
        {
            section: this.slormancerTranslateService.translate('cat_secondary_aoe'),
            stats: [
                { name: this.slormancerTranslateService.translate('aoe_increased_size'), stat: 'aoe_increased_size', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('aoe_increased_effect'), stat: 'aoe_increased_effect', sign: false, suffix: '%' },
            ]
        },
        {
            section: this.slormancerTranslateService.translate('cat_secondary_extras'),
            stats: [
                { name: this.slormancerTranslateService.translate('totem_increased_effect'), stat: 'totem_increased_effect', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('aura_increased_effect'), stat: 'aura_increased_effect', sign: true, suffix: '%' },
                { name: this.slormancerTranslateService.translate('minion_increased_damage'), stat: 'minion_increased_damage', sign: true, suffix: '%' },
            ]
        },
    ];

    public stats: CharacterStats | null = null;

    constructor(private plannerService: PlannerService,
                private slormancerTranslateService: SlormancerTranslateService) {
        super();
        // TODO synergy 
        // TODO conditions
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => {
                this.stats = character === null ? null : character.stats;
            });
    }

    private valueToString(value: number | MinMax, sign: boolean, suffix: string): string {
        let result: string;

        if (typeof value === 'number') {
            result = (value < 0 ? '-' : (sign ? '+' : '')) + value + suffix;
        } else {
            result = (value.min < 0 ? '-' : (sign ? '+' : '')) + value.min + suffix
             + ' - ' + (value.max < 0 ? '-' : (sign ? '+' : '')) + value.max + suffix;
        }

        return result;
    }

    public getValue(characterStats: Array<CharacterStat>, format: StatFormat): string {
        const found = characterStats.find(characterStat => characterStat.stat === format.stat);
        let result = '0';

        if (found) {
            result = this.valueToString(found.total, format.sign, format.suffix);
        }

        return result;
    }

    public getTooltip(characterStats: Array<CharacterStat>, format: StatFormat): string {
        const found = characterStats.find(characterStat => characterStat.stat === format.stat);
        let result = 'No details found';

        if (found) {
            result =  'Flat: ' + found.values.flat.map(v => this.valueToString(v, false, format.suffix)).join(', ') + '\n';
            result += 'Max: ' + found.values.max.map(v => this.valueToString(v, false, format.suffix)).join(', ') + '\n';
            result += 'Percent: ' + found.values.percent.map(v => this.valueToString(v, false, '%')).join(', ') + '\n';
            result += 'Multiplier: ' + found.values.multiplier.map(v => this.valueToString(v, false, '%')).join(', ');
        }

        return result;
    }

    public translate(key: string): string {
        return this.slormancerTranslateService.translate(key);
    }
}