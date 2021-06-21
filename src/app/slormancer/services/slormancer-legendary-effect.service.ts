import { Injectable } from '@angular/core';

import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { GameAffix } from '../model/game/game-item';
import { LegendaryEffect } from '../model/legendary-effect';
import { LegendaryEffectValue } from '../model/legendary-effect-value';
import { list } from '../util/math.util';
import { strictParseFloat, toFloatArray } from '../util/parse.util';
import { valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerSkillService } from './slormancer-skill.service';
import { SlormancerTemplateService } from './slormancer-template.service';


@Injectable()
export class SlormancerLegendaryEffectService {

    constructor(private slormancerDataService: SlormancerDataService,
                private slormanderItemValueService: SlormancerItemValueService,
                private slormanderSkillService: SlormancerSkillService,
                private slormancerTemplateService: SlormancerTemplateService
                ) { }

    private applyEffectOverride(effect: LegendaryEffect, legendaryId: number): LegendaryEffect {
        const data = this.slormancerDataService.getDataLegendary(legendaryId);

        if (data !== null) {
            effect.values = effect.values.map((value, index) => ({ ...value, ...data.statsOverride[index] }));
            effect.constants = data.constants;
        }

        return effect;
    }

    private getValues(gameData: GameDataLegendary, reinforcment: number): Array<LegendaryEffectValue> {
        const ranges = gameData.RANGE.length === 0 ? [] : gameData.RANGE.split('|').map(v => v.length === 0 ? '0' : v ).map(strictParseFloat);
        const stats = gameData.STAT.length === 0 ? [] : gameData.STAT.split('|').map(stat => stat === 'chance' ? '' : stat);
        const types = gameData.TYPE.length === 0 ? [] : gameData.TYPE.split('|');
        const upgradables = gameData.UPGRADABLE.length === 0 ? [] : gameData.UPGRADABLE.split('|').map(v => v.length === 0 ? '0' : v ).map(strictParseFloat);
        const values = gameData.VALUE.length === 0 ? [] : toFloatArray(gameData.VALUE, '|');

        const nb = Math.max(stats.length, types.length, values.length);

        const effectValues: Array<LegendaryEffectValue> = [];
        for (let i of list(0, nb - 1)) {
            const range = ranges[i] ? <number>ranges[i] : 0;
            const stat = gameData.STAT_ONLY === true && stats[i] ? <string>stats[i] : null;
            const type = types[i] ? <string>types[i] : null;
            const upgrade = upgradables[i] ? <number>upgradables[i] : 0;
            const value = values[i] ? <number>values[i] : 0;
            const totalUpgrade = reinforcment * upgrade;

            const computedValue = value;

            effectValues.push({
                values: range === 1 ? this.slormanderItemValueService.getLegendaryAffixValues(computedValue, totalUpgrade) : null,
                constant: range === 0 ? computedValue : null,
                synergyValue: type !== null && type !== '%' ? 0 : null,
                type,
                stat,
            });
        }

        return effectValues;
    }

    private getIcon(hero: number, skill: string): string | null {
        let heroValue: string | null = null;

        if (hero === 0) {
            heroValue = 'knight';
        } else if (hero === 1) {
            heroValue = 'huntress';
        } else if (hero === 2) {
            heroValue = 'mage';
        } else if (hero === 99) {
            heroValue = 'ancestral';
        }

        const skills = skill.length > 0 ? valueOrNull(skill.split('|')) : null;
        const skillValue = skills !== null ? valueOrNull(skills[skills.length - 1]) : null;

        return (heroValue !== null && skillValue !== null) ? heroValue + '_' + skillValue : null;
    }

    public getExtendedLegendaryEffect(affix: GameAffix, reinforcment: number): LegendaryEffect | null {
        const gameData = this.slormancerDataService.getGameDataLegendary(affix.type);
        let legendaryEffect: LegendaryEffect | null = null;

        if (gameData !== null) {
            const activable = this.slormancerDataService.getlegendaryGameDataActivableBasedOn(gameData.REF);
            const values = this.getValues(gameData, reinforcment);
            
            legendaryEffect = {
                description: this.slormancerTemplateService.getLegendaryDescriptionTemplate(gameData),
                value: affix.value,
                constants: [],
                values,
                activable: activable !== null ? this.slormanderSkillService.getActivable(activable, reinforcment) : null,
                onlyStat: gameData.STAT_ONLY === true,
                icon: this.getIcon(gameData.HERO, gameData.SKILL),
            }

            legendaryEffect = this.applyEffectOverride(legendaryEffect, gameData.REF)
        }

        return legendaryEffect;
    }
}