import { Injectable } from '@angular/core';

import { Affix } from '../model/affix';
import { ComputedEffectValue } from '../model/computed-effect-value';
import { CraftableEffect } from '../model/craftable-effect';
import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { HeroClass } from '../model/enum/hero-class';
import { GameDataActivable } from '../model/game/data/game-data-activable';
import { GameDataAncestralLegacy } from '../model/game/data/game-data-ancestral-legacy';
import { GameDataAttribute } from '../model/game/data/game-data-attribute';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { GameDataSkill } from '../model/game/data/game-data-skill';
import { MinMax } from '../model/minmax';
import { strictParseInt } from '../util/parse.util';
import {
    findFirst,
    firstValue,
    isEffectValueConstant,
    isEffectValueSynergy,
    isEffectValueVariable,
    isNotNullOrUndefined,
    lastValue,
    splitData,
    valueOrNull,
} from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerReaperValueService } from './slormancer-reaper-value.service';

@Injectable()
export class SlormancerTemplateService {

    private readonly MAX_LABEL = this.translate('max');

    public readonly STAT_ANCHOR = '£';
    public readonly TYPE_ANCHOR = '$';
    public readonly VALUE_ANCHOR = '@';
    public readonly CONSTANT_ANCHORS = ['¤', '~', '§', '¥'];
    public readonly SYNERGY_ANCHOR = '_';
    public readonly MINMAX_ANCHOR = '_';
    public readonly SYNERGY_PREFIX = 'synergy:';
    public readonly DAMAGE_PREFIX = 'damage:';
    public readonly RETURN_REGEXP = /#/g;

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerItemValueService: SlormancerItemValueService,
                private slormancerReaperValueService: SlormancerReaperValueService) { }

    public asSpan(content: string, className: string): string {
        return '<span class="' + className + '">' + content + '</span>';
    }

    public replaceAnchor(template: string, value: number | string, anchor: string): string {
        return template.replace(anchor, value.toString());
    }

    private computeMax(value: AbstractEffectValue, percent: boolean): string {
        let result = '';

        let max: number | null = null;
        if (value.max) {
            max = value.max;
        } else if (isEffectValueVariable(value) && value.maxUpgrade) {
            max = this.slormancerItemValueService.computeEffectVariableDetails(value, 0, value.maxUpgrade).value;
        } else if (isEffectValueSynergy(value) && value.maxUpgrade) {
            max = this.slormancerItemValueService.computeEffectSynergyDetails(value, 0, value.maxUpgrade).value;
        }

        if (max !== null) {
            const sign = max > 0 ? '+' : '-';
            result = max ? this.asSpan(' (' + sign + Math.abs(max) + (percent ? '%' : '') + ' ' + this.MAX_LABEL + ')', 'max') : '';
        }

        return result;
    }

    private computedItemValueToFormula(computed: ComputedEffectValue, upgradeName: string = 'upgrade'): string {
        let formula: string | null = null;
        const percent = computed.percent ? '%' : '';

        if (computed.range !== null || computed.upgrade !== 0) {
            formula = '';
            if (computed.range !== null) {
                formula += firstValue(computed.range) + percent + ' - ' + lastValue(computed.range) + percent;
            }
            
            if (computed.upgrade !== 0) {
                if (computed.baseRange === null) {
                    formula += computed.baseFormulaUpgrade + percent;
                }

                const sign = computed.upgrade > 0 ? '+' : '-';

                if (computed.upgradeType === EffectValueUpgradeType.RanksAfterInThisTrait) {
                    formula = sign + Math.abs(computed.upgrade) + percent + ' for every point after this one in this Trait';
                } else {
                    formula += ' ' + sign + ' ' + Math.abs(computed.upgrade) + percent + (computed.upgradeType === EffectValueUpgradeType.Every3  ? ' every third ' + upgradeName + ' level' : ' per ' + upgradeName);
                }
            }
        }

        return formula === null ? '' : this.asSpan(' (' + formula + ')', 'formula');
    }

    private applyItemEffectValueVariable(template: string, baseValue: number, effectValue: EffectValueVariable, reinforcment: number, anchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectVariableDetails(effectValue, baseValue, reinforcment);
        const percent = computed.percent ? '%' : '';

        const value = this.asSpan(computed.value + percent, 'value')
        const formula = this.computedItemValueToFormula(computed);

        return this.replaceAnchor(template, value + formula, anchor);
    }

    private applySkillEffectValueVariable(template: string, baseValue: number, effectValue: EffectValueVariable, reinforcment: number, anchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectVariableDetails(effectValue, baseValue, reinforcment);
        const percent = computed.percent ? '%' : '';

        const value = this.asSpan(computed.value + percent, 'value')
        const formula = this.computedItemValueToFormula(computed, 'mastery');
        const max = this.computeMax(effectValue, computed.percent);

        return this.replaceAnchor(template, value + max + formula, anchor);
    }

    private computedReaperVariableToFormula(effect: EffectValueVariable): string {
        const formula = (effect.upgrade > 0 ? '+' : '') + effect.upgrade + ' per ' + this.translate('level');
        return formula === null ? '' : this.asSpan(' (' + formula + ')', 'details');
    }

    private computedReaperSynergyToFormula(effect: EffectValueSynergy): string {
        let formula = '';
        if (effect.upgrade !== 0) {
            formula = (effect.upgrade >= 0 ? '+' : '') + effect.upgrade + '% ' + this.translate(effect.source) + ' per ' + this.translate('level');
        } else {
            formula = effect.value + '% ' + this.translate(effect.source);
        }
        return formula === null ? '' : this.asSpan(' (' + formula + ')', 'details');
    }

    private applyReaperEffectValueVariable(template: string, effectValue: EffectValueVariable, level: number, nonPrimordialLevel: number, anchor: string): string {
        const computed = this.slormancerReaperValueService.computeEffectVariableValue(effectValue, level, nonPrimordialLevel);
        const percent = effectValue.percent ? '%' : '';

        let value = this.asSpan(computed.toString(), 'value') + percent;
        if (effectValue.upgrade !== 0) {
            value += this.computedReaperVariableToFormula(effectValue);
        }

        return this.replaceAnchor(template, value, anchor);
    }

    private applyReaperEffectValueSynergy(template: string, effectValue: EffectValueSynergy, anchor: string) {
        const computed = this.slormancerReaperValueService.computeEffectSynergyValue(effectValue);
        
        let value = this.asSpan(typeof computed === 'number' ? computed.toString() : computed.min + ' - ' + computed.max, 'value');
        if (effectValue.valueType === EffectValueValueType.Damage && typeof computed !== 'number') {
            value += this.computedReaperSynergyToFormula(effectValue);
        }
        
        return this.replaceAnchor(template, value, anchor);
    }

    private applyEffectValueConstant(template: string, value: EffectValueConstant, anchor: string): string {
        const percent = value.percent ? '%' : '';
        const max = this.computeMax(value, value.percent);
        return this.replaceAnchor(template, this.asSpan(value.value.toString(), 'value') + percent + max, anchor);
    }

    private applyEffectValueSynergyForActivable(template: string, baseValue: number, effectValue: EffectValueSynergy, reinforcment: number, valueAnchor: string,  synergyAnchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectSynergyDetails(effectValue, baseValue, reinforcment);
        const formula = this.computedItemValueToFormula(computed);

        if (computed.synergy !== null) {
            let synergy: string | null = null;

            if (typeof computed.synergy === 'number') {
                synergy = this.asSpan(computed.synergy.toString(), 'value');
                template = this.replaceAnchor(template, synergy, valueAnchor);
                template = this.replaceAnchor(template, this.asSpan(computed.value + '%', 'value') + formula, synergyAnchor);
            } else {
                synergy = this.asSpan(computed.synergy.min + ' - ' + computed.synergy.max, 'value');
                template = this.replaceAnchor(template, synergy + formula, synergyAnchor);
            }
        }

        return template;
    }

    private applyEffectValueSynergyForSkill(template: string, baseValue: number, effectValue: EffectValueSynergy, reinforcment: number, valueAnchor: string,  synergyAnchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectSynergyDetails(effectValue, baseValue, reinforcment);
        const formula = this.computedItemValueToFormula(computed, 'mastery');
        const max = this.computeMax(effectValue, true);

        if (computed.synergy !== null) {
            let synergy: string | null = null;

            if (typeof computed.synergy === 'number') {
                const percent = effectValue.percent ? '%' : '';
                synergy = this.asSpan(computed.synergy.toString() + percent, 'value');
                template = this.replaceAnchor(template, synergy, valueAnchor);
                template = this.replaceAnchor(template, this.asSpan(computed.value + '%', 'value') + max + formula, synergyAnchor);
            } else {
                synergy = this.asSpan(computed.synergy.min + ' - ' + computed.synergy.max, 'value');
                template = this.replaceAnchor(template, synergy + max + formula, effectValue.valueType === EffectValueValueType.Damage ? valueAnchor : synergyAnchor);
            }
        }

        return template;
    }

    private getCraftedEffectDetails(craftedEffect: CraftableEffect, forcePercent: boolean = false): string | null {
        const percent = craftedEffect.effect.percent || forcePercent ? '%' : '';
        let result : Array<string> = [];

        if (craftedEffect.minPossibleCraftedValue < craftedEffect.maxPossibleCraftedValue) {
            const min = craftedEffect.possibleCraftedValues[craftedEffect.minPossibleCraftedValue];
            const max = craftedEffect.possibleCraftedValues[craftedEffect.maxPossibleCraftedValue];
            result.push(min + percent + '-' + max + percent);
        }
        if ((isEffectValueSynergy(craftedEffect.effect) || isEffectValueVariable(craftedEffect.effect)) && craftedEffect.effect.upgrade > 0) {
            if (result.length === 0) {
                result.push(craftedEffect.effect.value + percent);
            }
            result.push('+ ' + craftedEffect.effect.upgrade + percent + ' per reinforcment');
        }

        return result.length === 0 ? '' : this.asSpan(' (' + result.join(' ') + ')', 'details');
    }

    public formatLegendaryDescription(template: string, craftedEffects: Array<CraftableEffect>): string {
        for (let craftedEffect of craftedEffects) {
            const percent = craftedEffect.effect.percent ? '%' : '';

            if (isEffectValueVariable(craftedEffect.effect)) {
                const value = this.asSpan(craftedEffect.effect.value.toString() + percent, 'value');
                const details = this.getCraftedEffectDetails(craftedEffect);
                template = this.replaceAnchor(template, value + details, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(craftedEffect.effect)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    const value = this.asSpan(craftedEffect.effect.value.toString() + percent, 'value');
                    template = this.replaceAnchor(template, value, anchor);
                }
            } else if (isEffectValueSynergy(craftedEffect.effect)) {
                const value = this.asSpan(craftedEffect.effect.value.toString() + '%', 'value');
                const details = this.getCraftedEffectDetails(craftedEffect, true);
                const synergy = this.asSpan(craftedEffect.effect.synergy.toString() + percent, 'value');
                template = this.replaceAnchor(template, value + details, this.VALUE_ANCHOR);
                template = this.replaceAnchor(template, synergy, this.SYNERGY_ANCHOR);
            }
        }

        return template;
    }

    public formatActivableDescription(template: string, values: Array<AbstractEffectValue>): string {
        for (let effectValue of values) {
            if (isEffectValueVariable(effectValue)) {
                template = this.applyItemEffectValueVariable(template, 0, effectValue, 0, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    template = this.applyEffectValueConstant(template, effectValue, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                template = this.applyEffectValueSynergyForActivable(template, 0, effectValue, 0, this.VALUE_ANCHOR, this.SYNERGY_ANCHOR);
            }
            
        }

        return template;
    }

    private getEffectValueDetails(effectValue: EffectValueVariable | EffectValueSynergy): string {
        let result = '';
        const percent = (effectValue.percent || isEffectValueSynergy(effectValue)) ? '%' : '';

        if (effectValue.upgrade > 0) {
            const sign = effectValue.upgrade < 0 ? '-' : '+';
            const base = (effectValue.baseValue + effectValue.upgrade) + percent;
            const upgrade = sign + ' ' + Math.abs(effectValue.upgrade) + percent;

            if (effectValue.upgradeType === EffectValueUpgradeType.Mastery) {
                result = base + ' ' + upgrade + ' per mastery level';
            } else if (effectValue.upgradeType === EffectValueUpgradeType.Every3) {
                result = base + ' ' + upgrade + ' every third mastery level';
            } else {
                result = base + ' ' + upgrade + ' every ' + effectValue.upgradeType;
            }

            result = this.asSpan('(' + result + ')', 'details');
        }

        return result;
    }

    private formatValue(value: number | MinMax, percent: boolean): string {
        return typeof value === 'number' ? value.toString() + (percent ? '%' : '') : (value.min + ' - ' + value.max);
    }

    public formatSkillDescription(template: string, effectValues: Array<AbstractEffectValue>, level: number): string {
        for (let effectValue of effectValues) {
            const percent = effectValue.percent ? '%' : '';

            if (isEffectValueVariable(effectValue)) {
                const value = this.asSpan(effectValue.value.toString() + percent, 'value');
                const details = this.getEffectValueDetails(effectValue);
                template = this.replaceAnchor(template, value + ' ' + details, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    const value = this.asSpan(effectValue.value.toString() + percent, 'value');
                    template = this.replaceAnchor(template, value, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                const details = typeof effectValue.synergy === 'number' ? '' :  (' ' + this.getEffectValueDetails(effectValue));
                const synergy = this.asSpan(this.formatValue(effectValue.synergy, effectValue.percent), 'value');
                template = this.replaceAnchor(template, synergy + details, this.VALUE_ANCHOR);
            }
        }

        return template;
    }

    public formatTraitDescription(template: string, values: Array<AbstractEffectValue>, rankAfterThisOne: number): string {
        let description = template;

        for (let effectValue of values) {
            if (isEffectValueVariable(effectValue)) {
                description = this.applySkillEffectValueVariable(description, 0, effectValue, rankAfterThisOne, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(description, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    description = this.applyEffectValueConstant(description, effectValue, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                description = this.applyEffectValueSynergyForSkill(description, 0, effectValue, rankAfterThisOne, this.SYNERGY_ANCHOR, this.VALUE_ANCHOR);
            }
            
        }

        return description;
    }

    public formatUpgradeDescription(template: string, effectValues: Array<AbstractEffectValue>): string {
        for (let effectValue of effectValues) {
            const percent = effectValue.percent ? '%' : '';


            if (isEffectValueVariable(effectValue)) {
                const value = this.asSpan(effectValue.value.toString() + percent, 'value');
                const details = this.getEffectValueDetails(effectValue);
                template = this.replaceAnchor(template, value + ' ' + details, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    const value = this.asSpan(effectValue.value.toString() + percent, 'value');
                    template = this.replaceAnchor(template, value, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                const details = typeof effectValue.synergy === 'number' ? '' :  (' ' + this.getEffectValueDetails(effectValue));
                const synergy = this.asSpan(this.formatValue(effectValue.synergy, effectValue.percent), 'value');
                template = this.replaceAnchor(template, synergy + ' ' + details, this.VALUE_ANCHOR);
            }
        }

        return template;
    }

    public formatReaperTemplate(template: string, values: Array<AbstractEffectValue>, level: number, nonPrimordialLevel: number): string {
        for (let value of values) {
            if (isEffectValueConstant(value)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    template = this.applyEffectValueConstant(template, value, anchor);
                }
            } else if (isEffectValueVariable(value)) {
                template = this.applyReaperEffectValueVariable(template, value, level, nonPrimordialLevel, this.VALUE_ANCHOR);
            } else if (isEffectValueSynergy(value)) {
                template = this.applyReaperEffectValueSynergy(template, value, this.SYNERGY_ANCHOR);
                template = template.replace(this.TYPE_ANCHOR, this.translate(value.source));
            } else if (isEffectValueConstant(value)) {
            }
        }

        return template;
    }

    public getLegendaryDescriptionTemplate(data: GameDataLegendary): string {
        const stats = splitData(data.STAT);
        const types = splitData(data.TYPE)

        return this.parseTemplate(data.EN_DESC, stats, types)
    }

    public getActivableDescriptionTemplate(data: GameDataActivable): string {
        const stats = splitData(data.DESC_VALUE);
        const types = splitData(data.DESC_VALUE_REAL);
        
        return this.parseTemplate(data.EN_DESCRIPTION, stats, types);
    }

    public getSkillDescriptionTemplate(data: GameDataSkill): string {
        const stats = splitData(data.DESC_VALUE).filter(value => !value.startsWith('*'));
        const types = splitData(data.DESC_VALUE_REAL);
        
        const template = data.EN_DESCRIPTION.replace(/ \([^\)]*?(%|\+|\-)[^\)]*?\)/g, '');
        return this.parseTemplate(template, stats, types);
    }

    public getAncestralLegacyDescriptionTemplate(data: GameDataAncestralLegacy): string {
        const stats = splitData(data.DESC_VALUE).filter(value => !value.startsWith('*'));
        const types = splitData(data.DESC_VALUE_REAL);
        
        const template = data.EN_DESCRIPTION.replace(/ \([^\)]*?(%|\+|\-)[^\)]*?\)/g, '');
        return this.parseTemplate(template, stats, types);
    }

    public getAttributeTemplate(data: GameDataAttribute): string {
        const stats = splitData(data.STAT).filter(value => !value.startsWith('*'));
        const types = splitData(data.TYPE);
        
        const template = data.EN_TEXT.replace(/ \([^\)]*?(%|\+|\-)[^\)]*?\)/g, '');
        return this.parseTemplate(template, stats, types);
    }

    public getAttributeCumulativeTraitTemplate(template: string, stat: string | null): string {
        template = template.replace(/ \([^\)]*?(%|\+|\-)[^\)]*?\)/g, '');
        return this.parseTemplate(template, stat === null ? [] : [stat]);
    }

    public formatNextRankDescription(template: string, effectValue: AbstractEffectValue): string { 

        let value: string = '';
        let details: string = '';
        let percent = effectValue.percent ? '%' : '';
        if (isEffectValueSynergy(effectValue)) {

            value = effectValue.synergy + percent;
            
            details = this.asSpan(' (' + value + '% ' + this.translate(effectValue.source) + ')', 'details');
        } else {
            value = effectValue.value + percent;
        }


        template = this.parseTemplate(template, effectValue.stat ? [effectValue.stat] : []);    
        template = this.replaceAnchor(template, this.asSpan(value, 'value') + details, this.VALUE_ANCHOR);

        return template;
    }

    public getReaperDescriptionTemplate(template: string, stats: Array<string> = []): [string, string, string] {
        template = this.injectStatsToTemplates(template, stats);

        if (template.startsWith('*')) {
            template = template.substr(1);
        }

        template = template
            .replace(/\/\n/g, '/')
            .replace(/\/\*/g, '/')
            .replace(/\|\*/g, '|');
            
        return <[string, string, string]>splitData(template, '/')
                .map(t => this.normalizeTemplate(t))
                .map(t => t.replace(/\.\*(.+)/g, '.<br/><br/>$1').replace(/\*(.+)/g, '<br/>$1').replace(/\*/, ''));
    }

    public getReaperLoreTemplate(template: string): string {
        return this.normalizeTemplate(template)
    }

    private getSynergyType(synergy: string): string | null {
        return valueOrNull(splitData(synergy, ':')[1]);
    }

    private injectStatsToTemplates(template: string, stats: Array<string> = []): string {
        return stats.map(stat => this.translate(stat))
        .reduce((desc, stat) => desc.replace(this.STAT_ANCHOR, stat), template);
    }

    private injectTypesToTemplates(template: string, types: Array<string> = []): string {
        return types
            .map(synergy => this.getSynergyType(synergy))
            .filter(isNotNullOrUndefined)
            .map(synergy => this.translate(synergy))
            .reduce((desc, synergy) => desc.replace(this.TYPE_ANCHOR, synergy), template);
    }

    private normalizeTemplate(template: string): string {
        return template
            .replace(/<|>/g, '')
            .replace(/\(/g, '<span class="formula">(')
            .replace(/\)/g, ')</span>')
            .replace(this.RETURN_REGEXP, '</br>');
        
    }

    private parseTemplate(template: string, stats: Array<string> = [], types: Array<string> = []): string {
        template = this.injectStatsToTemplates(template, stats)
        template = this.injectTypesToTemplates(template, types);
        template = this.normalizeTemplate(template);

        return template;
    }

    private getTextGenre(textWithGenre: string, genre: string): string {
        let result = textWithGenre;

        const splitedData = splitData(textWithGenre, '/');
        if (splitedData.length === 4) {
            if (genre === 'MS') {
                result = <string>splitedData[0];
            } else if (genre === 'FS') {
                result = <string>splitedData[1];
            } else if (genre === 'MP') {
                result = <string>splitedData[2];
            } else {
                result = <string>splitedData[3];
            }
        }

        return result;
    }

    public translate(key: string, genre: string | null = null): string {
        key = key.startsWith('*') ? key.substr(1) : key;
        const gameData = this.slormancerDataService.getTranslation(key);
        const data = this.slormancerDataService.getDataAffixByRef(key);
        const keyword = this.slormancerDataService.getKeywordName(key);
        const dataTranslate = this.slormancerDataService.getDataTranslate(key);
        let result = key;

        if (gameData !== null) {
            result = gameData.EN;
        } else if (data !== null) {
            result = data.name;
        } else if (keyword !== null) {
            result = keyword;
        } else if (dataTranslate !== null) {
            result = dataTranslate;
        } else if (key.startsWith('victims_reaper_')) {
            const reaper = this.slormancerDataService.getGameDataReaper(strictParseInt(key.substr(15)));
            if (reaper !== null) {
                result = reaper.EN_NAME;
            }
        }

        if (genre !== null) {
            result = this.getTextGenre(result, genre);
        }

        return result;
    }

    public getReaperEnchantmentLabel(template: string, value: number, min: number, max: number, reaperSmith: string): string {
        const textValue = this.asSpan(value.toString(), 'value')
            +  this.asSpan(' (' + min + ' - ' + max + ')', 'details');
        template = this.replaceAnchor(template, textValue, this.VALUE_ANCHOR);
        template = this.replaceAnchor(template, reaperSmith, this.TYPE_ANCHOR);

        return template;
    }

    public getSkillEnchantmentLabel(template: string, value: number, min: number, max: number, skill: string): string {
        const textValue = this.asSpan(value.toString(), 'value')
            +  this.asSpan(' (' + min + ' - ' + max + ')', 'details');
        template = this.replaceAnchor(template, textValue, this.VALUE_ANCHOR);
        template = this.replaceAnchor(template, skill, this.TYPE_ANCHOR);

        return template;
    }

    public getAttributeEnchantmentLabel(template: string, value: number, min: number, max: number, attribute: string): string {
        const textValue = this.asSpan(value.toString(), 'value')
            +  this.asSpan(' (' + min + ' - ' + max + ')', 'details');
        template = this.replaceAnchor(template, textValue, this.VALUE_ANCHOR);
        template = this.replaceAnchor(template, attribute, this.TYPE_ANCHOR);

        return template;
    }
    
    public getReaperType(reaperClass: HeroClass): string {
        return this.translate('weapon_' + reaperClass);
    }

    public getReaperName(name: string, reaperClass: HeroClass, primordial: boolean): string {
        let type = this.getReaperType(reaperClass);
        
        if (primordial) {
            type = this.replaceAnchor(this.translate('tt_reaper_corrupted'), type , this.VALUE_ANCHOR)
        }

        return this.replaceAnchor(name, type, this.TYPE_ANCHOR);
    }

    public formatItemAffixValue(itemAffix: Affix): string {
        let result = this.applyEffectValueConstant('+' + this.VALUE_ANCHOR, itemAffix.craftedEffect.effect, this.VALUE_ANCHOR);

        if (itemAffix.isPure) {
            result += this.asSpan(' (' + (itemAffix.pure - 100) + '% pure)', 'details pure');
        } else {
            const percent = itemAffix.craftedEffect.effect.percent ? '%' : '';
            result += this.asSpan(' (' + itemAffix.craftedEffect.possibleCraftedValues[itemAffix.craftedEffect.minPossibleCraftedValue] + percent
                + '-' + itemAffix.craftedEffect.possibleCraftedValues[itemAffix.craftedEffect.maxPossibleCraftedValue] + percent + ')', 'details range');
        }
        return result;
    }
}