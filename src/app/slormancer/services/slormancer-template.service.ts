import { Injectable } from '@angular/core';

import { GameDataActivable } from '../model/game/data/game-data-activable';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { LegendaryEffect } from '../model/legendary-effect';
import { Skill } from '../model/skill';
import { findFirst, firstvalue, isNotNullOrUndefined, lastvalue, splitData, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';

@Injectable()
export class SlormancerTemplateService {

    public readonly STAT_ANCHOR = '£';
    public readonly TYPE_ANCHOR = '$';
    public readonly VALUE_ANCHOR = '@';
    public readonly CONSTANT_ANCHORS = ['¤', '~'];
    public readonly SYNERGY_ANCHOR = '_';
    public readonly SYNERGY_PREFIX = 'synergy:';
    public readonly DAMAGE_PREFIX = 'damage:';
    public readonly RETURN_REGEXP = /#/g;

    constructor(private slormancerDataService: SlormancerDataService) { }

    private asSpan(content: string, className: string): string {
        return '<span class="' + className + '">' + content + '</span>';
    }

    private replaceAnchor(template: string, value: string, anchor: string): string {
        return template.replace(anchor, value)
    }

    public formatLegendaryDescription(effect: LegendaryEffect) {
        let template = effect.description;

        for (let value of effect.values) {
            const percent = value.type !== null;
            let computedValue = effect.value;
            let min: number | null = null;
            let max: number | null = null;

            if (value.constant !== null) {
                computedValue = value.constant
            } else if (value.values !== null) {
                const rangedValue = value.values[effect.value];
                if (rangedValue) {
                    computedValue = rangedValue;
                }
            }

            if (value.values !== null) {
                min = firstvalue(value.values);
                max = lastvalue(value.values);
            }

            const percentValue = percent ? '%' : '';
            let replace = this.asSpan(computedValue.toString() + percentValue, 'value');
    
            if (min !== null && max !== null) {
                replace += ' ' + this.asSpan('(' + min + percentValue + ' - ' + max + percentValue + ')', 'range');
            }
            
            template = this.replaceAnchor(template, replace, this.VALUE_ANCHOR);

            if (value.synergyValue !== null) {
                const synergyValue = this.asSpan(value.synergyValue.toString(), 'value');
                template = this.replaceAnchor(template, synergyValue, this.SYNERGY_ANCHOR);
            }
        }

        for (let constant of effect.constants) {
            const anchor = findFirst(template, this.CONSTANT_ANCHORS);
            if (anchor !== null) {
                const constValue = this.asSpan(constant.toString(), 'value');
                template = this.replaceAnchor(template, constValue, anchor);
            }
        }

        return template;
    }

    public formatSkillDescription(skill: Skill): string {
        let template = skill.description;

        for (let value of skill.values) {
            if (value.computedValue !== null) {
                let replace: string = '';
                let range: string | null = null;

                const percentValue = value.type === '%' ? '%' : '';
                if (typeof value.computedValue === 'number') {
                    replace = value.computedValue + percentValue;
                } else if (value.computedValue !== null) {
                    console.log('minmax : ', value);
                    replace = value.computedValue.min + percentValue + ' - ' + value.computedValue.max + percentValue;
                    const synergyType = value.valueReal === null ? null : this.getSynergyType(value.valueReal);
                    if (synergyType !== null) {
                        console.log('with range : ');
                        range = '(' + value.baseValue + '% of ' + this.keyToString(synergyType) + ')';
                    }
                }

                let result = this.asSpan(replace, 'value');
                if (range !== null) {
                    result = result + ' ' + this.asSpan(range, 'details');
                }
                
                template = this.replaceAnchor(template, result, this.VALUE_ANCHOR);

                if (value.baseValue !== null && value.valueReal !== null) {
                
                    template = this.replaceAnchor(template, this.asSpan(value.baseValue + '%', 'value'), this.SYNERGY_ANCHOR);
                }
            }
        }

        for (let constant of skill.constants) {
            const anchor = findFirst(template, this.CONSTANT_ANCHORS);
            if (anchor !== null) {
                const constValue = this.asSpan(constant.toString(), 'value');
                template = this.replaceAnchor(template, constValue, anchor);
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
        let result = key;

        if (data !== null) {
            result = data.name;
        } else if (key === 'chance') {
            result = 'Chance';
        } else if (key === 'increased_damage') {
            result = 'Increased Damage';
        } else if (key === 'physical_damage') {
            result = 'Skill Damage';
        } else if (key === 'thorns_damage') {
            result = 'Thorns Damage';
        } else if (key === 'retaliate') {
            result = 'Retaliation';
        } else if (key === 'elemental_damage') {
            result = 'Elemental Damage';
        } else if (key === 'elemental_damage') {
            result = 'Elemental Damage';
        } else if (key === 'additional_damage') {
            result = 'Additional Damage';
        } else if (key === 'weapon_damage') {
            result = 'Reaper Damage';
        } else if (key === 'critical_damage') {
            result = 'Critical Strike Damage';
        } else if (key === 'crit_chance') {
            result = 'Critical Strike Chance';
        } else if (key === 'skill_elem_damage') {
            result = 'Skill and Elemental Damages';
        } else if (key === 'life') {
            result = 'Life';
        } else if (key === 'mana') {
            result = 'Mana';
        } else if (key === 'reduced_damage') {
            result = 'Reduced Damage';
        }

        return result;
    }

    
}