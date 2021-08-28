import { Injectable } from '@angular/core';

import { AttributeTraits } from '../model/attribut-traits';
import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { Attribute } from '../model/enum/attribute';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { TraitLevel } from '../model/enum/trait-level';
import { GameDataAttribute } from '../model/game/data/game-data-attribute';
import { Trait } from '../model/trait';
import { list } from '../util/math.util';
import {
    emptyStringToNull,
    isEffectValueVariable,
    notEmptyOrNull,
    splitData,
    splitFloatData,
    valueOrDefault,
    valueOrNull,
} from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerAttributeService {

    private traitLevelLabel = this.slormancerTemplateService.translate('trait_level');
    private traitLockedLabel = this.slormancerTemplateService.translate('trait_locked');
    private traitdefaultLabel = this.slormancerTemplateService.translate('trait_default');

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerDataService: SlormancerDataService) { }
     
    private isDamageStat(stat: string): boolean {
        return stat === 'physical_damage' || stat === 'elemental_damage' || stat === 'bleed_damage';
    }       
    private parseEffectValues(data: GameDataAttribute): Array<AbstractEffectValue> {
        const valueBases = splitFloatData(data.VALUE);
        // const valuePerLevels = splitFloatData(data.DESC_VALUE_PER_LVL);
        const valueTypes = emptyStringToNull(splitData(data.TYPE));
        // const valueReals = emptyStringToNull(splitData(data.DESC_VALUE_REAL));
        const stats = emptyStringToNull(splitData(data.STAT));
        const max = Math.max(valueBases.length, valueTypes.length);

        let result: Array<AbstractEffectValue> = [];
        for (let i of list(max)) {
            const type = valueOrNull(valueTypes[i]);
            const percent = type === '%';
            const value = valueOrDefault(valueBases[i], 0);
            // const upgrade = valueOrDefault(valuePerLevels[i], 0);
            const stat = valueOrDefault(stats[i], null);

            if (stat !== null && type !== null && type.startsWith('synergy:')) {
                result.push({
                    type: EffectValueType.Synergy,
                    ratio: value,
                    upgrade: 0,
                    upgradeType: EffectValueUpgradeType.Reinforcment,
                    percent,
                    source: type.substring(8),
                    valueType: this.isDamageStat(stat) ? EffectValueValueType.Damage : EffectValueValueType.Stat,
                    range: false,
                    stat
                } as EffectValueSynergy);

            } else {
                result.push({
                    type: EffectValueType.Variable,
                    value,
                    upgrade: 0,
                    percent,
                    range: false,
                    valueType: EffectValueValueType.Flat,
                    stat
                } as EffectValueVariable);
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
            description: '',
            rankLabel: '',
            traitLevelLabel: '',
            unlockLabel: null,
        
            template: gameData === null ? null : notEmptyOrNull(this.slormancerTemplateService.getAttributeTemplate(gameData)),
            values: gameData === null ? [] : this.parseEffectValues(gameData),
            cumulativeValues
        }
    }

    private getDefaultVariableDescription(value: EffectValueVariable): string {
        const template = this.slormancerTemplateService.getAttributeCumulativeTraitTemplate(this.traitdefaultLabel, value.stat)
        return this.slormancerTemplateService.formatTraitDescription(template, [value])
    }

    private updateTrait(trait: Trait) {
        trait.attributeName = this.slormancerTemplateService.translate('character_trait_' + trait.attribute);
        trait.rankLabel = this.slormancerTemplateService.replaceAnchor(this.traitLevelLabel, trait.requiredRank, this.slormancerTemplateService.VALUE_ANCHOR);
        trait.traitLevelLabel = this.slormancerTemplateService.translate(trait.traitLevel);
        trait.unlocked = trait.requiredRank <= trait.rank;
        trait.unlockLabel = trait.unlocked ? null : this.slormancerTemplateService.replaceAnchor(this.traitLockedLabel, trait.requiredRank - trait.rank, this.slormancerTemplateService.VALUE_ANCHOR);
        
        const defaultStatDescription: Array<string> = [];
        let traitDescription: string | null = null;
        if (trait.cumulativeValues.length > 0) {
            defaultStatDescription.push(...trait.cumulativeValues
                .map(value => this.getDefaultVariableDescription(value)));
        }
        if (trait.template !== null) {
            traitDescription = this.slormancerTemplateService.formatTraitDescription(trait.template, trait.values);
        } else if (trait.values.length > 0) {
            defaultStatDescription.push(...trait.values
                .filter(isEffectValueVariable)
                .map(value => this.getDefaultVariableDescription(value)));
        }

        let descriptionParts: Array<string> = [];
        if (defaultStatDescription.length > 0) {
            descriptionParts.push(defaultStatDescription.join('<br/>'));
        }
        if (traitDescription !== null) {
            descriptionParts.push(traitDescription);
        }
        trait.description = descriptionParts.join('<br/><br/>');
    }

    private buildTraits(gameDatas: Array<GameDataAttribute>, attribute: Attribute): Array<Trait> {
        const cumulativeValues: Array<EffectValueVariable> = [];
        const traits: Array<Trait> = [];

        for (const rank of list(1, 75)) {
            const data = valueOrNull(gameDatas.find(data => data.LEVEL === rank));

            if (data !== null) console.log('loop data ', data, this.parseEffectValues(data));
            if (data !== null && data.ADDITIVE !== null) {
                this.parseEffectValues(data)
                    .filter(isEffectValueVariable)
                    .forEach(value => cumulativeValues.push(value))
            }

            if (data !== null && data.ADDITIVE === null) {
                traits.push(this.getTrait(data, attribute, 0, rank, cumulativeValues.map(constant => ({ ...constant }))))
            } else {
                traits.push(this.getTrait(null, attribute, 0, rank, cumulativeValues.map(constant => ({ ...constant }))))
            }
            traits.push()
        }

        return traits;
    }

    public getAttributeTraits(attribute: Attribute, rank: number, bonusRank: number): AttributeTraits {
        const traits = this.slormancerDataService.getGameDataAttributes(attribute);

        const attributeTraits: AttributeTraits = {
            attribute,
            rank,
            bonusRank,
            traits: this.buildTraits(traits, attribute),
        
            attributeName: this.slormancerTemplateService.translate('character_trait_' + attribute),
            title: this.slormancerTemplateService.translate('trait_recap'),
            icon: 'attribute/summary/' + attribute,
            summary: '',
        
            template: '',
        };

        this.updateAttributeTraits(attributeTraits);

        return attributeTraits;
    }

    public updateAttributeTraits(attributeTraits: AttributeTraits) {

        for (const trait of attributeTraits.traits) {
            trait.rank = attributeTraits.rank + attributeTraits.bonusRank;
            this.updateTrait(trait);
        }
    }
}