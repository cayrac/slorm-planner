import { Injectable } from '@angular/core';

import { Character } from '../model/character';
import { CharacterStatDifference } from '../model/character-stat-differences';
import { EffectValueSynergy } from '../model/content/effect-value';
import { HeroClass } from '../model/content/enum/hero-class';
import { Skill } from '../model/content/skill';
import { MinMax } from '../model/minmax';
import { add, round } from '../util/math.util';
import { compare, isDamageType, isEffectValueSynergy } from '../util/utils';
import { SlormancerTranslateService } from './content/slormancer-translate.service';

@Injectable()
export class SlormancerCharacterComparatorService {

    constructor(private slormancerTranslateService: SlormancerTranslateService) { }

    private buildCharacterStatDifference(left: number | MinMax, right: number | MinMax, name: string): CharacterStatDifference {
        const leftAverageValue = typeof left === 'number' ? left : ((left.min + left.max) / 2);
        const rightAverageValue = typeof right === 'number' ? right : ((right.min + right.max) / 2);

        let difference = 0;
        if (leftAverageValue === 0) {
            difference = rightAverageValue > 0 ? Number.POSITIVE_INFINITY : rightAverageValue < 0 ? Number.NEGATIVE_INFINITY : 0;
        } else {
            difference = round(((rightAverageValue / leftAverageValue) - 1) * 100, 2)
        }

        return { name, left, difference, right };
    }

    private getCharacterStatDifference(left: Character, right: Character, stat: string): CharacterStatDifference {
        const leftStat = left.stats.find(mergedStat => mergedStat.stat === stat);
        const rightStat = right.stats.find(mergedStat => mergedStat.stat === stat);
        const leftValue = leftStat ? leftStat.total : 0;
        const rightValue = rightStat ? rightStat.total : 0;

        return this.buildCharacterStatDifference(leftValue, rightValue, this.slormancerTranslateService.translate(stat));
    }

    private getSkillDps(left: Skill | null, right: Skill | null): Array<CharacterStatDifference> {
        let result: Array<CharacterStatDifference> = []

        if (left !== null && right !== null && left.heroClass === right.heroClass && left.id === right.id) {
            let leftDamages  = left.values.filter(value => isDamageType(value.stat)).filter(isEffectValueSynergy);
            let rightDamages  = right.values.filter(value => isDamageType(value.stat)).filter(isEffectValueSynergy);

            // Throwing sword
            if (left.heroClass === HeroClass.Warrior && left.id === 5) {
                leftDamages = [<EffectValueSynergy>left.values[0]];
                rightDamages = [<EffectValueSynergy>right.values[0]];
                const leftBleedDamages = (<EffectValueSynergy>left.values[1]).displaySynergy;
                const rightBleedDamages = (<EffectValueSynergy>right.values[1]).displaySynergy;
                result.push(this.buildCharacterStatDifference(
                    leftBleedDamages,
                    rightBleedDamages,
                    this.slormancerTranslateService.translate('bleed_damage')));
            }
            // Cadence
            if (left.heroClass === HeroClass.Warrior && left.id === 6) {
                leftDamages = [<EffectValueSynergy>left.values[0]];
                rightDamages = [<EffectValueSynergy>right.values[0]];
                const leftBleedDamages = (<EffectValueSynergy>left.values[1]).displaySynergy;
                const rightBleedDamages = (<EffectValueSynergy>right.values[1]).displaySynergy;
                result.push(this.buildCharacterStatDifference(
                    leftBleedDamages,
                    rightBleedDamages,
                    'Magnified ' + left.name));
            }
            // The Elder Lance
            if (left.heroClass === HeroClass.Warrior && left.id === 10) {
                leftDamages = [<EffectValueSynergy>left.values[1]];
                rightDamages = [<EffectValueSynergy>right.values[1]];
                const leftBleedDamages = (<EffectValueSynergy>left.values[0]).displaySynergy;
                const rightBleedDamages = (<EffectValueSynergy>right.values[0]).displaySynergy;
                result.push(this.buildCharacterStatDifference(
                    leftBleedDamages,
                    rightBleedDamages,
                    'Training Lance'));
            }
            // The Elder Lance
            if (left.heroClass === HeroClass.Mage && left.id === 6) {
                leftDamages = [<EffectValueSynergy>left.values[0]];
                rightDamages = [<EffectValueSynergy>right.values[0]];
                const leftBleedDamages = (<EffectValueSynergy>left.values[1]).displaySynergy;
                const rightBleedDamages = (<EffectValueSynergy>right.values[1]).displaySynergy;
                result.push(this.buildCharacterStatDifference(
                    leftBleedDamages,
                    rightBleedDamages,
                    'Rift Nova distributed damages'));
            }

            if (leftDamages.length > 0) { 
                const leftDamagesValue = leftDamages.map(damage => damage.displaySynergy).reduce((t, v) => add(t, v), <number | MinMax>0);
                const rightDamagesValue = rightDamages.map(damage => damage.displaySynergy).reduce((t, v) => add(t, v), <number | MinMax>0);
                result.push(this.buildCharacterStatDifference(leftDamagesValue, rightDamagesValue, left.name));
            }
        }

        return result;
    }

    private getAdditionalDifferences(left: Character, right: Character): Array<CharacterStatDifference> {
        return [];
    }

    public compareCharacters(left: Character, right: Character): Array<CharacterStatDifference> {
        let result: Array<CharacterStatDifference> = [];

        result.push(this.getCharacterStatDifference(left, right, 'max_health'));
        result.push(this.getCharacterStatDifference(left, right, 'max_mana'));

        result.push(this.getCharacterStatDifference(left, right, 'armor'));
        result.push(this.getCharacterStatDifference(left, right, 'elemental_resist'));
        result.push(this.getCharacterStatDifference(left, right, 'dodge'));

        result.push(this.getCharacterStatDifference(left, right, 'elemental_damage'));
        result.push(this.getCharacterStatDifference(left, right, 'physical_damage'));

        result.push(...this.getSkillDps(left.supportSkill, right.supportSkill));
        result.push(...this.getSkillDps(left.primarySkill, right.primarySkill));
        result.push(...this.getSkillDps(left.secondarySkill, right.secondarySkill));
        result.push(...this.getAdditionalDifferences(left, right));
        
        return result.filter(difference => difference.difference !== 0).sort((a, b) => - compare(a.difference, b.difference));
    }
    
}