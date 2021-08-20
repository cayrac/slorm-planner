import { Injectable } from '@angular/core';

import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { HeroClass } from '../model/enum/hero-class';
import { SkillCostType } from '../model/enum/skill-cost-type';
import { SkillGenre } from '../model/enum/skill-genre';
import { GameDataSkill } from '../model/game/data/game-data-skill';
import { Skill } from '../model/skill';
import { list, round } from '../util/math.util';
import { emptyStringToNull, removeEmptyValues, splitData, splitFloatData, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerSkillService {

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerDataService: SlormancerDataService) { }

    private isDamageStat(stat: string): boolean {
        return stat === 'physical_damage' || stat === 'elemental_damage' || stat === 'bleed_damage';
    }

    private parseEffectValues(data: GameDataSkill): Array<AbstractEffectValue> {
        const valueBases = splitFloatData(data.DESC_VALUE_BASE);
        const valuePerLevels = splitFloatData(data.DESC_VALUE_PER_LVL);
        const valueTypes = emptyStringToNull(splitData(data.DESC_VALUE_TYPE));
        const valueReals = emptyStringToNull(splitData(data.DESC_VALUE_REAL));
        const stats = emptyStringToNull(splitData(data.DESC_VALUE));
        const damageTypes = removeEmptyValues(splitData(data.DMG_TYPE));

        console.log('DMG_TYPE')

        const max = Math.max(valueBases.length, valuePerLevels.length, valueTypes.length);

        let result: Array<AbstractEffectValue> = [];
        for (let i of list(max)) {
            const type = valueOrNull(valueReals[i]);
            const percent = valueOrNull(valueTypes[i]) === '%';
            const value = valueOrDefault(valueBases[i], 0);
            const upgrade = valueOrDefault(valuePerLevels[i], 0);
            const stat = valueOrDefault(stats[i], null);

            if (stat !== null && this.isDamageStat(stat)) {
                const damageType = valueOrDefault(damageTypes.splice(0, 1)[0], 'phy');

                result.push({
                    type: EffectValueType.Synergy,
                    ratio: value,
                    upgrade,
                    upgradeType: EffectValueUpgradeType.Reinforcment,
                    source: damageType === 'phy' ? 'physical_damage' : 'elemental_damage',
                    valueType: EffectValueValueType.Damage,
                    range: false,
                    stat
                } as EffectValueSynergy);

            } else if (type === null) {
                result.push({
                    type: EffectValueType.Variable,
                    value,
                    upgrade,
                    percent,
                    range: false,
                    stat
                } as EffectValueVariable);
            } else if (type === 'every_3') {
                result.push({
                    type: EffectValueType.Variable,
                    value,
                    upgrade,
                    upgradeType: EffectValueUpgradeType.Every3,
                    percent,
                    range: false,
                    stat
                } as EffectValueVariable);
            } else {
                const typeValues = splitData(type, ':');
                const source = valueOrNull(typeValues[1]);

                result.push({
                    type: EffectValueType.Synergy,
                    ratio: value,
                    upgrade,
                    source,
                    range: false,
                    stat
                } as EffectValueSynergy);
            }
        }
        
        return result;
    }

    public getSkill(gameData: GameDataSkill, heroClass: HeroClass, baseLevel: number, bonusLevel: number = 0): Skill {
        const dataSkill = this.slormancerDataService.getDataSkill(gameData.REF);
        const skill: Skill = {
            id: gameData.REF,
            level: 0,
            maxLevel: gameData.UPGRADE_NUMBER,
            baseLevel: Math.min(gameData.UPGRADE_NUMBER, baseLevel),
            bonusLevel,
            name: gameData.EN_NAME,
            icon: 'skill/' + heroClass + '/' + gameData.REF,
            description: '',
            baseCooldown: gameData.COOLDOWN,
            cooldown: 0,
            baseCost: gameData.COST,
            perLevelCost: gameData.COST_LEVEL,
            cost: 0,
            costType: <SkillCostType>gameData.COST_TYPE,
            hasLifeCost: false,
            hasManaCost: false,
            hasNoCost: false,
            damageTypes: splitData(gameData.DMG_TYPE, ','),
            genres: <Array<SkillGenre>>splitData(gameData.GENRE, ','),
        
            template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameData),
            values: this.parseEffectValues(gameData)
        };

        if (dataSkill !== null) {
            dataSkill.override(skill.values);
        }

        this.updateSkill(skill);

        return skill;
    }

    public updateSkill(skill: Skill) {
        skill.level = Math.min(skill.maxLevel, skill.baseLevel) + skill.bonusLevel;
        skill.description = this.slormancerTemplateService.formatSkillDescription(skill.template, skill.values, skill.level);
        skill.cooldown = round(skill.baseCooldown / 60, 2);
        skill.cost = skill.baseCost + skill.perLevelCost * skill.level;

        skill.hasLifeCost = skill.costType === SkillCostType.LifeSecond || skill.costType === SkillCostType.LifeLock || skill.costType === SkillCostType.Life;
        skill.hasManaCost = skill.costType === SkillCostType.ManaSecond || skill.costType === SkillCostType.ManaLock || skill.costType === SkillCostType.Mana;
        skill.hasNoCost = skill.costType === SkillCostType.None;
    }
}