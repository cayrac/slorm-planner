import { Injectable } from '@angular/core';

import { CraftableEffect } from '../../model/content/craftable-effect';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { HeroClass } from '../../model/content/enum/hero-class';
import { GameDataLegendary } from '../../model/content/game/data/game-data-legendary';
import { LegendaryEffect } from '../../model/content/legendary-effect';
import { GameAffix } from '../../model/parser/game/game-item';
import { effectValueConstant, effectValueSynergy, effectValueVariable } from '../../util/effect-value.util';
import { list } from '../../util/math.util';
import { strictParseInt } from '../../util/parse.util';
import {
    emptyStringToNull,
    getCraftValue,
    isEffectValueSynergy,
    isEffectValueVariable,
    splitData,
    splitFloatData,
    valueOrDefault,
    valueOrNull,
} from '../../util/utils';
import { SlormancerActivableService } from './slormancer-activable.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';


@Injectable()
export class SlormancerLegendaryEffectService {

    private readonly LEGENDARY_TITLE = this.slormancerTranslateService.translate('tt_l_roll');

    constructor(private slormancerDataService: SlormancerDataService,
                private slormanderActivableService: SlormancerActivableService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerItemValueService: SlormancerItemValueService
                ) { }

    public parseLegendaryEffectValue(type: string | null, score: number, upgrade: number, range: boolean, craftedValue: number): CraftableEffect {
        let effect: AbstractEffectValue;
        
        if (type === null || type === '%') {
            effect = effectValueVariable(0, upgrade, EffectValueUpgradeType.Reinforcment, type === '%');
        } else {
            const typeValues = splitData(type, ':');
            const source = <string>typeValues[1];
            effect = effectValueSynergy(0, upgrade, EffectValueUpgradeType.Reinforcment, type === '%', source);
        }

        return {
            score,
            craftedValue: range ? craftedValue : 100,
            possibleCraftedValues: [],
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
                    possibleCraftedValues: [],
                    maxPossibleCraftedValue: 0,
                    minPossibleCraftedValue: 0,
                    effect: effectValueConstant(constant, false, null)
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
                    icon = 'assets/img/icon/legacy/' + skillValue + '.png';
                } else {
                    icon = 'assets/img/icon/skill/' + hero + '/' + skillValue + '.png';
                }
            }
        }


        return icon;
    }

    public getLegendaryEffectById(id: number, value: number, reinforcment: number, heroClass: HeroClass): LegendaryEffect | null {
        const gameData = this.slormancerDataService.getGameDataLegendary(id);
        let legendaryEffect: LegendaryEffect | null = null;

        if (gameData !== null) {
            const base = this.slormancerDataService.getBaseFromLegendaryId(gameData.REF);
            
            legendaryEffect = {
                id: gameData.REF,
                name: gameData.EN_NAME,
                reinforcment,
                itemIcon: 'assets/img/icon/item/' + gameData.ITEM + '/' + base + '.png',
                value,
                activable: this.slormanderActivableService.getLegendaryActivable(gameData.REF, heroClass),
                onlyStat: gameData.STAT_ONLY === true,
                skillIcon: this.getIcon(gameData.HERO, gameData.SKILL),
                effects: this.getEffectValues(gameData, value),
                
                title: this.LEGENDARY_TITLE,
                description: '',
                template: this.slormancerTemplateService.getLegendaryDescriptionTemplate(gameData),
            }

            legendaryEffect = this.applyEffectOverride(legendaryEffect, gameData.REF);

            this.updateLegendaryEffect(legendaryEffect);
        }

        return legendaryEffect;
    }

    public getLegendaryEffect(affix: GameAffix, reinforcment: number, heroClass: HeroClass): LegendaryEffect | null {
        return this.getLegendaryEffectById(affix.type, affix.value, reinforcment, heroClass);
    }

    public updateLegendaryEffect(legendaryEffect: LegendaryEffect) {
        for (const craftedEffect of legendaryEffect.effects) {
            if (isEffectValueVariable(craftedEffect.effect) || isEffectValueSynergy(craftedEffect.effect)) {
                craftedEffect.craftedValue = Math.min(craftedEffect.maxPossibleCraftedValue, Math.max(craftedEffect.minPossibleCraftedValue, legendaryEffect.value));
                const upgrade = 100 * craftedEffect.effect.upgrade * legendaryEffect.reinforcment / 100;
                craftedEffect.possibleCraftedValues = this.slormancerItemValueService.computeEffectRange(
                    craftedEffect.score,
                    craftedEffect.minPossibleCraftedValue,
                    craftedEffect.maxPossibleCraftedValue,
                    upgrade);
                
                craftedEffect.effect.value = getCraftValue(craftedEffect, craftedEffect.craftedValue);
            }
        }

        legendaryEffect.description = this.slormancerTemplateService.formatLegendaryDescription(legendaryEffect.template, legendaryEffect.effects);

        if (legendaryEffect.activable !== null) {
            this.slormanderActivableService.updateActivable(legendaryEffect.activable);
        }
    }

    public getLegendaryEffectClone(legendaryEffect: LegendaryEffect): LegendaryEffect { 
        return {
            ...legendaryEffect,
            effects: legendaryEffect.effects
                .map(craftedEffect => ({ ...craftedEffect, effect: { ...craftedEffect.effect } }))
        }
    }
}