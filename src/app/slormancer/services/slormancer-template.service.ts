import { Injectable } from '@angular/core';

import { Activable } from '../model/activable';
import { AttributeEnchantment } from '../model/attribute-enchantment';
import { ComputedEffectValue } from '../model/computed-effect-value';
import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { HeroClass } from '../model/enum/hero-class';
import { GameDataActivable } from '../model/game/data/game-data-activable';
import { GameDataAncestralLegacy } from '../model/game/data/game-data-ancestral-legacy';
import { GameDataAttribute } from '../model/game/data/game-data-attribute';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { GameDataSkill } from '../model/game/data/game-data-skill';
import { LegendaryEffect } from '../model/legendary-effect';
import { ReaperEnchantment } from '../model/reaper-enchantment';
import { SkillEnchantment } from '../model/skill-enchantment';
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

    private readonly REAPER_ENCHANTMENT_TEMPLATE = '+@ Level on $\'s £';
    private readonly SKILL_ENCHANTMENT_TEMPLATE = '+@ $ Mastery';
    private readonly ATTRIBUTE_ENCHANTMENT_TEMPLATE = '+@ $';

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

    private asSpan(content: string, className: string): string {
        return '<span class="' + className + '">' + content + '</span>';
    }

    public replaceAnchor(template: string, value: number | string, anchor: string): string {
        return template.replace(anchor, value.toString());
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

                formula += ' ' + sign + ' ' + Math.abs(computed.upgrade) + percent + (computed.upgradeType === EffectValueUpgradeType.Every3  ? ' every third ' + upgradeName + ' level' : ' per ' + upgradeName);
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

        return this.replaceAnchor(template, value + formula, anchor);
    }

    private applyUpgradeEffectValueVariable(template: string, baseValue: number, effectValue: EffectValueVariable, reinforcment: number, anchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectVariableDetails(effectValue, baseValue, reinforcment);
        const percent = computed.percent ? '%' : '';

        const value = this.asSpan(computed.value + percent, 'value')
        const formula = this.computedItemValueToFormula(computed, 'rank');

        return this.replaceAnchor(template, value + formula, anchor);
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
            formula = effect.ratio + '% ' + this.translate(effect.source);
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
        return this.replaceAnchor(template, this.asSpan(value.value.toString(), 'value') + percent, anchor);
    }

    private applyEffectValueSynergy(template: string, baseValue: number, effectValue: EffectValueSynergy, reinforcment: number, synergyAnchor: string, valueAnchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectSynergyDetails(effectValue, baseValue, reinforcment);
        
        const value = this.asSpan(computed.value + '%', 'value');
        const formula = this.computedItemValueToFormula(computed);

        template = this.replaceAnchor(template, value + formula, valueAnchor);

        if (computed.synergy !== null) {
            let synergy: string | null = null;
            if (typeof computed.synergy === 'number') {
                synergy = this.asSpan(computed.synergy.toString(), 'value');
            } else {
                synergy = this.asSpan(computed.synergy.min + ' - ' + computed.synergy.max, 'value');
            }

            template = this.replaceAnchor(template, synergy, synergyAnchor);
        }

        return template;
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

        if (computed.synergy !== null) {
            let synergy: string | null = null;

            if (typeof computed.synergy === 'number') {
                const percent = effectValue.percent ? '%' : '';
                synergy = this.asSpan(computed.synergy.toString() + percent, 'value');
                template = this.replaceAnchor(template, synergy, valueAnchor);
                template = this.replaceAnchor(template, this.asSpan(computed.value + '%', 'value') + formula, synergyAnchor);
            } else {
                synergy = this.asSpan(computed.synergy.min + ' - ' + computed.synergy.max, 'value');
                template = this.replaceAnchor(template, synergy + formula, effectValue.valueType === EffectValueValueType.Damage ? valueAnchor : synergyAnchor);
            }
        }

        return template;
    }

    private applyEffectValueSynergyForUpgrade(template: string, baseValue: number, effectValue: EffectValueSynergy, reinforcment: number, valueAnchor: string,  synergyAnchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectSynergyDetails(effectValue, baseValue, reinforcment);
        const formula = this.computedItemValueToFormula(computed, 'rank');

        if (computed.synergy !== null) {
            let synergy: string | null = null;

            if (typeof computed.synergy === 'number') {
                const percent = effectValue.percent ? '%' : '';
                synergy = this.asSpan(computed.synergy.toString() + percent, 'value');
                template = this.replaceAnchor(template, synergy, valueAnchor);
                template = this.replaceAnchor(template, this.asSpan(computed.value + '%', 'value') + formula, synergyAnchor);
            } else {
                synergy = this.asSpan(computed.synergy.min + ' - ' + computed.synergy.max, 'value');
                template = this.replaceAnchor(template, synergy + formula, effectValue.valueType === EffectValueValueType.Damage ? valueAnchor : synergyAnchor);
            }
        }

        return template;
    }

    public formatLegendaryDescription(effect: LegendaryEffect, reinforcment: number) {
        let template = effect.description;

        for (let effectValue of effect.values) {
            if (isEffectValueVariable(effectValue)) {
                template = this.applyItemEffectValueVariable(template, effect.value, effectValue, reinforcment, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    template = this.applyEffectValueConstant(template, effectValue, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                template = this.applyEffectValueSynergy(template, effect.value, effectValue, reinforcment, this.SYNERGY_ANCHOR, this.VALUE_ANCHOR);
            }
        }

        return template;
    }

    public formatActivableDescription(skill: Activable, level: number): string {
        let template = skill.description;

        for (let effectValue of skill.values) {
            if (isEffectValueVariable(effectValue)) {
                template = this.applyItemEffectValueVariable(template, 0, effectValue, level, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    template = this.applyEffectValueConstant(template, effectValue, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                template = this.applyEffectValueSynergyForActivable(template, 0, effectValue, level, this.VALUE_ANCHOR, this.SYNERGY_ANCHOR);
            }
            
        }

        return template;
    }

    public formatSkillDescription(template: string, values: Array<AbstractEffectValue>, level: number): string {
        let description = template;

        for (let effectValue of values) {
            if (isEffectValueVariable(effectValue)) {
                description = this.applySkillEffectValueVariable(description, 0, effectValue, level, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(description, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    description = this.applyEffectValueConstant(description, effectValue, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                description = this.applyEffectValueSynergyForSkill(description, 0, effectValue, level, this.VALUE_ANCHOR, this.SYNERGY_ANCHOR);
            }
            
        }

        return description;
    }

    public formatUpgradeDescription(template: string, values: Array<AbstractEffectValue>, level: number): string {
        let description = template;

        for (let effectValue of values) {
            if (isEffectValueVariable(effectValue)) {
                description = this.applyUpgradeEffectValueVariable(description, 0, effectValue, level, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(description, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    description = this.applyEffectValueConstant(description, effectValue, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                description = this.applyEffectValueSynergyForUpgrade(description, 0, effectValue, level, this.VALUE_ANCHOR, this.SYNERGY_ANCHOR);
            }
            
        }

        return description;
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
        // TODO stats peuvent demander des infos qu'on ne peux avoir que sur la génération dynamique, à déplacer plus tard
        const stats = splitData(data.DESC_VALUE);
        const types = splitData(data.DESC_VALUE_REAL);
        
        return this.parseTemplate(data.EN_DESCRIPTION, stats, types);
    }

    public getSkillDescriptionTemplate(data: GameDataSkill): string {
        // TODO stats peuvent demander des infos qu'on ne peux avoir que sur la génération dynamique, à déplacer plus tard
        const stats = splitData(data.DESC_VALUE).filter(value => !value.startsWith('*'));
        const types = splitData(data.DESC_VALUE_REAL);
        
        const template = data.EN_DESCRIPTION.replace(/ \([^\)]*?(%|\+|\-)[^\)]*?\)/g, '');
        return this.parseTemplate(template, stats, types);
    }

    public getAncestralLegacyDescriptionTemplate(data: GameDataAncestralLegacy): string {
        // TODO stats peuvent demander des infos qu'on ne peux avoir que sur la génération dynamique, à déplacer plus tard
        const stats = splitData(data.DESC_VALUE).filter(value => !value.startsWith('*'));
        const types = splitData(data.DESC_VALUE_REAL);
        
        const template = data.EN_DESCRIPTION.replace(/ \([^\)]*?(%|\+|\-)[^\)]*?\)/g, '');
        return this.parseTemplate(template, stats, types);
    }

    public getAttributeTemplate(data: GameDataAttribute): string {
        // TODO stats peuvent demander des infos qu'on ne peux avoir que sur la génération dynamique, à déplacer plus tard
        const stats = splitData(data.STAT).filter(value => !value.startsWith('*'));
        const types = splitData(data.TYPE);
        
        const template = data.EN_TEXT.replace(/ \([^\)]*?(%|\+|\-)[^\)]*?\)/g, '');
        return this.parseTemplate(template, stats, types);
    }

    public formatNextRankDescription(template: string, value: EffectValueVariable | EffectValueSynergy, rank: number): string {
        const computed = isEffectValueVariable(value)
            ? this.slormancerItemValueService.computeEffectVariableDetails(value, 0, rank) 
            : this.slormancerItemValueService.computeEffectSynergyDetails(value, 0, rank);    

        let computedValue: string = '';
        let formula: string = '';
        let percent = computed.percent ? '%' : '';
        if (computed.synergy !== null) {
            if (typeof computed.synergy === 'number') {
                computedValue = computed.synergy.toString();
            } else {
                computedValue = computed.synergy.min + ' - ' + computed.synergy.max;
            }
            
            if (computed.upgrade !== 0 && isEffectValueSynergy(value)) {
                formula = ' <span class="formula">(' + computed.value + percent + ' ' + this.translate(value.source) + ')</span>';
            }
        } else {
            computedValue = computed.value.toString() + percent;
        }

        template = this.parseTemplate(template, value.stat ? [value.stat] : []);    
        template = this.replaceAnchor(template, this.asSpan(computedValue, 'value'), this.VALUE_ANCHOR) + formula;

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

    public translate(key: string): string {
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

        return result;
    }

    public getReaperEnchantmentLabel(enchantment: ReaperEnchantment): string {
        let template = this.REAPER_ENCHANTMENT_TEMPLATE;

        const value = this.asSpan(enchantment.value.toString(), 'value')
            +  this.asSpan(' (' + firstValue(enchantment.values) + ' - ' + lastValue(enchantment.values) + ')', 'range');
        template = this.replaceAnchor(template, value, this.VALUE_ANCHOR);
        template = this.replaceAnchor(template, this.translate(enchantment.name), this.TYPE_ANCHOR);
        template = this.replaceAnchor(template, this.translate('tooltip_reapers'), this.STAT_ANCHOR);

        return template;
    }

    public getSkillEnchantmentLabel(enchantment: SkillEnchantment, heroClass: HeroClass): string {
        const gameData = this.slormancerDataService.getGameDataSkill(heroClass, enchantment.type);
        let template = this.SKILL_ENCHANTMENT_TEMPLATE;

        const value = this.asSpan(enchantment.value.toString(), 'value')
            +  this.asSpan(' (' + firstValue(enchantment.values) + ' - ' + lastValue(enchantment.values) + ')', 'range');
        template = this.replaceAnchor(template, value, this.VALUE_ANCHOR);
        template = this.replaceAnchor(template, gameData !== null ? gameData.EN_NAME : '??', this.TYPE_ANCHOR);

        return template;
    }

    public getAttributeEnchantmentLabel(enchantment: AttributeEnchantment): string {
        let template = this.ATTRIBUTE_ENCHANTMENT_TEMPLATE;

        const value = this.asSpan(enchantment.value.toString(), 'value')
            +  this.asSpan(' (' + firstValue(enchantment.values) + ' - ' + lastValue(enchantment.values) + ')', 'range');
        template = this.replaceAnchor(template, value, this.VALUE_ANCHOR);
        template = this.replaceAnchor(template, this.translate(enchantment.name), this.TYPE_ANCHOR);

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

    public getReaperBuilderName(id: number): string {
        return this.translate('weapon_reapersmith_' + id);
    }
}