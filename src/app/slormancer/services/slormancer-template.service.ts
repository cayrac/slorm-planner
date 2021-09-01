import { Injectable } from '@angular/core';

import { Affix } from '../model/affix';
import { ComputedEffectValue } from '../model/computed-effect-value';
import { CraftableEffect } from '../model/craftable-effect';
import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
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
                    private slormancerItemValueService: SlormancerItemValueService) { }

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

    private applySkillEffectValueVariable(template: string, baseValue: number, effectValue: EffectValueVariable, reinforcment: number, anchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectVariableDetails(effectValue, baseValue, reinforcment);
        const percent = computed.percent ? '%' : '';

        const value = this.asSpan(computed.value + percent, 'value')
        const formula = this.computedItemValueToFormula(computed, 'mastery');
        const max = this.computeMax(effectValue, computed.percent);

        return this.replaceAnchor(template, value + max + formula, anchor);
    }

    private applyEffectValueConstant(template: string, value: EffectValueConstant, anchor: string): string {
        const percent = value.percent ? '%' : '';
        const max = this.computeMax(value, value.percent);
        return this.replaceAnchor(template, this.asSpan(value.value.toString(), 'value') + percent + max, anchor);
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

    private getEffectValueDetails(effectValue: EffectValueVariable | EffectValueSynergy): string {
        let result = '';
        const percent = (effectValue.percent || isEffectValueSynergy(effectValue)) ? '%' : '';

        if (effectValue.upgrade > 0) {
            const sign = effectValue.upgrade < 0 ? '-' : '+';
            const base = (effectValue.baseValue + effectValue.upgrade) + percent;
            const upgrade = Math.abs(effectValue.upgrade) + percent;

            if (effectValue.upgradeType === EffectValueUpgradeType.Mastery) {
                result = base + ' ' + sign + ' ' + upgrade + ' per mastery level';
            } else if (effectValue.upgradeType === EffectValueUpgradeType.Every3) {
                result = base + ' ' + sign + ' ' + upgrade + ' every third mastery level';
            } else if (effectValue.upgradeType === EffectValueUpgradeType.ReaperLevel) {
                result = sign + upgrade + ' per Level';
            } else if (effectValue.upgradeType === EffectValueUpgradeType.NonPrimordialReaperLevel) {
                result = sign + upgrade + ' per Non-Primordial Level';
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

    public formatActivableDescription(template: string, effectValues: Array<AbstractEffectValue>): string {
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

    public formatReaperTemplate(template: string, effectValues: Array<AbstractEffectValue>): string {
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
                template = this.replaceAnchor(template, synergy + details, this.SYNERGY_ANCHOR);
                template = this.replaceAnchor(template, this.translate(effectValue.source), this.TYPE_ANCHOR);
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

    public prepareReaperDescriptionTemplate(template: string, stats: Array<string> = []): [string, string, string] {
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
                .map(t => t.replace(/\.\*(.+)/g, '.<br/><br/>$1')
                           .replace(/\*(.+?)/g, '<br/>$1')
                           .replace(/\*/, ''));
    }

    public getReaperLoreTemplate(template: string): string {
        return this.normalizeTemplate(template)
    }

    private getSynergyType(synergy: string): string | null {
        return valueOrNull(splitData(synergy, ':')[1]);
    }

    private injectStatsToTemplates(template: string, stats: Array<string> = []): string {
        for (const stat of stats) {
            template = template.replace(this.STAT_ANCHOR, this.translate(stat));
        }

        return template;
    }

    private injectSynergyTypesToTemplates(template: string, synergies: Array<string> = []): string {
        synergies = synergies
            .map(synergy => this.getSynergyType(synergy))
            .filter(isNotNullOrUndefined);

        for (const synergy of synergies) {
            let translated = this.translate(synergy);

            if (synergy.startsWith('victims_reaper_')) {
                translated = translated.replace('$', '{weaponClass}')
            }

            template = template.replace(this.TYPE_ANCHOR, translated);
        }
        return template;
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
        template = this.injectSynergyTypesToTemplates(template, types);
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