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
import { SkillType } from '../model/skill-type';
import { SkillUpgrade } from '../model/skill-upgrade';
import { list, round } from '../util/math.util';
import {
    emptyStringToNull,
    isEffectValueVariable,
    removeEmptyValues,
    splitData,
    splitFloatData,
    valueOrDefault,
    valueOrNull,
} from '../util/utils';
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

    public getSkill(skillId: number, heroClass: HeroClass, baseLevel: number, bonusLevel: number = 0): Skill | null {
        const gameDataSkill = this.slormancerDataService.getGameDataSkill(heroClass, skillId);
        const dataSkill = this.slormancerDataService.getDataSkill(heroClass, skillId);
        let skill: Skill | null = null;

        if (gameDataSkill !== null && (gameDataSkill.TYPE == SkillType.Support || gameDataSkill.TYPE === SkillType.Active)) {
            skill = {
                id: gameDataSkill.REF,
                type: gameDataSkill.TYPE,
                level: 0,
                unlockLevel: gameDataSkill.UNLOCK_LEVEL,
                maxLevel: gameDataSkill.UPGRADE_NUMBER,
                baseLevel: Math.min(gameDataSkill.UPGRADE_NUMBER, baseLevel),
                bonusLevel,
                name: gameDataSkill.EN_NAME,
                icon: 'skill/' + heroClass + '/' + gameDataSkill.REF,
                description: '',
                baseCooldown: gameDataSkill.COOLDOWN,
                cooldown: 0,
                baseCost: gameDataSkill.COST,
                perLevelCost: gameDataSkill.COST_LEVEL,
                cost: 0,
                costType: <SkillCostType>gameDataSkill.COST_TYPE,
                hasLifeCost: false,
                hasManaCost: false,
                hasNoCost: false,
                genres: <Array<SkillGenre>>splitData(gameDataSkill.GENRE, ','),
            
                template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameDataSkill),
                values: this.parseEffectValues(gameDataSkill)
            };
    
            if (dataSkill !== null) {
                dataSkill.override(skill.values);
            }
    
            this.updateSkill(skill);
        }

        return skill;
    }

    public updateSkill(skill: Skill) {
        skill.level = Math.min(skill.maxLevel, skill.baseLevel) + skill.bonusLevel;
        skill.description = this.slormancerTemplateService.formatSkillDescription(skill.template, skill.values, skill.level);
        skill.cooldown = round(skill.baseCooldown / 60, 2);
        skill.cost = skill.baseCost + skill.perLevelCost * skill.level;

        skill.hasLifeCost = skill.costType === SkillCostType.LifeSecond || skill.costType === SkillCostType.LifeLock || skill.costType === SkillCostType.Life;
        skill.hasManaCost = skill.costType === SkillCostType.ManaSecond || skill.costType === SkillCostType.ManaLock || skill.costType === SkillCostType.Mana;
        skill.hasNoCost = skill.costType === SkillCostType.None || skill.cost === 0;
    }

    public getUpgrade(upgradeId: number, heroClass: HeroClass, baseRank: number): SkillUpgrade | null {
        const gameDataSkill = this.slormancerDataService.getGameDataSkill(heroClass, upgradeId);
        const dataSkill = this.slormancerDataService.getDataSkill(heroClass, upgradeId);
        let upgrade: SkillUpgrade | null = null;

        if (gameDataSkill !== null && (gameDataSkill.TYPE == SkillType.Passive || gameDataSkill.TYPE === SkillType.Upgrade)) {
            upgrade = {
                id: gameDataSkill.REF,
                skillId: gameDataSkill.ACTIVE_BOX,
                type: gameDataSkill.TYPE,
                rank: 0,
                upgradeLevel: gameDataSkill.UNLOCK_LEVEL,
                maxRank: gameDataSkill.UPGRADE_NUMBER,
                baseRank: Math.min(gameDataSkill.UPGRADE_NUMBER, baseRank),
                name: gameDataSkill.EN_NAME,
                icon: 'skill/' + heroClass + '/' + gameDataSkill.REF,
                description: '',
                baseCost: gameDataSkill.COST,
                perLevelCost: gameDataSkill.COST_LEVEL,
                cost: 0,
                costType: <SkillCostType>gameDataSkill.COST_TYPE,
                hasLifeCost: false,
                hasManaCost: false,
                hasNoCost: false,
                genres: <Array<SkillGenre>>splitData(gameDataSkill.GENRE, ','),

                nextRankDescription: [],
                maxRankDescription: [],
            
                template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameDataSkill),
                values: this.parseEffectValues(gameDataSkill)
            };
    
            if (dataSkill !== null) {
                dataSkill.override(upgrade.values);
            }
    
            this.updateUpgrade(upgrade);
        }

        return upgrade;
    }

    private getNextRankUpgradeDescription(upgrade: SkillUpgrade, rank: number): Array<string> {
        return upgrade.values
            .filter(isEffectValueVariable)
            .map(value => this.slormancerTemplateService.formatNextRankDescription('@ £', value, rank));
    }

    public updateUpgrade(upgrade: SkillUpgrade) {
        upgrade.rank = Math.min(upgrade.maxRank, upgrade.baseRank);
        upgrade.description = this.slormancerTemplateService.formatSkillDescription(upgrade.template, upgrade.values, Math.max(upgrade.rank, 1));
        upgrade.cost = upgrade.baseCost + upgrade.perLevelCost * upgrade.rank;

        upgrade.hasLifeCost = upgrade.costType === SkillCostType.LifeSecond || upgrade.costType === SkillCostType.LifeLock || upgrade.costType === SkillCostType.Life;
        upgrade.hasManaCost = upgrade.costType === SkillCostType.ManaSecond || upgrade.costType === SkillCostType.ManaLock || upgrade.costType === SkillCostType.Mana;
        upgrade.hasNoCost = upgrade.costType === SkillCostType.None || upgrade.cost === 0;

        upgrade.nextRankDescription = this.getNextRankUpgradeDescription(upgrade, Math.min(upgrade.maxRank, upgrade.rank + 1));
        upgrade.maxRankDescription = this.getNextRankUpgradeDescription(upgrade, upgrade.maxRank);
    }
}