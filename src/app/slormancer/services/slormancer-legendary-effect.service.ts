import { Injectable } from '@angular/core';

import { AbstractEffectValue, EffectValueConstant } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { GameAffix } from '../model/game/game-item';
import { LegendaryEffect } from '../model/legendary-effect';
import { list } from '../util/math.util';
import { emptyStringToNull, splitData, splitFloatData, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerSkillService } from './slormancer-skill.service';
import { SlormancerTemplateService } from './slormancer-template.service';


@Injectable()
export class SlormancerLegendaryEffectService {

    constructor(private slormancerDataService: SlormancerDataService,
                private slormanderSkillService: SlormancerSkillService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerEffectValueService: SlormancerEffectValueService
                ) { }

    private applyEffectOverride(effect: LegendaryEffect, legendaryId: number): LegendaryEffect {
        const data = this.slormancerDataService.getDataLegendary(legendaryId);

        if (data !== null) {
            for (const constant of data.constants) {
                effect.values.push({
                    type: EffectValueType.Constant,
                    value: constant
                } as EffectValueConstant)
            }
        }

        return effect;
    }

    private getEffectValues(gameData: GameDataLegendary): Array<AbstractEffectValue> {
        const ranges = splitFloatData(gameData.RANGE);
        const types = emptyStringToNull(splitData(gameData.TYPE));
        const upgrades = splitFloatData(gameData.UPGRADABLE);
        const values = splitFloatData(gameData.VALUE);

        const nb = Math.max(types.length, values.length);

        const result: Array<AbstractEffectValue> = [];
        for (let i of list(nb)) {
            const type = valueOrNull(types[i]);
            const value = valueOrDefault(values[i], 0);
            const upgrade = valueOrDefault(upgrades[i], 0);
            const range = ranges[i] === 1;
            result.push(this.slormancerEffectValueService.parseLegendaryEffectValue(type, value, upgrade, range));
        }
        
        return result;
    }

    private getIcon(hero: number, skill: string): string | null {
        let heroValue: string | null = null;

        if (hero === 0) {
            heroValue = 'warrior';
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

    public getExtendedLegendaryEffect(affix: GameAffix): LegendaryEffect | null {
        const gameData = this.slormancerDataService.getGameDataLegendary(affix.type);
        let legendaryEffect: LegendaryEffect | null = null;

        if (gameData !== null) {
            const activable = this.slormancerDataService.getlegendaryGameDataActivableBasedOn(gameData.REF);
            
            legendaryEffect = {
                description: this.slormancerTemplateService.getLegendaryDescriptionTemplate(gameData),
                value: affix.value,
                activable: activable !== null ? this.slormanderSkillService.getActivable(activable) : null,
                onlyStat: gameData.STAT_ONLY === true,
                icon: this.getIcon(gameData.HERO, gameData.SKILL),
                values: this.getEffectValues(gameData)
            }

            legendaryEffect = this.applyEffectOverride(legendaryEffect, gameData.REF)
        }

        return legendaryEffect;
    }
}