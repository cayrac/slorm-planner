import { Injectable } from '@angular/core';

import { CraftableEffect } from '../model/craftable-effect';
import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { GameAffix } from '../model/game/game-item';
import { LegendaryEffect } from '../model/legendary-effect';
import { list } from '../util/math.util';
import { strictParseInt } from '../util/parse.util';
import {
    emptyStringToNull,
    isEffectValueSynergy,
    isEffectValueVariable,
    splitData,
    splitFloatData,
    valueOrDefault,
    valueOrNull,
} from '../util/utils';
import { SlormancerActivableService } from './slormancer-activable.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerTemplateService } from './slormancer-template.service';


@Injectable()
export class SlormancerLegendaryEffectService {

    private readonly LEGENDARY_TITLE = this.slormancerTemplateService.translate('tt_l_roll');

    constructor(private slormancerDataService: SlormancerDataService,
                private slormanderSkillService: SlormancerActivableService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerItemValueService: SlormancerItemValueService
                ) { }

    public parseLegendaryEffectValue(type: string | null, score: number, upgrade: number, range: boolean, craftedValue: number): CraftableEffect {
        let effect: AbstractEffectValue;
        
        if (type === null || type === '%') {
            effect = {
                type: EffectValueType.Variable,
                value: 0,
                upgrade,
                upgradeType: EffectValueUpgradeType.Reinforcment,
                percent: type === '%',
                range: false,
                valueType: EffectValueValueType.Unknown,
                stat: null
            } as EffectValueVariable;
        } else {
            const typeValues = splitData(type, ':');
            const source = valueOrNull(typeValues[1]);

            effect = {
                type: EffectValueType.Synergy,
                value: 0,
                synergy: 0,
                upgrade,
                upgradeType: EffectValueUpgradeType.Reinforcment,
                percent: type === '%',
                source,
                range: false,
                valueType: EffectValueValueType.Unknown,
                stat: null
            } as EffectValueSynergy;
        }

        return {
            score,
            craftedValue: range ? craftedValue : 100,
            possibleCraftedValues: {},
            maxPossibleCraftedValue: 100,
            minPossibleCraftedValue: range ? 75 : 100,
            effect,
        };
    }

    private applyEffectOverride(effect: LegendaryEffect, legendaryId: number): LegendaryEffect {
        const data = this.slormancerDataService.getDataLegendary(legendaryId);

        if (data !== null) {
            for (const constant of data.constants) {
                effect.effects.push({
                    score: constant,
                    craftedValue: 0,
                    possibleCraftedValues: { 0: constant },
                    maxPossibleCraftedValue: 0,
                    minPossibleCraftedValue: 0,
                    effect: {
                        type: EffectValueType.Constant,
                        value: constant,
                        percent: false
                    } as EffectValueConstant
             });
            }
        }

        return effect;
    }

    private getEffectValues(gameData: GameDataLegendary, craftedValue: number): Array<CraftableEffect> {
        const ranges = splitFloatData(gameData.RANGE);
        const types = emptyStringToNull(splitData(gameData.TYPE));
        const upgrades = splitFloatData(gameData.UPGRADABLE);
        const values = splitFloatData(gameData.VALUE);

        const nb = Math.max(types.length, values.length);

        const result: Array<CraftableEffect> = [];
        for (let i of list(nb)) {
            const type = valueOrNull(types[i]);
            const maxValue = valueOrDefault(values[i], 0);
            const upgrade = valueOrDefault(upgrades[i], 0);
            const range = ranges[i] === 1;
            result.push(this.parseLegendaryEffectValue(type, maxValue, upgrade, range, craftedValue));
        }
        
        return result;
    }

    private getIcon(hero: number, skill: string): string | null {
        let icon: string | null = null;

        
        if (hero !== -1) {
            let skillValue: number | null = null;

            const skills = skill.length > 0 ? valueOrNull(skill.split('|')) : null;
            if (skills !== null) {
                skillValue = strictParseInt(<string>skills[skills.length - 1]);
            }
    
            if (skillValue !== null) {
                if (hero === 99) {
                    icon = 'legacy/' + skillValue;
                } else {
                    icon = 'skill/' + hero + '/' + skillValue;
                }
            }
        }


        return icon;
    }

    public getExtendedLegendaryEffect(affix: GameAffix, reinforcment: number): LegendaryEffect | null {
        const gameData = this.slormancerDataService.getGameDataLegendary(affix.type);
        let legendaryEffect: LegendaryEffect | null = null;

        if (gameData !== null) {
            const activable = this.slormancerDataService.getGameDataLegendaryActivableBasedOn(gameData.REF);
            const base = this.slormancerDataService.getBaseFromLegendaryId(gameData.REF);
            
            legendaryEffect = {
                id: gameData.REF,
                name: gameData.EN_NAME,
                reinforcment,
                itemIcon: 'item/' + gameData.ITEM + '/' + base,
                value: affix.value,
                activable: activable !== null ? this.slormanderSkillService.getActivable(activable) : null,
                onlyStat: gameData.STAT_ONLY === true,
                skillIcon: this.getIcon(gameData.HERO, gameData.SKILL),
                effects: this.getEffectValues(gameData, affix.value),
                
                title: this.LEGENDARY_TITLE,
                description: '',
                template: this.slormancerTemplateService.getLegendaryDescriptionTemplate(gameData),
            }

            legendaryEffect = this.applyEffectOverride(legendaryEffect, gameData.REF);

            this.updateLegendaryEffect(legendaryEffect);
        }

        return legendaryEffect;
    }

    public updateLegendaryEffect(legendaryEffect: LegendaryEffect) {
        for (const craftedEffect of legendaryEffect.effects) {
            if (isEffectValueVariable(craftedEffect.effect) || isEffectValueSynergy(craftedEffect.effect)) {
                const upgrade = 100 * craftedEffect.effect.upgrade * legendaryEffect.reinforcment / 100;
                craftedEffect.possibleCraftedValues = this.slormancerItemValueService.computeEffectRange(
                    craftedEffect.score,
                    craftedEffect.minPossibleCraftedValue,
                    craftedEffect.maxPossibleCraftedValue,
                    upgrade);
                craftedEffect.effect.value = valueOrDefault(craftedEffect.possibleCraftedValues[craftedEffect.craftedValue], 0);
            }
        }

        legendaryEffect.description = this.slormancerTemplateService.formatLegendaryDescription(legendaryEffect.template, legendaryEffect.effects);
    }
}