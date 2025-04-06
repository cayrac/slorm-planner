import { Injectable } from '@angular/core';

import { DATA_SLORM_COST } from '../../constants/content/data/data-slorm-cost';
import { AncestralLegacy } from '../../model/content/ancestral-legacy';
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
import { SkillElement } from '../../model/content/skill-element';
import { effectValueSynergy, effectValueVariable } from '../../util/effect-value.util';
import { list } from '../../util/math.util';
import {
    emptyStringToNull,
    isEffectValueSynergy,
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
    private readonly COST_LABEL: string;
    private readonly COOLDOWN_LABEL: string;
    private readonly SECONDS_LABEL: string;
    private readonly RANK_LABEL: string;
    private readonly TIER_ID: { [key: number]: number[] } = {
        1: [15, 24, 32, 53, 80, 96, 101, 126, 127, 148],
        2: [0, 16, 57, 81, 94, 102, 125, 128, 129, 143],
        3: [19, 35, 55, 72, 85, 93, 97, 98, 100, 119, 121, 149],
        4: [6, 41, 82, 89, 90, 106, 122, 132, 140, 142],
        5: [34, 139, 17, 104, 138, 112, 2, 7, 5, 146, 71, 114, 120, 64, 47, 46, 48, 52, 36, 33],
        6: [99, 77, 29, 25, 76, 12, 103, 65, 108, 69, 73, 79, 144, 107, 56, 78, 42],
        7: [30, 87, 18, 130, 137, 134, 4, 124, 67, 83, 110, 92, 131, 136, 37],
        8: [117, 38, 39, 49, 50, 61, 62, 8, 115, 9, 21, 116, 22, 123, 20, 147, 44, 109, 58, 118, 74, 66, 145, 14, 133, 11],
        9: [43, 45, 111, 27, 28, 26, 141, 13, 1, 3, 75, 70, 105, 68, 135, 54, 59, 60, 91, 31],
        10: [40, 113, 23, 86, 10, 95, 63, 84, 51, 88],
    }

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerBuffService: SlormancerBuffService,
                private slormancerEffectValueService: SlormancerEffectValueService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerMechanicService: SlormancerMechanicService
    ) {
        this.COST_LABEL = this.slormancerTranslateService.translate('tt_cost');
        this.COOLDOWN_LABEL = this.slormancerTranslateService.translate('tt_cooldown');
        this.SECONDS_LABEL = this.slormancerTranslateService.translate('tt_seconds');
        this.RANK_LABEL = this.slormancerTranslateService.translate('tt_rank');
    }
           
    private isActivable(types: Array<AncestralLegacyType>): boolean {
        return types.indexOf(AncestralLegacyType.Active) !== -1;
    }
                
    private isDamageStat(stat: string): boolean {
        return stat === 'physical_damage' || stat === 'elemental_damage' || stat === 'bleed_damage';
    }

    private getSlormTier(id: number): number | null {
        let tier: number | null = null;
        for (let i = 1 ; i <= 10 ; i++ ) {
            const tierIds = this.TIER_ID[i] ?? [];
            if (tierIds.includes(id)) {
                tier = i;
                break;
            }
        }
        return tier;
    }
        
    private getAncestralLegacySlormCosts(ancestralLegacy: AncestralLegacy): number[] {
        let result: number[] = [];

        if (ancestralLegacy.slormTier !== null) {
            const tierCosts = DATA_SLORM_COST.ancestral[ancestralLegacy.slormTier];
            if (tierCosts) {
                const maxRankCosts = tierCosts[ancestralLegacy.maxRank];
                if (maxRankCosts !== undefined) {
                    result = maxRankCosts;
                }
            }
        }
        
        return result;
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
                result.push(effectValueSynergy(baseValue, upgrade, EffectValueUpgradeType.AncestralRank, false, source, EffectValueValueType.Damage));
            } else if (type === null) {
                result.push(effectValueVariable(baseValue, upgrade, EffectValueUpgradeType.AncestralRank, percent, stat));
            } else if (type === 'negative') {
                result.push(effectValueVariable(baseValue, -upgrade, EffectValueUpgradeType.AncestralRank, percent, stat));
            } else {
                const typeValues = splitData(type, ':');
                const source = <string>typeValues[1];
                result.push(effectValueSynergy(baseValue, upgrade, EffectValueUpgradeType.AncestralRank, percent, source, stat));
            }
        }
        
        return result;
    }

    private extractBuffs(template: string, additional: string[]): Array<Buff> {
        const extractedBuffs = valueOrDefault<string[]>(template.match(/<(.*?)>/g), [])
            .map(m => this.slormancerDataService.getDataSkillBuff(m))
            .filter(isNotNullOrUndefined)

        return [ ...extractedBuffs, ...additional ]
            .filter(isFirst)
            .map(ref => this.slormancerBuffService.getBuff(ref))
            .filter(isNotNullOrUndefined);
    }

    private extractMechanics(template: string, values: Array<AbstractEffectValue>, additional: Array<MechanicType>): Array<Mechanic> {
        const templateMechanics = valueOrDefault<string[]>(template.match(/<(.*?)>/g), [])
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

    public getAncestralLegacyClone(ancestralLegacy: AncestralLegacy): AncestralLegacy {
        return {
            ...ancestralLegacy,
            types: [ ...ancestralLegacy.types ],
            damageTypes: [ ...ancestralLegacy.damageTypes ],
            genres: [ ...ancestralLegacy.genres ],
            relatedBuffs: [ ...ancestralLegacy.relatedBuffs ],
            relatedMechanics: ancestralLegacy.relatedMechanics.map(mechanic => this.slormancerMechanicService.getMechanicClone(mechanic)),
            values: ancestralLegacy.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        } as AncestralLegacy
    }


    public getAncestralLegacy(ref: number, baseRank: number, bonusRank: number = 0): AncestralLegacy | null {
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
                element: <SkillElement>gameData.REALM_COLOR,
                damageTypes: splitData(gameData.DMG_TYPE, ','),
                sealMerge: gameData.SEAL_MERGE,
                cooldown: null,
                baseCooldown: gameData.COOLDOWN,
                auraBuff: gameData.AURA_BUFF_NAME === null ? null : this.slormancerBuffService.getBuff(gameData.AURA_BUFF_NAME),
                genres: <Array<SkillGenre>>splitData(gameData.GENRE, ","),
                cost: null,
                currentRankCost: null,
                baseCost: gameData.COST,
                costPerRank: gameData.COST_LEVEL,
                baseCostType: <SkillCostType>gameData.COST_TYPE,
                costType: <SkillCostType>gameData.COST_TYPE,
                rank: 0,
                forcedRank: null,
                baseRank: baseRank,
                bonusRank: bonusRank,
                baseMaxRank: gameData.UPGRADE_NUMBER,
                maxRank: 0,
                hasLifeCost: false,
                hasManaCost: false,
                hasNoCost: false,
                realm: gameData.REALM,
                isActivable: false,
                slormTier: this.getSlormTier(gameData.REF),
                upgradeSlormCost: null,
                investedSlorm: 0,
                totalSlormCost: 0,

                relatedBuffs: this.extractBuffs(gameData.EN_DESCRIPTION, data !== null && data.additionalBuffs ? data.additionalBuffs : []),
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
                data.override(ancestralLegacy.values, ancestralLegacy);
            }

            this.updateAncestralLegacyModel(ancestralLegacy, baseRank, bonusRank);
            this.updateAncestralLegacyView(ancestralLegacy);
        }

        return ancestralLegacy;
    }

    public updateAncestralLegacyModel(ancestralLegacy: AncestralLegacy, baseRank: number = ancestralLegacy.baseRank, bonusRank: number = ancestralLegacy.bonusRank, forcedRank: number | null = ancestralLegacy.forcedRank) {
        ancestralLegacy.forcedRank = forcedRank;
        ancestralLegacy.baseRank = Math.min(ancestralLegacy.baseMaxRank, Math.max(0, baseRank));
        ancestralLegacy.bonusRank = Math.max(0, bonusRank);
        ancestralLegacy.rank = ancestralLegacy.forcedRank !== null ? ancestralLegacy.forcedRank : ancestralLegacy.baseRank + ancestralLegacy.bonusRank;
        ancestralLegacy.maxRank = ancestralLegacy.baseMaxRank;

        for (const effectValue of ancestralLegacy.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, Math.max(1, ancestralLegacy.rank));
        }

        ancestralLegacy.cooldown = ancestralLegacy.baseCooldown;

        this.updateAncestralLegacyCost(ancestralLegacy);

        ancestralLegacy.isActivable = ancestralLegacy.baseCooldown !== null || ancestralLegacy.genres.includes(SkillGenre.Aura);

        const upgradeCosts = this.getAncestralLegacySlormCosts(ancestralLegacy);
        ancestralLegacy.investedSlorm = upgradeCosts.reduce((total, current, index) => index < ancestralLegacy.baseRank ? current + total : total , 0);
        ancestralLegacy.totalSlormCost = upgradeCosts.reduce((total, current) => current + total , 0);
        ancestralLegacy.upgradeSlormCost = upgradeCosts[ancestralLegacy.rank] ?? null;
    }

    public updateAncestralLegacyCost(ancestralLegacy: AncestralLegacy) {
        ancestralLegacy.costType = ancestralLegacy.baseCostType;
        ancestralLegacy.cost = null;
        if (ancestralLegacy.baseCost !== null) {
            ancestralLegacy.currentRankCost = ancestralLegacy.baseCost + (ancestralLegacy.costPerRank === null ? 0 : ancestralLegacy.costPerRank * Math.max(1, ancestralLegacy.rank));
            ancestralLegacy.cost = ancestralLegacy.currentRankCost;
        }

        this.updateAncestralLegacyCostType(ancestralLegacy);
    }

    public updateAncestralLegacyCostType(ancestralLegacy: AncestralLegacy) {
        ancestralLegacy.hasLifeCost = ancestralLegacy.costType === SkillCostType.LifeSecond || ancestralLegacy.costType === SkillCostType.LifeLockFlat || ancestralLegacy.costType === SkillCostType.LifeLock || ancestralLegacy.costType === SkillCostType.Life || ancestralLegacy.costType === SkillCostType.LifePercent;
        ancestralLegacy.hasManaCost = ancestralLegacy.costType === SkillCostType.ManaSecond || ancestralLegacy.costType === SkillCostType.ManaLockFlat || ancestralLegacy.costType === SkillCostType.ManaLock || ancestralLegacy.costType === SkillCostType.Mana || ancestralLegacy.costType === SkillCostType.ManaPercent;
        ancestralLegacy.hasNoCost = ancestralLegacy.costType === SkillCostType.None;
    }

    public updateAncestralLegacyView(ancestralLegacy: AncestralLegacy) {
        ancestralLegacy.genresLabel =  null;
        if (ancestralLegacy.genres.length > 0) {
            ancestralLegacy.genresLabel = ancestralLegacy.genres
                .map(genre => this.slormancerTranslateService.translate('atk_' + genre))
                .join(' ');
        }
        
        ancestralLegacy.costLabel = null;
        if (!ancestralLegacy.hasNoCost && ancestralLegacy.cost !== null) {
            ancestralLegacy.costLabel = this.COST_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(ancestralLegacy.cost.toString(), ancestralLegacy.hasManaCost ? 'value mana' : 'value life')
                + ' ' + this.slormancerTranslateService.translate('tt_' + ancestralLegacy.costType);
        }

        ancestralLegacy.cooldownLabel = null;
        if (ancestralLegacy.cooldown !== null && ancestralLegacy.cooldown > 0) {
            ancestralLegacy.cooldownLabel = this.COOLDOWN_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(ancestralLegacy.cooldown.toString(), 'value')
                + ' ' + this.SECONDS_LABEL;
        }

        ancestralLegacy.typeLabel = this.slormancerTranslateService.translate('element_' + ancestralLegacy.element) + ' - '
             + ancestralLegacy.types.map(type =>  this.slormancerTranslateService.translate('tt_' + type)).join(', ');
        ancestralLegacy.rankLabel = this.RANK_LABEL + ': ' + this.slormancerTemplateService.asSpan(ancestralLegacy.rank.toString(), 'current') + '/' + ancestralLegacy.baseMaxRank;
        
        const descriptionPrefix = this.isActivable(ancestralLegacy.types) ? this.slormancerTranslateService.translate(this.ACTIVE_PREFIX) + '<br/>' : '';
        ancestralLegacy.description = descriptionPrefix + this.slormancerTemplateService.formatAncestralLegacyDescription(ancestralLegacy.template, ancestralLegacy.values);
    }
}