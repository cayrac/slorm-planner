import { Injectable } from '@angular/core';

import { Affix } from '../../model/content/affix';
import { CraftableEffect } from '../../model/content/craftable-effect';
import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { GameDataActivable } from '../../model/content/game/data/game-data-activable';
import { GameDataAncestralLegacy } from '../../model/content/game/data/game-data-ancestral-legacy';
import { GameDataAttribute } from '../../model/content/game/data/game-data-attribute';
import { GameDataLegendary } from '../../model/content/game/data/game-data-legendary';
import { GameDataSkill } from '../../model/content/game/data/game-data-skill';
import { MinMax } from '../../model/minmax';
import { round } from '../../util/math.util';
import {
    findFirst,
    getCraftValue,
    isEffectValueConstant,
    isEffectValueSynergy,
    isEffectValueVariable,
    isNotNullOrUndefined,
    splitData,
} from '../../util/utils';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerTemplateService {

    private readonly MAX_LABEL = this.slormancerTranslateService.translate('max');

    public readonly STAT_ANCHOR = '£';
    public readonly TYPE_ANCHOR = '$';
    public readonly VALUE_ANCHOR = '@';
    public readonly CONSTANT_ANCHORS = ['¤', '~', '§', '¥'];
    public readonly SYNERGY_ANCHOR = '_';
    public readonly MINMAX_ANCHOR = '_';
    public readonly SYNERGY_PREFIX = 'synergy:';
    public readonly DAMAGE_PREFIX = 'damage:';
    public readonly RETURN_REGEXP = /#/g;

    constructor(private slormancerTranslateService: SlormancerTranslateService) { }

    public asSpan(content: string, className: string): string {
        return '<span class="' + className + '">' + content + '</span>';
    }

    public replaceAnchor(template: string, value: number | string, anchor: string): string {
        return template.replace(anchor, value.toString());
    }

    private getCraftedEffectDetails(craftedEffect: CraftableEffect): string | null {
        const percent = craftedEffect.effect.percent || isEffectValueSynergy(craftedEffect.effect) ? '%' : '';
        let result : Array<string> = [];

        if (craftedEffect.minPossibleCraftedValue < craftedEffect.maxPossibleCraftedValue) {
            const min = getCraftValue(craftedEffect, craftedEffect.minPossibleCraftedValue);
            const max = getCraftValue(craftedEffect, craftedEffect.maxPossibleCraftedValue);
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
                const value = this.asSpan(this.formatValue(craftedEffect.effect.displayValue, true), 'value');
                const details = this.getCraftedEffectDetails(craftedEffect);
                const synergy = this.asSpan(this.formatValue(craftedEffect.effect.displaySynergy, craftedEffect.effect.percent), 'value');
                template = this.replaceAnchor(template, value + details, this.VALUE_ANCHOR);
                template = this.replaceAnchor(template, synergy, this.SYNERGY_ANCHOR);
            }
        }

        return template;
    }

    private isDamageSource(stat: string): boolean {
        return stat === 'elemental_damage' || stat === 'physical_damage' || stat === 'basic_damage' || stat === 'weapon_damage';
    }

    private getEffectValueDetails(effectValue: EffectValueVariable | EffectValueSynergy, hideBase: boolean = false): string {
        let result = '';
        const percent = (effectValue.percent || isEffectValueSynergy(effectValue)) ? '%' : '';

        if (effectValue.max) {
            if (effectValue.value > 0 && effectValue.value < effectValue.max) {
                result = this.asSpan('(+' + effectValue.max + percent + ' ' + this.MAX_LABEL + ')', 'details');
            }
        } else {
            const showUpgrade = effectValue.upgrade > 0;
            const showBase = (isEffectValueSynergy(effectValue) && this.isDamageSource(effectValue.source)) && !hideBase;
            const hasDetails = showUpgrade || showBase;

            if (hasDetails) {
                const sign = showBase ? effectValue.upgrade < 0 ? '- ' : '+ ' : effectValue.upgrade < 0 ? '-' : '+';
                const base = showBase ? (effectValue.value) + percent + ' ': '';
                const upgrade = showUpgrade ? sign + Math.abs(effectValue.upgrade) + percent : '';

                result = base;

                if (showUpgrade) {
                    if (effectValue.upgradeType === EffectValueUpgradeType.Mastery) {
                        result += upgrade + ' per mastery level';
                    } else if (effectValue.upgradeType === EffectValueUpgradeType.UpgradeRank) {
                        result += upgrade + ' per rank';
                    } else if (effectValue.upgradeType === EffectValueUpgradeType.AncestralRank) {
                        result += upgrade + ' per rank';
                    } else if (effectValue.upgradeType === EffectValueUpgradeType.Every3) {
                        result += upgrade + ' every third mastery level';
                    } else if (effectValue.upgradeType === EffectValueUpgradeType.ReaperLevel) {
                        result += upgrade + ' per Level';
                    } else if (effectValue.upgradeType === EffectValueUpgradeType.NonPrimordialReaperLevel) {
                        result += upgrade + ' per Non-Primordial Level';
                    } else if (effectValue.upgradeType === EffectValueUpgradeType.RanksAfterInThisTrait) {
                        result += upgrade + ' for every point after this one in this Trait';
                    } else if (effectValue.upgradeType === EffectValueUpgradeType.Reinforcment) {
                        result += upgrade + ' per reinforcment';
                    }
                } else if (isEffectValueSynergy(effectValue)) {
                    result += this.slormancerTranslateService.translate(effectValue.source);
                }

                result = this.asSpan('(' + result + ')', 'details');
            }
        }

        return result;
    }

    private formatValue(value: number | MinMax, percent: boolean, roundValues: boolean = false): string {
        return typeof value === 'number'
        ? (roundValues ? round(value) : value) + (percent ? '%' : '')
        : ((roundValues ? round(value.min) : value.min) + ' - ' + (roundValues ? round(value.max) : value.max));
    }

    public formatActivableDescription(template: string, effectValues: Array<AbstractEffectValue>): string {
        for (let effectValue of effectValues) {
            const percent = effectValue.percent ? '%' : '';

            if (isEffectValueVariable(effectValue)) {
                const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                const details = this.getEffectValueDetails(effectValue);
                template = this.replaceAnchor(template, value + ' ' + details, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                    template = this.replaceAnchor(template, value, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                const details = this.getEffectValueDetails(effectValue);
                const synergy = this.asSpan(this.formatValue(effectValue.displaySynergy, effectValue.percent), 'value');
                const value = this.asSpan(this.formatValue(effectValue.value, true), 'value');
                template = this.replaceAnchor(template, synergy, this.VALUE_ANCHOR);
                template = this.replaceAnchor(template, value + details, this.SYNERGY_ANCHOR);
            }
        }

        return template;
    }

    public formatSkillDescription(template: string, effectValues: Array<AbstractEffectValue>): string {
        for (let effectValue of effectValues) {
            const percent = effectValue.percent ? '%' : '';

            if (isEffectValueVariable(effectValue)) {
                const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                const details = this.getEffectValueDetails(effectValue);
                template = this.replaceAnchor(template, value + ' ' + details, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                    template = this.replaceAnchor(template, value, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                const details = ' ' + this.getEffectValueDetails(effectValue);
                const synergy = this.asSpan(this.formatValue(effectValue.displaySynergy, effectValue.percent), 'value');
                template = this.replaceAnchor(template, synergy + details, this.VALUE_ANCHOR);
            }
        }

        return template;
    }

    public formatTraitDescription(template: string, effectValues: Array<AbstractEffectValue>): string {
        for (let effectValue of effectValues) {
            const percent = effectValue.percent ? '%' : '';

            if (isEffectValueVariable(effectValue)) {
                const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                const details = this.getEffectValueDetails(effectValue);
                template = this.replaceAnchor(template, value + details, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                    template = this.replaceAnchor(template, value, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                const details = this.getEffectValueDetails(effectValue);
                const value = this.asSpan(this.formatValue(effectValue.displayValue, effectValue.percent), 'value');
                const synergy = this.asSpan(this.formatValue(effectValue.displaySynergy, effectValue.percent), 'value');
                template = this.replaceAnchor(template, value + details, this.VALUE_ANCHOR);
                template = this.replaceAnchor(template, synergy, this.SYNERGY_ANCHOR);
            }
        }

        return template;
    }

    public formatUpgradeDescription(template: string, effectValues: Array<AbstractEffectValue>): string {
        for (let effectValue of effectValues) {
            const percent = effectValue.percent ? '%' : '';

            if (isEffectValueVariable(effectValue)) {
                const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                const details = this.getEffectValueDetails(effectValue);
                template = this.replaceAnchor(template, value + ' ' + details, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                    template = this.replaceAnchor(template, value, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                const details = this.getEffectValueDetails(effectValue);
                const synergy = this.asSpan(this.formatValue(effectValue.displaySynergy, effectValue.percent), 'value');
                const value = this.asSpan(this.formatValue(effectValue.value, true), 'value');
                template = this.replaceAnchor(template, synergy, this.VALUE_ANCHOR);
                template = this.replaceAnchor(template, value + ' ' + details, this.SYNERGY_ANCHOR);
            }
        }

        return template;
    }

    public formatAncestralLegacyDescription(template: string, effectValues: Array<AbstractEffectValue>): string {
        for (let effectValue of effectValues) {
            const percent = effectValue.percent ? '%' : '';

            if (isEffectValueVariable(effectValue)) {
                const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                const details = this.getEffectValueDetails(effectValue);
                template = this.replaceAnchor(template, value + ' ' + details, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                    template = this.replaceAnchor(template, value, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                const details = this.getEffectValueDetails(effectValue);
                const synergy = this.asSpan(this.formatValue(effectValue.displaySynergy, effectValue.percent), 'value');
                const value = this.asSpan(this.formatValue(effectValue.value, true), 'value');
                template = this.replaceAnchor(template, synergy + ' ' + details , this.VALUE_ANCHOR);
                template = this.replaceAnchor(template, value, this.SYNERGY_ANCHOR);
            }
        }

        return template;
    }

    public formatReaperTemplate(template: string, effectValues: Array<AbstractEffectValue>): string {
        for (let effectValue of effectValues) {
            const percent = effectValue.percent ? '%' : '';

            if (isEffectValueVariable(effectValue)) {
                const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                const details = this.getEffectValueDetails(effectValue);
                template = this.replaceAnchor(template, value + ' ' + details, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    const value = this.asSpan(effectValue.displayValue.toString() + percent, 'value');
                    template = this.replaceAnchor(template, value, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                const details = this.getEffectValueDetails(effectValue);
                const synergy = this.asSpan(this.formatValue(effectValue.displaySynergy, effectValue.percent), 'value');
                template = this.replaceAnchor(template, synergy + details, this.SYNERGY_ANCHOR);
                template = this.replaceAnchor(template, this.slormancerTranslateService.translate(effectValue.source), this.TYPE_ANCHOR);
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

    public prepareAncestralLegacyDescriptionTemplate(data: GameDataAncestralLegacy): string {
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

    public prepareAttributeCumulativeTraitTemplate(template: string, stat: string | null): string {
        template = template.replace(/ \([^\)]*?(%|\+|\-)[^\)]*?\)/g, '');
        return this.parseTemplate(template, stat === null ? [] : [stat]);
    }

    public formatNextRankDescription(template: string, effectValue: AbstractEffectValue): string { 

        let value: string = '';
        let details: string = '';
        if (isEffectValueSynergy(effectValue)) {
            value = this.formatValue(effectValue.displaySynergy, effectValue.percent);
            details = this.asSpan(' (' + this.formatValue(effectValue.value, true) + ' ' + this.slormancerTranslateService.translate(effectValue.source) + ')', 'details');
        } else {
            value = this.formatValue(effectValue.value, effectValue.percent);
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

    private injectStatsToTemplates(template: string, stats: Array<string> = []): string {
        for (const stat of stats) {
            template = template.replace(this.STAT_ANCHOR, this.slormancerTranslateService.translate(stat));
        }

        return template;
    }

    private injectSynergyTypesToTemplates(template: string, synergies: Array<string> = []): string {
        synergies = synergies
            .map(synergy => splitData(synergy, ':')[1])
            .filter(isNotNullOrUndefined);

        for (const synergy of synergies) {
            let translated = this.slormancerTranslateService.translate(synergy);

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
        const percent = itemAffix.craftedEffect.effect.percent ? '%' : '';

        let result = '+' + this.asSpan(itemAffix.craftedEffect.effect.displayValue.toString(), 'value') + percent;
        if (itemAffix.isPure) {
            result += this.asSpan(' (' + (itemAffix.pure - 100) + '% pure)', 'details pure');
        } else {
            const percent = itemAffix.craftedEffect.effect.percent ? '%' : '';
            result += this.asSpan(' (' + getCraftValue(itemAffix.craftedEffect, itemAffix.craftedEffect.minPossibleCraftedValue) + percent
                + '-' + getCraftValue(itemAffix.craftedEffect, itemAffix.craftedEffect.maxPossibleCraftedValue) + percent + ')', 'details range');
        }
        
        return result;
    }
}