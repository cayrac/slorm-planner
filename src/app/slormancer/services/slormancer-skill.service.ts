import { Injectable } from '@angular/core';

import { Buff } from '../model/buff';
import { DataSkill } from '../model/data/data-skill';
import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { HeroClass } from '../model/enum/hero-class';
import { MechanicType } from '../model/enum/mechanic-type';
import { SkillCostType } from '../model/enum/skill-cost-type';
import { SkillGenre } from '../model/enum/skill-genre';
import { GameDataSkill } from '../model/game/data/game-data-skill';
import { Mechanic } from '../model/mechanic';
import { Skill } from '../model/skill';
import { SkillClassMechanic } from '../model/skill-class-mechanic';
import { SkillType } from '../model/skill-type';
import { SkillUpgrade } from '../model/skill-upgrade';
import { list, round } from '../util/math.util';
import {
    emptyStringToNull,
    isEffectValueSynergy,
    isEffectValueVariable,
    isFirst,
    isNotNullOrUndefined,
    removeEmptyValues,
    splitData,
    splitFloatData,
    valueOrDefault,
    valueOrNull,
} from '../util/utils';
import { SlormancerBuffService } from './slormancer-buff.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerMechanicService } from './slormancer-mechanic.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerSkillService {

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerMechanicService: SlormancerMechanicService,
                private slormancerDataService: SlormancerDataService,
                private slormancerBuffService: SlormancerBuffService) { }

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
                    percent,
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
            } else if (type === 'negative') {
                result.push({
                    type: EffectValueType.Variable,
                    value,
                    upgrade: -upgrade,
                    upgradeType: EffectValueUpgradeType.Reinforcment,
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
                    percent,
                    upgrade,
                    source,
                    range: false,
                    stat
                } as EffectValueSynergy);
            }
        }
        
        return result;
    }

    private applyOverride(skill: Skill | SkillUpgrade | SkillClassMechanic, overrideData: DataSkill | null) {
    
        if (overrideData !== null) {
            overrideData.override(skill.values);

            if (overrideData.costTypeOverride && (<Skill | SkillUpgrade>skill).costType) {
                (<Skill | SkillUpgrade>skill).costType = overrideData.costTypeOverride;
            }
        }
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
                damageTypes: splitData(gameDataSkill.DMG_TYPE, ','),
            
                template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameDataSkill),
                values: this.parseEffectValues(gameDataSkill)
            };
    
            this.applyOverride(skill, dataSkill);
    
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
            const values = this.parseEffectValues(gameDataSkill);
            upgrade = {
                id: gameDataSkill.REF,
                skillId: gameDataSkill.ACTIVE_BOX,
                masteryRequired: dataSkill === null ? null : dataSkill.masteryRequired,
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
                damageTypes: splitData(gameDataSkill.DMG_TYPE, ','),

                nextRankDescription: [],
                maxRankDescription: [],
                // prévoir de déplacer ça dans upgrade quand je ferais refonte templates
                relatedClassMechanics: this.extractSkillMechanics(gameDataSkill.EN_DESCRIPTION, heroClass, dataSkill === null ? [] : dataSkill.additionalClassMechanics),
                relatedMechanics: [],
                relatedBuffs: this.extractBuffs(gameDataSkill.EN_DESCRIPTION),
            
                template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameDataSkill),
                values: values
            };
    
            this.applyOverride(upgrade, dataSkill);

            upgrade.relatedMechanics = this.extractMechanics(gameDataSkill.EN_DESCRIPTION, values, dataSkill !== null && dataSkill.additionalMechanics ? dataSkill.additionalMechanics : []);
    
            this.updateUpgrade(upgrade);
        }

        return upgrade;
    }

    private getNextRankUpgradeDescription(upgrade: SkillUpgrade, rank: number): Array<string> {
        const skill = [];

        const cost = upgrade.baseCost + upgrade.perLevelCost * rank;
        if (cost > 0 && upgrade.perLevelCost !== 0) {
            const costClass = upgrade.hasLifeCost ? 'life' : 'mana';
            const description = '<span class="' + costClass + '">' + cost + '</span> ' + this.slormancerTemplateService.translate(upgrade.costType);
            skill.push(description);
        }

        const attributes = upgrade.values
            .filter(value => isEffectValueSynergy(value) || isEffectValueVariable(value))
            .filter(value => (<EffectValueSynergy | EffectValueVariable>value).upgrade !== 0)
            .map(value => this.slormancerTemplateService.formatNextRankDescription('@ £', <EffectValueSynergy | EffectValueVariable>value, rank));

        return [ ...skill, ...attributes ]
    }

    private extractBuffs(template: string): Array<Buff> {
        return valueOrDefault(template.match(/<(.*?)>/g), [])
            .map(m => this.slormancerDataService.getDataSkillBuff(m))
            .filter(isNotNullOrUndefined)
            .filter(isFirst)
            .map(ref => this.slormancerBuffService.getBuff(ref))
            .filter(isNotNullOrUndefined);
    }
    private extractSkillMechanics(template: string, heroClass: HeroClass, additionalSkillMechanics: Array<number>): Array<SkillClassMechanic> {
        const ids = valueOrDefault(template.match(/<(.*?)>/g), [])
            .map(m => this.slormancerDataService.getDataSkillClassMechanicIdByName(heroClass, m));
        return [ ...ids, ...additionalSkillMechanics ]
            .filter(isNotNullOrUndefined)
            .filter(isFirst)
            .map(id => this.getClassMechanic(id, heroClass))
            .filter(isNotNullOrUndefined);
    }

    private extractMechanics(template: string, values: Array<AbstractEffectValue>, additional: Array<MechanicType>): Array<Mechanic> {
        const templateMechanics = valueOrDefault(template.match(/<(.*?)>/g), [])
            .map(m => this.slormancerDataService.getDataTemplateMechanic(m))
        const attributeMechanics = values.map(value => value.stat)
            .filter(isNotNullOrUndefined)
            .map(stat => this.slormancerDataService.getDataAttributeMechanic(stat))
        const synergyMechanics = values
            .filter(isEffectValueSynergy)
            .map(value => this.slormancerDataService.getDataAttributeMechanic(value.source))

        return [ ...attributeMechanics, ...synergyMechanics, ...templateMechanics, ...additional ]
            .filter(isNotNullOrUndefined)
            .filter(isFirst)
            .map(mechanic => this.slormancerMechanicService.getMechanic(mechanic));
    }

    public updateUpgrade(upgrade: SkillUpgrade) {
        upgrade.rank = Math.min(upgrade.maxRank, upgrade.baseRank);
        upgrade.description = this.slormancerTemplateService.formatUpgradeDescription(upgrade.template, upgrade.values, Math.max(upgrade.rank, 1));
        upgrade.cost = upgrade.baseCost + upgrade.perLevelCost * Math.max(upgrade.rank, 1);

        upgrade.hasLifeCost = upgrade.costType === SkillCostType.LifeSecond || upgrade.costType === SkillCostType.LifeLock || upgrade.costType === SkillCostType.Life;
        upgrade.hasManaCost = upgrade.costType === SkillCostType.ManaSecond || upgrade.costType === SkillCostType.ManaLock || upgrade.costType === SkillCostType.Mana;
        upgrade.hasNoCost = upgrade.costType === SkillCostType.None || upgrade.cost === 0;

        upgrade.nextRankDescription = [];
        upgrade.maxRankDescription = [];

        if (upgrade.maxRank > 1) {
            upgrade.nextRankDescription = this.getNextRankUpgradeDescription(upgrade, Math.min(upgrade.maxRank, upgrade.rank + 1));
            upgrade.maxRankDescription = this.getNextRankUpgradeDescription(upgrade, upgrade.maxRank);
        }
    }

    public getClassMechanic(mechanicId: number, heroClass: HeroClass): SkillClassMechanic | null {
        const gameDataSkill = this.slormancerDataService.getGameDataSkill(heroClass, mechanicId);
        const dataSkill = this.slormancerDataService.getDataSkill(heroClass, mechanicId);
        let mechanic: SkillClassMechanic | null = null;

        if (gameDataSkill !== null && (gameDataSkill.TYPE == SkillType.Mechanic || gameDataSkill.TYPE === SkillType.Mechanics)) {
            mechanic = {
                id: gameDataSkill.REF,
                type: gameDataSkill.TYPE,
                name: gameDataSkill.EN_NAME,
                icon: 'skill/' + heroClass + '/' + gameDataSkill.REF,
                description: '',
            
                template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameDataSkill),
                values: this.parseEffectValues(gameDataSkill)
            };

            this.applyOverride(mechanic, dataSkill);
    
            this.updateClassMechanic(mechanic);
        }

        return mechanic;
    }

    public updateClassMechanic(upgrade: SkillClassMechanic) {
        upgrade.description = this.slormancerTemplateService.formatSkillDescription(upgrade.template, upgrade.values, 0);
    }
}