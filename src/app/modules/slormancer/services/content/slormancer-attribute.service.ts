import { Injectable } from '@angular/core';

import { AttributeTraits } from '../../model/content/attribut-traits';
import { AbstractEffectValue, EffectValueVariable } from '../../model/content/effect-value';
import { Attribute } from '../../model/content/enum/attribute';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { TraitLevel } from '../../model/content/enum/trait-level';
import { GameDataAttribute } from '../../model/content/game/data/game-data-attribute';
import { Trait } from '../../model/content/trait';
import { effectValueSynergy, effectValueVariable } from '../../util/effect-value.util';
import { list } from '../../util/math.util';
import {
    emptyStringToNull,
    isEffectValueConstant,
    isEffectValueSynergy,
    isEffectValueVariable,
    notEmptyOrNull,
    splitData,
    splitFloatData,
    valueOrDefault,
    valueOrNull,
} from '../../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerAttributeService {

    private readonly MAX_RANK = 75;

    private readonly TRAIT_LEVEL_LABEL = this.slormancerTranslateService.translate('trait_level');
    private readonly TRAIT_LOCKED_LABEL = this.slormancerTranslateService.translate('trait_locked');
    private readonly TRAIT_DEFAULT_LABEL = this.slormancerTranslateService.translate('trait_default');
    private readonly TRAIT_RECAP_ALL_LABEL = this.slormancerTranslateService.translate('trait_recap_all');
    private readonly TRAIT_RECAP_LABEL = this.slormancerTranslateService.translate('trait_recap');

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerEffectValueService: SlormancerEffectValueService,
                private slormancerDataService: SlormancerDataService) { }
     
    private isDamageStat(stat: string): boolean {
        return stat === 'physical_damage' || stat === 'elemental_damage' || stat === 'bleed_damage';
    }    
       
    private parseEffectValues(data: GameDataAttribute): Array<AbstractEffectValue> {
        const valueBases = splitFloatData(data.VALUE);
        const valueTypes = emptyStringToNull(splitData(data.TYPE));
        const stats = emptyStringToNull(splitData(data.STAT));
        const max = Math.max(valueBases.length, valueTypes.length);
        const firstIsUpgradable = data.ADDITIVE === 2;

        let result: Array<AbstractEffectValue> = [];
        for (let i of list(max)) {
            const type = valueOrNull(valueTypes[i]);
            const percent = type === '%';
            const value = valueOrDefault(valueBases[i], 0);
            const stat = valueOrDefault(stats[i], null);
            const upgrade = i === 0 && firstIsUpgradable ? value : 0;

            if (stat !== null && type !== null && type.startsWith('synergy:')) {
                const valueType = this.isDamageStat(stat) ? EffectValueValueType.Damage : EffectValueValueType.Stat;
                result.push(effectValueSynergy(value, upgrade, EffectValueUpgradeType.RanksAfterInThisTrait, percent, type.substring(8), stat, valueType));
            } else {
                result.push(effectValueVariable(value, upgrade, EffectValueUpgradeType.RanksAfterInThisTrait, percent, stat, EffectValueValueType.Stat));
            }
        }
        
        return result;
    }    

    private getTrait(gameData: GameDataAttribute | null, attribute: Attribute, rank: number, requiredRank: number, cumulativeValues: Array<EffectValueVariable>): Trait {
        return {
            attribute,
            requiredRank,
            traitLevel: requiredRank % 15 === 0 ? TraitLevel.Greater : requiredRank % 5 === 0 ? TraitLevel.Major : TraitLevel.Minor,
            rank,
            unlocked: false,
        
            attributeName: '',
            description: null,
            cumulativeStats: null,
            rankLabel: '',
            traitLevelLabel: '',
            unlockLabel: null,
        
            template: gameData === null ? null : notEmptyOrNull(this.slormancerTemplateService.getAttributeTemplate(gameData)),
            values: gameData === null ? [] : this.parseEffectValues(gameData),
            cumulativeValues
        }
    }

    private getDefaultVariableDescription(value: EffectValueVariable): string {
        const template = this.slormancerTemplateService.prepareAttributeCumulativeTraitTemplate(this.TRAIT_DEFAULT_LABEL, value.stat)
        return this.slormancerTemplateService.formatTraitDescription(template, [value])
    }

    private updateTrait(trait: Trait) {
        const ranksAfterThisOne = this.ranksAfter(trait, trait.rank);
        trait.attributeName = this.slormancerTranslateService.translate('character_trait_' + trait.attribute);
        trait.rankLabel = this.slormancerTemplateService.replaceAnchor(this.TRAIT_LEVEL_LABEL, trait.requiredRank, this.slormancerTemplateService.VALUE_ANCHOR);
        trait.traitLevelLabel = this.slormancerTranslateService.translate(trait.traitLevel);
        trait.unlocked = trait.requiredRank <= trait.rank;
        trait.unlockLabel = trait.unlocked ? null : this.slormancerTemplateService.replaceAnchor(this.TRAIT_LOCKED_LABEL, trait.requiredRank - trait.rank, this.slormancerTemplateService.VALUE_ANCHOR);
        
        for (const effectValue of trait.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, ranksAfterThisOne);
        }

        const cumulativeStats: Array<string> = [];
        if (trait.cumulativeValues.length > 0) {
            cumulativeStats.push(...trait.cumulativeValues
                .map(value => this.getDefaultVariableDescription(value)));
        }
        if (trait.template !== null) {
            trait.description = this.slormancerTemplateService.formatTraitDescription(trait.template, trait.values);
        } else if (trait.values.length > 0) {
            cumulativeStats.push(...trait.values
                .filter(isEffectValueVariable)
                .map(value => this.getDefaultVariableDescription(value)));
        }

        trait.cumulativeStats = cumulativeStats.join('<br/>');
    }

    private buildTraits(gameDatas: Array<GameDataAttribute>, attribute: Attribute): Array<Trait> {
        const cumulativeValues: Array<EffectValueVariable> = [];
        const traits: Array<Trait> = [];

        for (const rank of list(1, this.MAX_RANK)) {
            const data = valueOrNull(gameDatas.find(data => data.LEVEL === rank));

            if (data !== null && data.ADDITIVE === 1) {
                this.parseEffectValues(data)
                    .filter(isEffectValueVariable)
                    .forEach(value => cumulativeValues.push(value))
            }

            if (data !== null && data.ADDITIVE !== 1) {
                traits.push(this.getTrait(data, attribute, 0, rank, cumulativeValues.map(constant => ({ ...constant }))))
            } else {
                traits.push(this.getTrait(null, attribute, 0, rank, cumulativeValues.map(constant => ({ ...constant }))))
            }
            traits.push()
        }

        return traits;
    }

    public getAttributeTraits(attribute: Attribute, rank: number, bonusRank: number = 0): AttributeTraits {
        const traits = this.slormancerDataService.getGameDataAttributes(attribute);

        const attributeTraits: AttributeTraits = {
            attribute,
            rank,
            bonusRank,
            traits: this.buildTraits(traits, attribute),
        
            recapLabel: this.TRAIT_RECAP_ALL_LABEL,
            attributeName: this.slormancerTranslateService.translate('character_trait_' + attribute),
            title: this.TRAIT_RECAP_LABEL,
            icon: 'assets/img/icon/attribute/' + attribute + '.png',
            summary: '',
        
            template: '',
        };

        this.updateAttributeTraits(attributeTraits);

        return attributeTraits;
    }

    private sameValue(a: AbstractEffectValue, b: AbstractEffectValue): boolean {
        return a.stat === b.stat && a.type === b.type && a.valueType === b.valueType;
    }

    private joinValues<T extends AbstractEffectValue>(values: Array<T>): Array<T> {
        const result: Array<T> = [];

        for (const value of values) {
            const found = valueOrNull(result.find(v => this.sameValue(v, value)));

            if (found !== null) {
                if (isEffectValueVariable(value) && isEffectValueVariable(found)) {
                    found.value += value.value;
                } else if (isEffectValueConstant(value) && isEffectValueConstant(found)) {
                    found.value += value.value;
                } else if (isEffectValueSynergy(value) && isEffectValueSynergy(found)) {
                    found.value += value.value;
                }
            } else {
                result.push({ ...value });
            }
        }

        return result;
    }

    private ranksAfter(trait: Trait, rank: number): number {
        return Math.max(0, rank - trait.requiredRank)
    }

    public updateAttributeTraits(attributeTraits: AttributeTraits) {
        
        let cumulativeUnlockedAttributes: Array<EffectValueVariable> = [];
        let cumulativeAttributes: Array<EffectValueVariable> = [];
        const allDescriptions: Array<string> = [];

        for (const trait of attributeTraits.traits) {
            trait.rank = attributeTraits.rank + attributeTraits.bonusRank;
            this.updateTrait(trait);

            if (trait.template !== null) {
                const description = this.slormancerTemplateService.formatTraitDescription(trait.template, trait.values)
                allDescriptions.push(this.slormancerTemplateService.asSpan(description, trait.unlocked ? 'unlocked' : 'locked'));
            } else {
                const variables = trait.values.filter(isEffectValueVariable);
                cumulativeAttributes.push(...variables);
                if (trait.unlocked) {
                    cumulativeUnlockedAttributes.push(...variables);
                }
            }
            
            if (trait.cumulativeValues.length > 0) {
                cumulativeAttributes.push(...trait.cumulativeValues);
                if (trait.unlocked) {
                    cumulativeUnlockedAttributes.push(...trait.cumulativeValues);
                }
            }
        }

        cumulativeUnlockedAttributes = this.joinValues(cumulativeUnlockedAttributes);
        cumulativeAttributes = this.joinValues(cumulativeAttributes);

        const cumulativeAttributeLabels: Array<string> = []
        for (const value of cumulativeAttributes) {
            const found = valueOrNull(cumulativeUnlockedAttributes.find(v => this.sameValue(v, value)));

            if (found !== null) {
                if (value.value !== found.value) {
                    value.max = value.value;
                }
                value.value = found.value;
            }

            const label = this.getDefaultVariableDescription(value);
            cumulativeAttributeLabels.push(this.slormancerTemplateService.asSpan(label, found !== null ? 'unlocked' : 'locked'));
        }

        allDescriptions.unshift(cumulativeAttributeLabels.join('<br/>'));

        attributeTraits.summary = allDescriptions.join('<br/></br>');
    }
}