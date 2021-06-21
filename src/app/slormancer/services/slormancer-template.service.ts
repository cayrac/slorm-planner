import { Injectable } from '@angular/core';

import {
    EffectValueConstant,
    EffectValueRange,
    EffectValueSynergy,
    EffectValueSynergyMinMax,
    EffectValueVariable,
} from '../model/effect-value';
import { GameDataActivable } from '../model/game/data/game-data-activable';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { LegendaryEffect } from '../model/legendary-effect';
import { Skill } from '../model/skill';
import {
    findFirst,
    firstvalue,
    isEffectValueConstant,
    isEffectValueRange,
    isEffectValueSynergy,
    isEffectValueSynergyMinMax,
    isEffectValueVariable,
    isNotNullOrUndefined,
    lastvalue,
    splitData,
    valueOrDefault,
    valueOrNull,
} from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';

@Injectable()
export class SlormancerTemplateService {

    public readonly STAT_ANCHOR = '£';
    public readonly TYPE_ANCHOR = '$';
    public readonly VALUE_ANCHOR = '@';
    public readonly CONSTANT_ANCHORS = ['¤', '~'];
    public readonly SYNERGY_ANCHOR = '_';
    public readonly MINMAX_ANCHOR = '_';
    public readonly SYNERGY_PREFIX = 'synergy:';
    public readonly DAMAGE_PREFIX = 'damage:';
    public readonly RETURN_REGEXP = /#/g;

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerItemValueService: SlormancerItemValueService) { }

    private asSpan(content: string, className: string): string {
        return '<span class="' + className + '">' + content + '</span>';
    }

    private replaceAnchor(template: string, value: string, anchor: string): string {
        return template.replace(anchor, value)
    }

    private applyEffectValueVariable(template: string, value: EffectValueVariable, reinforcment: number, anchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectValueVariable(value, reinforcment);
        const percent = value.percent ? '%' : '';

        let text = this.asSpan(computed + percent, 'value');
        if (value.upgrade > 0) {
            text = text + this.asSpan(' (' + value.value + percent + ' + ' + value.upgrade + percent + ' per upgrade)', 'formula');
        }

        return this.replaceAnchor(template, text, anchor);
    }

    private applyEffectValueConstant(template: string, value: EffectValueConstant, anchor: string): string {
        return this.replaceAnchor(template, this.asSpan(value.value.toString(), 'value'), anchor);
    }

    private applyEffectValueRange(template: string, value: EffectValueRange, rangeValue: number, reinforcment: number, anchor: string): string {
        const range = this.slormancerItemValueService.computeEffectValueRange(value, reinforcment);
        const baseRange = this.slormancerItemValueService.computeEffectValueRange(value, 0);
        const percent = value.percent ? '%' : '';
        const currentValue = valueOrDefault(range[rangeValue], 0);

        let text = this.asSpan(currentValue + percent, 'value');
        let formula = firstvalue(baseRange) + percent + ' - ' + lastvalue(baseRange) + percent
        if (value.upgrade > 0) {
            formula = formula + ' + ' + value.upgrade + percent + ' per upgrade';
        }
        text = text + this.asSpan(' (' + formula + ')', 'formula');

        return this.replaceAnchor(template, text, anchor);
    }

    private applyEffectValueSynergy(template: string, value: EffectValueSynergy, reinforcment: number, synergyAnchor: string, valueAnchor: string): string {
        const computedValue = this.slormancerItemValueService.computeEffectValueSynergy(value, reinforcment);
        const ratio = this.slormancerItemValueService.computeEffectValueSynergyRatio(value, reinforcment);

        const textValue = this.asSpan(computedValue.toString(), 'value');

        let textRatio = this.asSpan(ratio.toString() + '%', 'value');
        if (value.upgrade > 0) {
            textRatio = textRatio + this.asSpan(' (' + value.ratio + '% + ' + value.upgrade + '% per upgrade)', 'formula');
        }

        template = this.replaceAnchor(template, textValue, synergyAnchor);
        template = this.replaceAnchor(template, textRatio, valueAnchor);

        return template;
    }

    private applyEffectValueSynergyMinMax(template: string, value: EffectValueSynergyMinMax, reinforcment: number, anchor: string): string {
        const computedValue = this.slormancerItemValueService.computeEffectValueSynergyMinMax(value, reinforcment);
        const ratio = this.slormancerItemValueService.computeEffectValueSynergyRatio(value, reinforcment);

        let textValue = this.asSpan(computedValue.min + ' - ' + computedValue.max, 'value');

        let textRatio = this.asSpan(' (' + ratio + '% ' + (value.upgrade > 0 ? ' : ' + value.ratio + '%' + ' + ' + value.upgrade + '% per upgrade' : '') + ')', 'formula');

        template = this.replaceAnchor(template, textValue + textRatio, anchor);

        return template;
    }

    public formatLegendaryDescription(effect: LegendaryEffect, reinforcment: number) {
        let template = effect.description;

        for (let value of effect.values) {
            if (isEffectValueVariable(value)) {
                template = this.applyEffectValueVariable(template, value, reinforcment, this.VALUE_ANCHOR);
            } else if (isEffectValueRange(value)) {
                template = this.applyEffectValueRange(template, value, effect.value, reinforcment, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(value)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    template = this.applyEffectValueConstant(template, value, anchor);
                }
            } else if (isEffectValueSynergy(value)) {
                template = this.applyEffectValueSynergy(template, value, reinforcment, this.SYNERGY_ANCHOR, this.VALUE_ANCHOR);
            } else if (isEffectValueSynergyMinMax(value)) {
                template = this.applyEffectValueSynergyMinMax(template, value, reinforcment, this.MINMAX_ANCHOR);
            }
        }

        return template;
    }

    public formatSkillDescription(skill: Skill, level: number): string {
        let template = skill.description;

        for (let value of skill.values) {
            if (isEffectValueVariable(value)) {
                template = this.applyEffectValueVariable(template, value, level, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(value)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    template = this.applyEffectValueConstant(template, value, anchor);
                }
            } else if (isEffectValueSynergy(value)) {
                template = this.applyEffectValueSynergy(template, value, level, this.SYNERGY_ANCHOR, this.VALUE_ANCHOR);
            } else if (isEffectValueSynergyMinMax(value)) {
                template = this.applyEffectValueSynergyMinMax(template, value, level, this.MINMAX_ANCHOR);
            }
            
        }

        return template;
    }

    public getLegendaryDescriptionTemplate(data: GameDataLegendary): string {
        const stats = splitData(data.STAT);
        const types = splitData(data.TYPE)

        return this.parseTemplate(data.EN_DESC, stats, types)
    }

    public getSkillDescriptionTemplate(data: GameDataActivable): string {
        const stats = splitData(data.DESC_VALUE)
        const types = splitData(data.DESC_VALUE_REAL)
        
        return this.parseTemplate(data.EN_DESCRIPTION, stats, types);
    }

    private getSynergyType(synergy: string): string | null {
        return valueOrNull(splitData(synergy, ':')[1]);
    }

    private parseTemplate(template: string, stats: Array<string> = [], types: Array<string> = []) {
        template = stats.map(stat => this.keyToString(stat))
            .reduce((desc, stat) => desc.replace(this.STAT_ANCHOR, stat), template);

        template = types
            .map(synergy => this.getSynergyType(synergy))
            .filter(isNotNullOrUndefined)
            .map(synergy => this.keyToString(synergy))
            .reduce((desc, synergy) => desc.replace(this.TYPE_ANCHOR, synergy), template);
        
        template = template.replace(/<|>/g, '');
        template = template.replace(this.RETURN_REGEXP, '</br>');

        return template;
    }

    private keyToString(key: string): string {
        const data = this.slormancerDataService.getDataAffixByRef(key);
        const keyword = this.slormancerDataService.getKeywordName(key);
        let result = key;

        if (data !== null) {
            result = data.name;
        } else if (keyword !== null) {
            result = keyword;
        }

        return result;
    }

    
}