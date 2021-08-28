import { Injectable } from '@angular/core';

import { AncestralLegacy } from '../model/ancestral-legacy';
import { AncestralLegacyElement } from '../model/ancestral-legacy-element';
import { AncestralLegacyType } from '../model/ancestral-legacy-type';
import { Buff } from '../model/buff';
import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { MechanicType } from '../model/enum/mechanic-type';
import { SkillCostType } from '../model/enum/skill-cost-type';
import { SkillGenre } from '../model/enum/skill-genre';
import { GameDataAncestralLegacy } from '../model/game/data/game-data-ancestral-legacy';
import { Mechanic } from '../model/mechanic';
import { list } from '../util/math.util';
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
export class SlormancerAncestralLegacyService {

    private readonly UNAVAILABLE_ANCESTRAL_LEGACY: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 17, 18, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 33, 34, 36, 37, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 54, 56, 58, 59, 60, 61, 62, 63, 64, 65,
        66, 67, 68, 69, 70, 71, 73, 74, 75, 76, 77, 78, 79, 82, 83, 84, 86, 87, 88, 89, 90, 91, 92,
        95, 96, 102, 103, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117,
        118, 120, 122, 123, 124, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142,
        144, 145, 146, 147
    ];

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerBuffService: SlormancerBuffService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerMechanicService: SlormancerMechanicService) { }
                
                
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
    
    private getNextRankUpgradeDescription(ancestralLegacy: AncestralLegacy, rank: number): Array<string> {
        const skill = [];

        const cost = ancestralLegacy.baseCost === null ? null : ancestralLegacy.baseCost + (ancestralLegacy.costPerRank === null ? 0 : ancestralLegacy.costPerRank * rank);
        if (cost !== null && cost > 0 && ancestralLegacy.costPerRank !== null && ancestralLegacy.costPerRank !== 0) {
            const costClass = ancestralLegacy.hasLifeCost ? 'life' : 'mana';
            const description = '<span class="' + costClass + '">' + cost + '</span> ' + this.slormancerTemplateService.translate(ancestralLegacy.costType);
            skill.push(description);
        }

        const attributes = ancestralLegacy.values
            .filter(value => isEffectValueSynergy(value) || isEffectValueVariable(value))
            .filter(value => (<EffectValueSynergy | EffectValueVariable>value).upgrade !== 0)
            .map(value => this.slormancerTemplateService.formatNextRankDescription('@ £', <EffectValueSynergy | EffectValueVariable>value, rank));

        return [ ...skill, ...attributes ]
    }

    private extractBuffs(template: string): Array<Buff> {
        return valueOrDefault(template.match(/<(.*?)>/g), [])
            .map(m => {
                if (this.slormancerDataService.getDataSkillBuff(m) === null) {
                    console.log('No buff for ', m);
                }
                return m;
            })
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
        return this.UNAVAILABLE_ANCESTRAL_LEGACY.indexOf(ref) === -1;
    }

    public getAncestralLegacy(ref: number, rank: number, bonusRank: number = 0): AncestralLegacy | null {
        const gameData = this.slormancerDataService.getGameDataAncestralLegacy(ref);
        let ancestralLegacy: AncestralLegacy | null = null;

        if (gameData !== null && this.UNAVAILABLE_ANCESTRAL_LEGACY.indexOf(ref) === -1) {
            const data = this.slormancerDataService.getDataAncestralLegacy(ref);
            const values = this.parseEffectValues(gameData);
            ancestralLegacy = {
                id: ref,
                name: gameData.EN_NAME,
                icon: 'legacy/' + ref,
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
                totalRank: 0,
                rank,
                bonusRank,
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

                // override constants + links

                template: this.slormancerTemplateService.getAncestralLegacyDescriptionTemplate(gameData),
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
        ancestralLegacy.rank = Math.min(ancestralLegacy.maxRank, ancestralLegacy.rank)
        ancestralLegacy.totalRank = ancestralLegacy.bonusRank + ancestralLegacy.rank;
        ancestralLegacy.description = this.slormancerTemplateService.formatUpgradeDescription(ancestralLegacy.template, ancestralLegacy.values, Math.max(ancestralLegacy.totalRank, 1));
        ancestralLegacy.cost = ancestralLegacy.baseCost === null ? null : ancestralLegacy.baseCost + (ancestralLegacy.costPerRank === null ? 0 : ancestralLegacy.costPerRank * ancestralLegacy.totalRank);
        ancestralLegacy.cooldown = ancestralLegacy.baseCooldown;

        ancestralLegacy.hasLifeCost = ancestralLegacy.costType === SkillCostType.LifePercent || ancestralLegacy.costType === SkillCostType.LifeSecond || ancestralLegacy.costType === SkillCostType.LifeLock || ancestralLegacy.costType === SkillCostType.Life;
        ancestralLegacy.hasManaCost = ancestralLegacy.costType === SkillCostType.ManaPercent || ancestralLegacy.costType === SkillCostType.ManaSecond || ancestralLegacy.costType === SkillCostType.ManaLock || ancestralLegacy.costType === SkillCostType.Mana;
        ancestralLegacy.hasNoCost = ancestralLegacy.costType === SkillCostType.None || ancestralLegacy.cost === 0;

        ancestralLegacy.nextRankDescription = [];
        ancestralLegacy.maxRankDescription = [];

        if (ancestralLegacy.maxRank > 1) {
            ancestralLegacy.nextRankDescription = this.getNextRankUpgradeDescription(ancestralLegacy, Math.min(ancestralLegacy.maxRank + ancestralLegacy.bonusRank, ancestralLegacy.totalRank + 1));
            ancestralLegacy.maxRankDescription = this.getNextRankUpgradeDescription(ancestralLegacy, ancestralLegacy.maxRank + ancestralLegacy.bonusRank);
        }
    }
}