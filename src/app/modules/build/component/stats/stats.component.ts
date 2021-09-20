import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../shared/services/planner.service';
import { CharacterStat, CharacterStats } from '../../../slormancer/model/content/character-stats';
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
                { name: this.slormancerTranslateService.translate('flat_physical_damage'), stat: 'flat_physical_damage', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('elemental_damage'), stat: 'elemental_damage', sign: false, suffix: '' },
                { name: this.slormancerTranslateService.translate('critical_chance'), stat: 'critical_chance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('critical_damage'), stat: 'critical_damage', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('ancestral_chance'), stat: 'ancestral_chance', sign: false, suffix: '%' },
                { name: this.slormancerTranslateService.translate('ancestral_damage'), stat: 'ancestral_damage', sign: false, suffix: '%' },
            ]
        },
    ];

    public stats: CharacterStats | null = null;

    constructor(private plannerService: PlannerService,
                private slormancerTranslateService: SlormancerTranslateService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => {
                this.stats = character === null ? null : character.stats;
            });
    }

    public getValue(characterStats: Array<CharacterStat>, stat: StatFormat): string {
        const found = characterStats.find(characterStat => characterStat.stat === stat.stat);
        let result = '0';

        if (found) {
            if (typeof found.total === 'number') {
                result = (found.total < 0 ? '-' : (stat.sign ? '+' : '')) + found.total + stat.suffix;
            } else {
                result = (found.total.min < 0 ? '-' : (stat.sign ? '+' : '')) + found.total.min + stat.suffix
                 + ' - ' + (found.total.max < 0 ? '-' : (stat.sign ? '+' : '')) + found.total.max + stat.suffix;
            }
        }

        return result;
    }

    public translate(key: string): string {
        return this.slormancerTranslateService.translate(key);
    }
}
