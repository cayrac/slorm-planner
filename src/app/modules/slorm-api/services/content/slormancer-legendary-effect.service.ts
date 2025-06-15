import { Injectable } from '@angular/core';

import { MAX_REINFORCEMENT_UPGRADE } from '../../constants';
import { CraftableEffect } from '../../model/content/craftable-effect';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { HeroClass } from '../../model/content/enum/hero-class';
import { GameDataLegendary } from '../../model/content/game/data/game-data-legendary';
import { LegendaryEffect } from '../../model/content/legendary-effect';
import { GameAffix } from '../../model/parser/game/game-item';
import { effectValueSynergy, effectValueVariable } from '../../util/effect-value.util';
import { list } from '../../util/math.util';
import { strictParseInt } from '../../util/parse.util';
import {
    emptyStringToNull,
    getBaseCraftValue,
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
import { SlormancerReaperService } from './slormancer-reaper.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';


@Injectable()
export class SlormancerLegendaryEffectService {

    private readonly LEGENDARY_TITLE: string;

    constructor(private slormancerDataService: SlormancerDataService,
                private slormanderActivableService: SlormancerActivableService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerItemValueService: SlormancerItemValueService,
                private slormancerReaperService: SlormancerReaperService
    ) {
        this.LEGENDARY_TITLE = this.slormancerTranslateService.translate('tt_l_roll');
    }

    public parseLegendaryEffectValue(type: string | null, score: number, upgrade: number, range: boolean, stat: string | null, craftedValue: number): CraftableEffect {
        let effect: AbstractEffectValue;
        
        if (type === null || type === '%') {
            effect = effectValueVariable(0, upgrade, EffectValueUpgradeType.Reinforcement, type === '%', stat);
        } else {
            const typeValues = splitData(type, ':');
            const source = <string>typeValues[1];
            effect = effectValueSynergy(0, upgrade, EffectValueUpgradeType.Reinforcement, type === '%', source, stat);
        }

        return {
            score,
            craftedValue: range ? craftedValue : 100,
            possibleCraftedValues: [],
            basePossibleCraftedValues: [],
            maxPossibleCraftedValue: 100,
            minPossibleCraftedValue: range ? 75 : 100,
            effect,
        };
    }

    private applyEffectOverride(effect: LegendaryEffect, legendaryId: number): LegendaryEffect {
        const data = this.slormancerDataService.getDataLegendary(legendaryId);

        if (data !== null) {
            data.override(effect);
        }

        return effect;
    }

    private getEffectValues(gameData: GameDataLegendary, craftedValue: number): Array<CraftableEffect> {
        const ranges = splitFloatData(gameData.RANGE);
        const types = emptyStringToNull(splitData(gameData.TYPE));
        const stats = emptyStringToNull(splitData(gameData.STAT));
        const upgrades = splitFloatData(gameData.UPGRADABLE);
        const values = splitFloatData(gameData.VALUE);

        const nb = Math.max(types.length, values.length);

        const result: Array<CraftableEffect> = [];
        for (let i of list(nb)) {
            const stat = valueOrNull(stats[i]);
            const type = valueOrNull(types[i]);
            const value = valueOrDefault(values[i], 0);
            const upgrade = valueOrDefault(upgrades[i], 0);
            const range = ranges[i] === 1;
            result.push(this.parseLegendaryEffectValue(type, value, upgrade, range, stat, craftedValue));
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

    public getLegendaryEffectById(id: number, value: number, reinforcement: number, heroClass: HeroClass): LegendaryEffect | null {
        const gameData = this.slormancerDataService.getGameDataLegendary(id);
        let legendaryEffect: LegendaryEffect | null = null;

        if (gameData !== null) {
            const base = this.slormancerDataService.getBaseFromLegendaryId(gameData.REF);

            let reaperName: string | null = null;
            if (gameData.HERO === 999) {
                const reaper = this.slormancerDataService.getGameDataReaper(parseInt(gameData.SKILL));
                if (reaper !== null) {
                    reaperName = this.slormancerReaperService.getReaperName(reaper.LOCAL_NAME, false, heroClass);
                }
            }
            
            legendaryEffect = {
                id: gameData.REF,
                name: gameData.LOCAL_NAME,
                classSpecific: [0, 1, 2].includes(gameData.HERO) ? gameData.HERO as HeroClass : null,
                reinforcement,
                itemIcon: 'assets/img/icon/item/' + gameData.ITEM + '/' + base + '.png',
                value,
                activable: this.slormanderActivableService.getLegendaryActivable(gameData.REF, heroClass),
                onlyStat: gameData.STAT_ONLY === true,
                skillIcon: this.getIcon(gameData.HERO, gameData.SKILL),
                effects: this.getEffectValues(gameData, value),
                reaperName,
                title: this.LEGENDARY_TITLE,
                description: '',
                template: this.slormancerTemplateService.getLegendaryDescriptionTemplate(gameData),
            }

            legendaryEffect = this.applyEffectOverride(legendaryEffect, gameData.REF);

            this.updateLegendaryEffectModel(legendaryEffect);
            this.updateLegendaryEffectView(legendaryEffect);
        }

        return legendaryEffect;
    }

    public getLegendaryEffect(affix: GameAffix, reinforcement: number, heroClass: HeroClass): LegendaryEffect | null {
        return this.getLegendaryEffectById(affix.type, affix.value, reinforcement, heroClass);
    } 
    
    public updateLegendaryEffectModel(legendaryEffect: LegendaryEffect) {
        for (const craftedEffect of legendaryEffect.effects) {
            if (isEffectValueVariable(craftedEffect.effect) || isEffectValueSynergy(craftedEffect.effect)) {
                craftedEffect.craftedValue = Math.min(craftedEffect.maxPossibleCraftedValue, Math.max(craftedEffect.minPossibleCraftedValue, legendaryEffect.value));
                const upgrade = 100 * craftedEffect.effect.upgrade * Math.min(MAX_REINFORCEMENT_UPGRADE, legendaryEffect.reinforcement) / 100;
                
                if (craftedEffect.effect.upgrade === 0 && craftedEffect.minPossibleCraftedValue === 100 && craftedEffect.maxPossibleCraftedValue === 100) {
                    craftedEffect.possibleCraftedValues = [
                        { craft: 100, value: craftedEffect.score }
                    ];
                    craftedEffect.basePossibleCraftedValues = [
                        { craft: 100, value: craftedEffect.score }
                    ];
                } else {
                    const precision = craftedEffect.score === 2.5 || craftedEffect.score === 0.6;
                    craftedEffect.basePossibleCraftedValues = this.slormancerItemValueService.computeEffectRange(
                        craftedEffect.score,
                        craftedEffect.minPossibleCraftedValue,
                        craftedEffect.maxPossibleCraftedValue,
                        0,
                        precision);
                    craftedEffect.possibleCraftedValues = this.slormancerItemValueService.computeEffectRange(
                        craftedEffect.score,
                        craftedEffect.minPossibleCraftedValue,
                        craftedEffect.maxPossibleCraftedValue,
                        upgrade,
                        precision);
                }

                craftedEffect.effect.baseValue = getBaseCraftValue(craftedEffect, craftedEffect.craftedValue);
                craftedEffect.effect.value = getCraftValue(craftedEffect, craftedEffect.craftedValue);
                craftedEffect.effect.displayValue = craftedEffect.effect.value;
            }
        }

        if (legendaryEffect.activable !== null) {
            legendaryEffect.activable.level = Math.min(MAX_REINFORCEMENT_UPGRADE, legendaryEffect.reinforcement);
            this.slormanderActivableService.updateActivableModel(legendaryEffect.activable);
        }
    }

    public updateLegendaryEffectView(legendaryEffect: LegendaryEffect) {
        legendaryEffect.description = this.slormancerTemplateService.formatLegendaryDescription(legendaryEffect.template, legendaryEffect.effects);

        if (legendaryEffect.activable !== null) {
            this.slormanderActivableService.updateActivableView(legendaryEffect.activable);
        }
    } 

    public getLegendaryEffectClone(legendaryEffect: LegendaryEffect): LegendaryEffect { 
        return {
            ...legendaryEffect,
            activable: legendaryEffect.activable === null ? null : this.slormanderActivableService.getActivableClone(legendaryEffect.activable),
            effects: legendaryEffect.effects
                .map(craftedEffect => ({ ...craftedEffect, effect: { ...craftedEffect.effect } }))
        }
    }
}