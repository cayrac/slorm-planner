import { Injectable } from '@angular/core';

import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../model/enum/effect-value-value-type';
import { TraitLevel } from '../model/enum/trait-level';
import { GameDataAttribute } from '../model/game/data/game-data-attribute';
import { Trait } from '../model/trait';
import { list } from '../util/math.util';
import { emptyStringToNull, splitData, splitFloatData, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerAttributeService {

    private traitLevelLabel = this.slormancerTemplateService.translate('trait_level');
    private traitLockedLabel = this.slormancerTemplateService.translate('trait_locked');

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
            // const type = valueOrNull(valueReals[i]);
            const percent = valueOrNull(valueTypes[i]) === '%';
            const value = valueOrDefault(valueBases[i], 0);
            // const upgrade = valueOrDefault(valuePerLevels[i], 0);
            const stat = valueOrDefault(stats[i], null);

            if (stat !== null && this.isDamageStat(stat)) {
                // const damageType = valueOrDefault(damageTypes.splice(0, 1)[0], 'phy');

                result.push({
                    type: EffectValueType.Synergy,
                    ratio: value,
                    upgrade: 0,
                    upgradeType: EffectValueUpgradeType.Reinforcment,
                    percent,
                    source: '',
                    valueType: EffectValueValueType.Damage,
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
                    stat
                } as EffectValueVariable);
            }
        }
        
        return result;
    }    

    public getTrait(ref: number, rank: number, duplicate: number): Trait | null {
        const gameData = this.slormancerDataService.getGameDataAttribute(ref);
        let trait: Trait | null = null;

        if (gameData !== null) {
            trait =  {
                id: ref,
                attribute: gameData.TRAIT,
                additive: gameData.ADDITIVE,
                requiredRank: gameData.LEVEL + duplicate,
                traitLevel: TraitLevel.Minor,
                rank,
            
                attributeName: '',
                description: '',
                rankLabel: '',
                traitLevelLabel: '',
                unlockLabel: null,
            
                template: this.slormancerTemplateService.getAttributeTemplate(gameData),
                values: this.parseEffectValues(gameData)
            }

            this.updateTrait(trait);
        }

        return trait;
    }

    public updateTrait(trait: Trait) {
        trait.traitLevel = trait.requiredRank % 15 === 0 ? TraitLevel.Greater : trait.requiredRank % 5 === 0 ? TraitLevel.Major : TraitLevel.Minor;
        trait.description = this.slormancerTemplateService.formatSkillDescription(trait.template, trait.values, 0);
        trait.attributeName = this.slormancerTemplateService.translate('character_trait_' + trait.attribute);
        trait.rankLabel = this.slormancerTemplateService.replaceAnchor(this.traitLevelLabel, trait.requiredRank, this.slormancerTemplateService.VALUE_ANCHOR);
        trait.traitLevelLabel = this.slormancerTemplateService.translate(trait.traitLevel);
        trait.unlockLabel = trait.requiredRank > trait.rank ? this.slormancerTemplateService.replaceAnchor(this.traitLockedLabel, trait.requiredRank - trait.rank, this.slormancerTemplateService.VALUE_ANCHOR) : null;
    }
}