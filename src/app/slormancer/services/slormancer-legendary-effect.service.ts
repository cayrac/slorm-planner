import { Injectable } from '@angular/core';

import { ExtendedLegendaryEffect } from '../model/extended-legendary-effect';
import { ExtendedLegendaryEffectValue } from '../model/extended-legendary-effect-value';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { GameAffix } from '../model/game/game-item';
import { list } from '../util/math.util';
import { parseIntOrdefault, strictParseFloat, toFloatArray } from '../util/parse.util';
import { SlormancerGameDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerTemplateService } from './slormancer-template.service';


@Injectable()
export class SlormancerLegendaryEffectService {

    constructor(private slormancerDataService: SlormancerGameDataService,
                private slormanderItemValueService: SlormancerItemValueService,
                private slormancerTemplateService: SlormancerTemplateService
                ) { }

    private applyEffectOverride(effect: ExtendedLegendaryEffect, legendaryId: number): ExtendedLegendaryEffect {
        const data = this.slormancerDataService.getLegendaryData(legendaryId);

        if (data !== null) {
            effect.values = effect.values.map((value, index) => ({ ...value, ...data.statsOverride[index] }));
            effect.constants = data.constants;
        }

        return effect;
    }

    private getValues(gameData: GameDataLegendary, reinforcment: number): Array<ExtendedLegendaryEffectValue> {
        const ranges = gameData.RANGE.length === 0 ? [] : gameData.RANGE.split('|').map(v => v.length === 0 ? '0' : v ).map(strictParseFloat);
        const stats = gameData.STAT.length === 0 ? [] : gameData.STAT.split('|').map(stat => stat === 'chance' ? '' : stat);
        const types = gameData.TYPE.length === 0 ? [] : gameData.TYPE.split('|');
        const upgradables = gameData.UPGRADABLE.length === 0 ? [] : gameData.UPGRADABLE.split('|').map(v => v.length === 0 ? '0' : v ).map(strictParseFloat);
        const values = gameData.VALUE.length === 0 ? [] : toFloatArray(gameData.VALUE, '|');

        const nb = Math.max(stats.length, types.length, values.length);

        const effectValues: Array<ExtendedLegendaryEffectValue> = [];
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

    public getExtendedLegendaryEffect(affix: GameAffix, reinforcment: number): ExtendedLegendaryEffect | null {
        const gameData = this.slormancerDataService.getGameLegendaryData(affix.type);
        let legendaryEffect: ExtendedLegendaryEffect | null = null;

        if (gameData !== null) {

            const values = this.getValues(gameData, reinforcment);
            
            legendaryEffect = {
                description: this.slormancerTemplateService.getLegendaryDescriptionTemplate(gameData),
                value: affix.value,
                constants: [],
                values,
                skill: null,
                onlyStat: gameData.STAT_ONLY === true,
                icon: parseIntOrdefault(gameData.SKILL, null),
            }

            legendaryEffect = this.applyEffectOverride(legendaryEffect, gameData.REF)
        }

        return legendaryEffect;
    }
}