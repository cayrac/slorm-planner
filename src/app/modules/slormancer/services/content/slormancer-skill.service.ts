import { Injectable } from '@angular/core';

import { Buff } from '../../model/content/buff';
import { ClassMechanic } from '../../model/content/class-mechanic';
import { DataSkill } from '../../model/content/data/data-skill';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { HeroClass } from '../../model/content/enum/hero-class';
import { MechanicType } from '../../model/content/enum/mechanic-type';
import { SkillCostType } from '../../model/content/enum/skill-cost-type';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { GameDataSkill } from '../../model/content/game/data/game-data-skill';
import { Mechanic } from '../../model/content/mechanic';
import { Skill } from '../../model/content/skill';
import { SkillType } from '../../model/content/skill-type';
import { SkillUpgrade } from '../../model/content/skill-upgrade';
import { effectValueSynergy, effectValueVariable } from '../../util/effect-value.util';
import { list, round } from '../../util/math.util';
import {
    emptyStringToNull,
    isEffectValueSynergy,
    isFirst,
    isNotNullOrUndefined,
    splitData,
    splitFloatData,
    valueOrDefault,
    valueOrNull,
} from '../../util/utils';
import { SlormancerBuffService } from './slormancer-buff.service';
import { SlormancerClassMechanicService } from './slormancer-class-mechanic.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerMechanicService } from './slormancer-mechanic.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerSkillService {

    private readonly RANK_LABEL = this.slormancerTranslateService.translate('tt_rank');
    private readonly MASTERY_LABEL = this.slormancerTranslateService.translate('tt_mastery');
    private readonly COST_LABEL = this.slormancerTranslateService.translate('tt_cost');
    private readonly COOLDOWN_LABEL = this.slormancerTranslateService.translate('tt_cooldown');
    private readonly SECONDS_LABEL = this.slormancerTranslateService.translate('tt_seconds');

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerMechanicService: SlormancerMechanicService,
                private slormancerClassMechanicService: SlormancerClassMechanicService,
                private slormancerDataService: SlormancerDataService,
                private slormancerBuffService: SlormancerBuffService,
                private slormancerEffectValueService: SlormancerEffectValueService) {
    }

    public getSkillLevelFromXp(heroClass: HeroClass, skill: number, experience: number): number {
        // TODO
        return Math.min(15, experience);
    }

    private isDamageStat(stat: string): boolean {
        return stat === 'physical_damage' || stat === 'elemental_damage' || stat === 'bleed_damage';
    }

    private parseEffectValues(data: GameDataSkill, upgradeType: EffectValueUpgradeType): Array<AbstractEffectValue> {
        const valueBases = splitFloatData(data.DESC_VALUE_BASE);
        const valuePerLevels = splitFloatData(data.DESC_VALUE_PER_LVL);
        const valueTypes = emptyStringToNull(splitData(data.DESC_VALUE_TYPE));
        const valueReals = emptyStringToNull(splitData(data.DESC_VALUE_REAL));
        const stats = emptyStringToNull(splitData(data.DESC_VALUE));

        const max = Math.max(valueBases.length, valuePerLevels.length, valueTypes.length);

        let result: Array<AbstractEffectValue> = [];
        for (let i of list(max)) {
            const type = valueOrNull(valueReals[i]);
            const percent = valueOrNull(valueTypes[i]) === '%';
            const value = valueOrDefault(valueBases[i], 0);
            const upgrade = valueOrDefault(valuePerLevels[i], 0);
            const stat = valueOrDefault(stats[i], null);

            if (stat !== null && this.isDamageStat(stat)) {
                result.push(effectValueSynergy(value, upgrade, upgradeType, false, stat, EffectValueValueType.Damage));
            } else if (type === null) {
                result.push(effectValueVariable(value, upgrade, upgradeType, percent, stat, EffectValueValueType.Stat));
            } else if (type === 'negative') {
                result.push(effectValueVariable(value, -upgrade, upgradeType, percent, stat, EffectValueValueType.Stat));
            } else if (type === 'every_3') {
                result.push(effectValueVariable(value, upgrade, EffectValueUpgradeType.Every3, percent, stat, EffectValueValueType.Stat));
            } else {
                const typeValues = splitData(type, ':');
                const source = <string>typeValues[1];
                if (typeValues[0] === 'based_on_mastery') {
                    result.push(effectValueSynergy(value * 100, 0, upgradeType, percent, 'based_on_mastery_' + source, stat));
                } else {
                    result.push(effectValueSynergy(value, upgrade, upgradeType, percent, source, stat));
                }
            }
        }
        
        return result;
    }

    private applyOverride(skill: Skill | SkillUpgrade | ClassMechanic, overrideData: DataSkill | null) {
    
        if (overrideData !== null) {
            overrideData.override(skill.values);

            if (overrideData.costTypeOverride) {
                if ('costType' in skill) {
                    skill.costType = overrideData.costTypeOverride;
                } else if ('manaCostType' in skill) {
                    skill.manaCostType = overrideData.costTypeOverride
                }
            }

            if (overrideData.additionalGenres && 'genres' in skill && 'baseGenres' in skill) {
                skill.baseGenres.push(...overrideData.additionalGenres)
                skill.genres.push(...overrideData.additionalGenres)
            }
        }
    } 

    public getHeroSkill(skillId: number, heroClass: HeroClass, experience: number, bonusLevel: number = 0): Skill | null {
        const gameDataSkill = this.slormancerDataService.getGameDataSkill(heroClass, skillId);
        const dataSkill = this.slormancerDataService.getDataSkill(heroClass, skillId);
        let skill: Skill | null = null;

        if (gameDataSkill !== null && (gameDataSkill.TYPE == SkillType.Support || gameDataSkill.TYPE === SkillType.Active)) {
            skill = {
                id: gameDataSkill.REF,
                type: gameDataSkill.TYPE,
                heroClass,
                level: 0,
                unlockLevel: gameDataSkill.UNLOCK_LEVEL,
                maxLevel: gameDataSkill.UPGRADE_NUMBER,
                baseLevel: Math.min(gameDataSkill.UPGRADE_NUMBER, this.getSkillLevelFromXp(heroClass, skillId, experience)),
                bonusLevel,
                name: gameDataSkill.EN_NAME,
                specialization: null,
                specializationName: null,
                icon: 'skill/' + heroClass + '/' + gameDataSkill.REF,
                levelIcon: '',
                iconLarge: 'skill/' + heroClass + '/' + gameDataSkill.REF + '_large',
                description: '',
                baseCooldown: round(gameDataSkill.COOLDOWN / 60, 2),
                cooldown: 0,
                precastTime: gameDataSkill.PRECAST_TIME,
                castTime: gameDataSkill.CAST_TIME,
                initialManaCost: gameDataSkill.COST,
                perLevelManaCost: gameDataSkill.COST_LEVEL,
                baseManaCost: 0,
                manaCost: 0,
                baseLifeCost: 0,
                lifeCost: 0,
                baseCostType: <SkillCostType>gameDataSkill.COST_TYPE,
                manaCostType: <SkillCostType>gameDataSkill.COST_TYPE,
                lifeCostType: SkillCostType.None,
                hasLifeCost: false,
                hasManaCost: false,
                hasNoCost: false,
                baseGenres: <Array<SkillGenre>>splitData(gameDataSkill.GENRE, ','),
                genres: <Array<SkillGenre>>splitData(gameDataSkill.GENRE, ','),
                damageTypes: splitData(gameDataSkill.DMG_TYPE, ','),
                locked: false,
                elements: [],

                nameLabel: '',
                genresLabel: null,
                costLabel: null,
                cooldownLabel: null,
                cooldownDetailsLabel: null,
            
                template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameDataSkill),
                values: this.parseEffectValues(gameDataSkill, EffectValueUpgradeType.Mastery)
            };
    
            this.applyOverride(skill, dataSkill);
            skill.specialization = dataSkill === null ? null : valueOrNull(dataSkill.specialization);
    
            this.updateSkillModel(skill);
            this.updateSkillView(skill);
        }

        return skill;
    }

    public getHeroSkillClone(skill: Skill): Skill {
        return { ...skill,
            genres: [...skill.genres],
            damageTypes: [...skill.damageTypes],
            values: skill.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        };
    }

    public updateSkillModel(skill: Skill) {
        skill.level = Math.min(skill.maxLevel, skill.baseLevel) + skill.bonusLevel;
        skill.cooldown = skill.baseCooldown;
        skill.baseManaCost = skill.initialManaCost + skill.perLevelManaCost * skill.level;

        skill.manaCostType = skill.baseCostType;
        skill.lifeCostType = SkillCostType.None;
        
        skill.hasLifeCost = false;
        skill.hasManaCost = skill.manaCostType === SkillCostType.ManaSecond || skill.manaCostType === SkillCostType.ManaLock || skill.manaCostType === SkillCostType.Mana;
        skill.hasNoCost = skill.manaCostType === SkillCostType.None;
        skill.genres = skill.baseGenres.slice(0);

        for (const effectValue of skill.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, skill.level);
        }
    }

    public updateSkillView(skill: Skill) {
        if (skill.specialization !== null) {
            const specialization = this.slormancerDataService.getGameDataSpecializationSkill(skill.heroClass, skill.specialization);
            if (specialization !== null) {
                skill.specializationName = specialization.EN_NAME;
            }
        }
        skill.nameLabel = [skill.specializationName, skill.name].filter(isNotNullOrUndefined).join('<br/>');

        skill.genresLabel =  null;
        if (skill.genres.length > 0) {
            skill.genresLabel = skill.genres
                .map(genre => this.slormancerTranslateService.translate('atk_' + genre))
                .join(' ');
        }
        
        skill.costLabel = null;
        if (!skill.hasNoCost) {
            const costs: Array<string> = [];
                if (skill.hasManaCost) {
                    costs.push(this.slormancerTemplateService.asSpan(skill.manaCost.toString(), 'value mana')
                        + ' ' + this.slormancerTranslateService.translateCostType(skill.manaCostType));
                }
                if (skill.hasLifeCost) {
                    costs.push(this.slormancerTemplateService.asSpan(skill.lifeCost.toString(), 'value life')
                        + ' ' + this.slormancerTranslateService.translateCostType(skill.lifeCostType));
                }

                if (costs.length > 0) {
                    skill.costLabel = this.COST_LABEL + ': <div>' + costs.join('<br/>')  + '</div>';
                }
        }

        skill.cooldownLabel = null;
        skill.cooldownDetailsLabel = null;
        if (skill.baseCooldown > 0) {
            skill.cooldownLabel = this.COOLDOWN_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(skill.cooldown.toString(), 'value')
                + ' ' + this.SECONDS_LABEL;


            const precastSeconds = round(skill.precastTime / 60, 3)
            const castSeconds = round(skill.castTime / 60, 3)
            const estimatedRealCooldown = round(precastSeconds + castSeconds + skill.cooldown, 3);

            skill.cooldownDetailsLabel = 'Precast time : ' + precastSeconds + 's (' + skill.precastTime + '/60)'
                + "\n" + 'Cast time : ' + castSeconds + 's (' + skill.castTime + '/60)' 
                + "\n" + 'Estimated time between casts : ' + estimatedRealCooldown + 's'
        }
        
        skill.description = this.slormancerTemplateService.formatSkillDescription(skill.template, skill.values);
        skill.levelIcon = 'level/' + Math.max(1, skill.baseLevel);
    }

    public getClassMechanicClone(mechanic: ClassMechanic): ClassMechanic {
        return {
            ...mechanic,
            values: mechanic.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        };
    }

    public getMechanicClone(mechanic: Mechanic): Mechanic {
        return { ...mechanic };
    }

    public getBuffClone(buff: Buff): Buff {
        return { ...buff };
    }

    public getUpgradeClone(upgrade: SkillUpgrade): SkillUpgrade {
        return { ...upgrade,
            genres: [...upgrade.genres],
            damageTypes: [...upgrade.damageTypes],

            relatedClassMechanics: upgrade.relatedClassMechanics.map(mechanic => this.slormancerClassMechanicService.getClassMechanicClone(mechanic)),
            relatedMechanics: upgrade.relatedMechanics.map(mechanic => this.slormancerMechanicService.getMechanicClone(mechanic)),
            relatedBuffs: upgrade.relatedBuffs.map(buff => this.getBuffClone(buff)),
        
            template: upgrade.template,
            values: upgrade.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        };
    }

    public getUpgrade(upgradeId: number, heroClass: HeroClass, baseRank: number): SkillUpgrade | null {
        const gameDataSkill = this.slormancerDataService.getGameDataSkill(heroClass, upgradeId);
        const dataSkill = this.slormancerDataService.getDataSkill(heroClass, upgradeId);
        let upgrade: SkillUpgrade | null = null;

        if (gameDataSkill !== null && (gameDataSkill.TYPE == SkillType.Passive || gameDataSkill.TYPE === SkillType.Upgrade)) {
            const parentSkill = this.slormancerDataService.getGameDataSkill(heroClass, gameDataSkill.ACTIVE_BOX);
            const values = this.parseEffectValues(gameDataSkill, EffectValueUpgradeType.UpgradeRank);
            const masteryRequired = dataSkill === null ? 0 : valueOrDefault(dataSkill.masteryRequired, 0);
            const line = ((parentSkill !== null && parentSkill.TYPE === SkillType.Support) ? masteryRequired : Math.ceil(masteryRequired / 2))

            upgrade = {
                id: gameDataSkill.REF,
                skillId: gameDataSkill.ACTIVE_BOX,
                masteryRequired,
                line,
                type: gameDataSkill.TYPE,
                rank: 0,
                upgradeLevel: gameDataSkill.UNLOCK_LEVEL,
                maxRank: gameDataSkill.UPGRADE_NUMBER,
                baseRank: Math.min(gameDataSkill.UPGRADE_NUMBER, baseRank),
                name: gameDataSkill.EN_NAME,
                icon: 'assets/img/icon/skill/' + heroClass + '/' + gameDataSkill.REF + '.png',
                description: '',
                initialCost: gameDataSkill.COST,
                perLevelCost: gameDataSkill.COST_LEVEL,
                baseCost: 0,
                cost: 0,
                costType: <SkillCostType>gameDataSkill.COST_TYPE,
                hasLifeCost: false,
                hasManaCost: false,
                hasNoCost: false,
                genres: <Array<SkillGenre>>splitData(gameDataSkill.GENRE, ','),
                damageTypes: splitData(gameDataSkill.DMG_TYPE, ','),

                masteryLabel: null,
                rankLabel: null,
                genresLabel: null,
                costLabel: null,

                relatedClassMechanics: this.extractSkillMechanics(gameDataSkill.EN_DESCRIPTION, heroClass, dataSkill === null ? [] : dataSkill.additionalClassMechanics),
                relatedMechanics: [],
                relatedBuffs: this.extractBuffs(gameDataSkill.EN_DESCRIPTION),
            
                template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameDataSkill),
                values
            };
    
            this.applyOverride(upgrade, dataSkill);

            upgrade.relatedMechanics = this.extractMechanics(gameDataSkill.EN_DESCRIPTION, values, dataSkill !== null && dataSkill.additionalMechanics ? dataSkill.additionalMechanics : []);
    
            this.updateUpgradeModel(upgrade);
            this.updateUpgradeView(upgrade);
        }

        return upgrade;
    }

    private extractBuffs(template: string): Array<Buff> {
        return valueOrDefault(template.match(/<(.*?)>/g), [])
            .map(m => this.slormancerDataService.getDataSkillBuff(m))
            .filter(isNotNullOrUndefined)
            .filter(isFirst)
            .map(ref => this.slormancerBuffService.getBuff(ref))
            .filter(isNotNullOrUndefined);
    }
    
    private extractSkillMechanics(template: string, heroClass: HeroClass, additionalSkillMechanics: Array<number>): Array<ClassMechanic> {
        const ids = valueOrDefault(template.match(/<(.*?)>/g), [])
            .map(m => this.slormancerDataService.getDataSkillClassMechanicIdByName(heroClass, m));
        return [ ...ids, ...additionalSkillMechanics ]
            .filter(isNotNullOrUndefined)
            .filter(isFirst)
            .map(id => this.slormancerClassMechanicService.getClassMechanic(heroClass, id))
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
            .map(type => this.slormancerMechanicService.getMechanic(type));
    }

    public updateUpgradeModel(upgrade: SkillUpgrade) {
        upgrade.rank = Math.min(upgrade.maxRank, upgrade.baseRank);
        upgrade.baseCost = upgrade.initialCost + upgrade.perLevelCost * Math.max(upgrade.rank, 1);
        upgrade.cost = upgrade.baseCost;

        upgrade.hasLifeCost = upgrade.costType === SkillCostType.LifeSecond || upgrade.costType === SkillCostType.LifeLock || upgrade.costType === SkillCostType.Life;
        upgrade.hasManaCost = upgrade.costType === SkillCostType.ManaSecond || upgrade.costType === SkillCostType.ManaLock || upgrade.costType === SkillCostType.Mana;
        upgrade.hasNoCost = upgrade.costType === SkillCostType.None || upgrade.baseCost === 0;

        for (const effectValue of upgrade.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, upgrade.rank);
        }
    }

    public updateUpgradeView(upgrade: SkillUpgrade) {
        upgrade.masteryLabel =  this.MASTERY_LABEL + ' ' + upgrade.masteryRequired;
        upgrade.rankLabel =  this.RANK_LABEL + ': ' + this.slormancerTemplateService.asSpan(upgrade.rank.toString(), 'current') + '/' + upgrade.maxRank;
        
        upgrade.genresLabel =  null;
        if (upgrade.genres.length > 0) {
            upgrade.genresLabel = upgrade.genres
                .map(genre => this.slormancerTranslateService.translate('atk_' + genre))
                .join(' ');
        }
        
        upgrade.costLabel = null;
        if (!upgrade.hasNoCost) {
            upgrade.costLabel = this.COST_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(upgrade.cost.toString(), upgrade.hasManaCost ? 'value mana' : 'value life')
                + ' ' + this.slormancerTranslateService.translate('tt_' + upgrade.costType);
        }
        
        upgrade.description = this.slormancerTemplateService.formatUpgradeDescription(upgrade.template, upgrade.values);
    }
}