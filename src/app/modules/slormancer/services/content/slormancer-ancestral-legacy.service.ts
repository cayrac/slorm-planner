import { Injectable } from '@angular/core';

import { AncestralLegacy } from '../../model/content/ancestral-legacy';
import { AncestralLegacyElement } from '../../model/content/ancestral-legacy-element';
import { AncestralLegacyType } from '../../model/content/ancestral-legacy-type';
import { Buff } from '../../model/content/buff';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { MechanicType } from '../../model/content/enum/mechanic-type';
import { SkillCostType } from '../../model/content/enum/skill-cost-type';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { GameDataAncestralLegacy } from '../../model/content/game/data/game-data-ancestral-legacy';
import { Mechanic } from '../../model/content/mechanic';
import { effectValueSynergy, effectValueVariable } from '../../util/effect-value.util';
import { list } from '../../util/math.util';
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
} from '../../util/utils';
import { SlormancerBuffService } from './slormancer-buff.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerMechanicService } from './slormancer-mechanic.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerAncestralLegacyService {

    private readonly ACTIVE_PREFIX = 'active_skill_add';
    private readonly COST_LABEL = this.slormancerTranslateService.translate('tt_cost');
    private readonly COOLDOWN_LABEL = this.slormancerTranslateService.translate('tt_cooldown');
    private readonly SECONDS_LABEL = this.slormancerTranslateService.translate('tt_seconds');
    private readonly RANK_LABEL = this.slormancerTranslateService.translate('tt_rank');

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerBuffService: SlormancerBuffService,
                private slormancerEffectValueService: SlormancerEffectValueService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerMechanicService: SlormancerMechanicService) { }
           
    private isActivable(types: Array<AncestralLegacyType>): boolean {
        return types.indexOf(AncestralLegacyType.Active) !== -1;
    }
                
    private isDamageStat(stat: string): boolean {
        return stat === 'physical_damage' || stat === 'elemental_damage' || stat === 'bleed_damage';
    }
            
    private parseEffectValues(data: GameDataAncestralLegacy): Array<AbstractEffectValue> {
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
            const baseValue = valueOrDefault(valueBases[i], 0);
            const upgrade = valueOrDefault(valuePerLevels[i], 0);
            const stat = valueOrDefault(stats[i], null);

            if (stat !== null && this.isDamageStat(stat)) {
                const damageType = valueOrDefault(damageTypes.splice(0, 1)[0], 'phy');
                const source = damageType === 'phy' ? 'physical_damage' : 'elemental_damage';
                result.push(effectValueSynergy(baseValue, upgrade, EffectValueUpgradeType.AncestralRank, percent, source, EffectValueValueType.Damage));
            } else if (type === null) {
                result.push(effectValueVariable(baseValue, upgrade, EffectValueUpgradeType.AncestralRank, percent, stat));
            } else if (type === 'negative') {
                result.push(effectValueVariable(baseValue, -upgrade, EffectValueUpgradeType.AncestralRank, percent, stat));
            } else {
                const typeValues = splitData(type, ':');
                const source = <string>typeValues[1];
                result.push(effectValueSynergy(baseValue, upgrade, EffectValueUpgradeType.AncestralRank, percent, source));
            }
        }
        
        return result;
    }    
    
    private getNextRankUpgradeDescription(ancestralLegacy: AncestralLegacy, rank: number): Array<string> {
        const skills = [];

        const cost = ancestralLegacy.baseCost === null ? null : ancestralLegacy.baseCost + (ancestralLegacy.costPerRank === null ? 0 : ancestralLegacy.costPerRank * rank);
        if (cost !== null && cost > 0 && ancestralLegacy.costPerRank !== null && ancestralLegacy.costPerRank !== 0) {
            const costClass = ancestralLegacy.hasLifeCost ? 'life' : 'mana';
            const description = '<span class="' + costClass + '">' + cost + '</span> ' + this.slormancerTranslateService.translate(ancestralLegacy.costType);
            skills.push(description);
        }

        const attributes = ancestralLegacy.values
            .filter(value => (isEffectValueSynergy(value) || isEffectValueVariable(value)) && value.upgrade !== 0)
            .map(value => this.slormancerEffectValueService.updateEffectValue(value, rank))
            .map(value => this.slormancerTemplateService.formatNextRankDescription('@ £', value));

        return [ ...skills, ...attributes ]
    }

    private extractBuffs(template: string): Array<Buff> {
        return valueOrDefault(template.match(/<(.*?)>/g), [])
            .map(m => this.slormancerDataService.getDataSkillBuff(m))
            .filter(isNotNullOrUndefined)
            .filter(isFirst)
            .map(ref => this.slormancerBuffService.getBuff(ref))
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

    public isAvailable(ref: number): boolean {
        return this.slormancerDataService.getGameDataAncestralLegacyIds().indexOf(ref) !== -1;
    }

    public getAncestralLegacy(ref: number, rank: number, bonusRank: number = 0): AncestralLegacy | null {
        const gameData = this.slormancerDataService.getGameDataAncestralLegacy(ref);
        let ancestralLegacy: AncestralLegacy | null = null;

        if (gameData !== null) {
            const data = this.slormancerDataService.getDataAncestralLegacy(ref);
            const values = this.parseEffectValues(gameData);
            ancestralLegacy = {
                id: ref,
                name: gameData.EN_NAME,
                icon: 'assets/img/icon/legacy/' + ref + '.png',
                description: '',
                types: <Array<AncestralLegacyType>>splitData(gameData.TYPE, ','),
                element: <AncestralLegacyElement>gameData.REALM_COLOR,
                damageTypes: splitData(gameData.DMG_TYPE, ','),
                sealMerge: gameData.SEAL_MERGE,
                cooldown: null,
                baseCooldown: gameData.COOLDOWN,
                auraBuff: gameData.AURA_BUFF_NAME === null ? null : this.slormancerBuffService.getBuff(gameData.AURA_BUFF_NAME),
                genres: <Array<SkillGenre>>splitData(gameData.GENRE, ","),
                cost: null,
                baseCost: gameData.COST,
                costPerRank: gameData.COST_LEVEL,
                costType: <SkillCostType>gameData.COST_TYPE,
                rank: 0,
                baseRank: rank,
                bonusRank: bonusRank,
                maxRank: gameData.UPGRADE_NUMBER,
                hasLifeCost: false,
                hasManaCost: false,
                hasNoCost: false,
                realm: gameData.REALM,
                links: data === null ? [] : data.links,

                nextRankDescription: [],
                maxRankDescription: [],

                relatedBuffs: this.extractBuffs(gameData.EN_DESCRIPTION),
                relatedMechanics: this.extractMechanics(gameData.EN_DESCRIPTION, values, data !== null && data.additionalMechanics ? data.additionalMechanics : []),

                typeLabel: '',
                costLabel: null,
                cooldownLabel: null,
                genresLabel: null,
                rankLabel: '',

                template: this.slormancerTemplateService.prepareAncestralLegacyDescriptionTemplate(gameData),
                values
            }

            if (data !== null && data.override) {
                data.override(ancestralLegacy.values);
            }

            this.updateAncestralLegacy(ancestralLegacy);
        }

        return ancestralLegacy;
    }

    public updateAncestralLegacy(ancestralLegacy: AncestralLegacy) {
        ancestralLegacy.baseRank = Math.min(ancestralLegacy.maxRank, Math.max(0, ancestralLegacy.baseRank));
        ancestralLegacy.bonusRank = Math.max(0, ancestralLegacy.bonusRank);
        ancestralLegacy.rank = ancestralLegacy.bonusRank + ancestralLegacy.baseRank;
        ancestralLegacy.cost = ancestralLegacy.baseCost === null ? null : ancestralLegacy.baseCost + (ancestralLegacy.costPerRank === null ? 0 : ancestralLegacy.costPerRank * ancestralLegacy.rank);
        ancestralLegacy.cooldown = ancestralLegacy.baseCooldown;

        ancestralLegacy.hasLifeCost = ancestralLegacy.costType === SkillCostType.LifePercent || ancestralLegacy.costType === SkillCostType.LifeSecond || ancestralLegacy.costType === SkillCostType.LifeLock || ancestralLegacy.costType === SkillCostType.Life;
        ancestralLegacy.hasManaCost = ancestralLegacy.costType === SkillCostType.ManaPercent || ancestralLegacy.costType === SkillCostType.ManaSecond || ancestralLegacy.costType === SkillCostType.ManaLock || ancestralLegacy.costType === SkillCostType.Mana;
        ancestralLegacy.hasNoCost = ancestralLegacy.costType === SkillCostType.None || ancestralLegacy.cost === 0;

        for (const effectValue of ancestralLegacy.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, ancestralLegacy.rank);
        }

        ancestralLegacy.genresLabel =  null;
        if (ancestralLegacy.genres.length > 0) {
            ancestralLegacy.genresLabel = ancestralLegacy.genres
                .map(genre => this.slormancerTranslateService.translate(genre))
                .join(' ');
        }
        
        ancestralLegacy.costLabel = null;
        if (!ancestralLegacy.hasNoCost && ancestralLegacy.cost !== null) {
            ancestralLegacy.costLabel = this.COST_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(ancestralLegacy.cost.toString(), ancestralLegacy.hasManaCost ? 'value mana' : 'value life')
                + ' ' + this.slormancerTranslateService.translate(ancestralLegacy.costType);
        }

        ancestralLegacy.cooldownLabel = null;
        if (ancestralLegacy.cooldown !== null && ancestralLegacy.cooldown > 0) {
            ancestralLegacy.cooldownLabel = this.COOLDOWN_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(ancestralLegacy.cooldown.toString(), 'value')
                + ' ' + this.SECONDS_LABEL;
        }

        ancestralLegacy.typeLabel = this.slormancerTranslateService.translate('element_' + ancestralLegacy.element) + ' - '
             + ancestralLegacy.types.map(type =>  this.slormancerTranslateService.translate('tt_' + type)).join(', ');
        ancestralLegacy.rankLabel = this.RANK_LABEL + ': ' + this.slormancerTemplateService.asSpan(ancestralLegacy.rank.toString(), 'current') + '/' + ancestralLegacy.maxRank;
        
        const descriptionPrefix = this.isActivable(ancestralLegacy.types) ? this.slormancerTranslateService.translate(this.ACTIVE_PREFIX) + '<br/>' : '';
        ancestralLegacy.description = descriptionPrefix + this.slormancerTemplateService.formatUpgradeDescription(ancestralLegacy.template, ancestralLegacy.values);
        
        ancestralLegacy.nextRankDescription = [];
        ancestralLegacy.maxRankDescription = [];
        if (ancestralLegacy.maxRank > 1 && ancestralLegacy.baseRank < ancestralLegacy.maxRank) {
            ancestralLegacy.nextRankDescription = this.getNextRankUpgradeDescription(ancestralLegacy, Math.max(1, ancestralLegacy.rank + 1));
            ancestralLegacy.maxRankDescription = this.getNextRankUpgradeDescription(ancestralLegacy, ancestralLegacy.maxRank + ancestralLegacy.bonusRank);
        }
    }
}