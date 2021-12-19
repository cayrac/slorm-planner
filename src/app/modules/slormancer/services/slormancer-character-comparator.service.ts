import { Injectable } from '@angular/core';

import { Character, CharacterAncestralLegacies, CharacterSkillAndUpgrades } from '../model/character';
import { CharacterStatDifference } from '../model/character-stat-differences';
import { Activable } from '../model/content/activable';
import { EffectValueSynergy } from '../model/content/effect-value';
import { ALL_GEAR_SLOT_VALUES } from '../model/content/enum/gear-slot';
import { HeroClass } from '../model/content/enum/hero-class';
import { LegendaryEffect } from '../model/content/legendary-effect';
import { Reaper } from '../model/content/reaper';
import { SkillUpgrade } from '../model/content/skill-upgrade';
import { MinMax } from '../model/minmax';
import { add, round } from '../util/math.util';
import { compare, isDamageType, isEffectValueSynergy, isFirst, isNotNullOrUndefined, valueOrNull } from '../util/utils';
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

    private addCharacterStatDifference(differences: Array<CharacterStatDifference>, left: Character, right: Character, stat: string) {
        const leftStat = left.stats.find(mergedStat => mergedStat.stat === stat);
        const rightStat = right.stats.find(mergedStat => mergedStat.stat === stat);
        const leftValue = leftStat ? leftStat.total : 0;
        const rightValue = rightStat ? rightStat.total : 0;

        differences.push(this.buildCharacterStatDifference(leftValue, rightValue, this.slormancerTranslateService.translate(stat)));
    }

    private addSkillDps(differences: Array<CharacterStatDifference>, left: CharacterSkillAndUpgrades | null, right: CharacterSkillAndUpgrades | null) {
        if (left && right && left.skill.heroClass === right.skill.heroClass && left.skill.id === right.skill.id) {
            let leftDamages  = left.skill.values.filter(value => isDamageType(value.stat)).filter(isEffectValueSynergy);
            let rightDamages  = right.skill.values.filter(value => isDamageType(value.stat)).filter(isEffectValueSynergy);

            // Throwing sword
            if (left.skill.heroClass === HeroClass.Warrior && left.skill.id === 5) {
                leftDamages = [<EffectValueSynergy>left.skill.values[0]];
                rightDamages = [<EffectValueSynergy>right.skill.values[0]];
                const leftBleedDamages = (<EffectValueSynergy>left.skill.values[1]).displaySynergy;
                const rightBleedDamages = (<EffectValueSynergy>right.skill.values[1]).displaySynergy;
                differences.push(this.buildCharacterStatDifference(
                    leftBleedDamages,
                    rightBleedDamages,
                    this.slormancerTranslateService.translate('bleed_damage')));
            }
            // Cadence
            if (left.skill.heroClass === HeroClass.Warrior && left.skill.id === 6) {
                leftDamages = [<EffectValueSynergy>left.skill.values[0]];
                rightDamages = [<EffectValueSynergy>right.skill.values[0]];
                const leftBleedDamages = (<EffectValueSynergy>left.skill.values[1]).displaySynergy;
                const rightBleedDamages = (<EffectValueSynergy>right.skill.values[1]).displaySynergy;
                differences.push(this.buildCharacterStatDifference(
                    leftBleedDamages,
                    rightBleedDamages,
                    'Magnified ' + left.skill.name));
            }
            // The Elder Lance
            if (left.skill.heroClass === HeroClass.Warrior && left.skill.id === 10) {
                leftDamages = [<EffectValueSynergy>left.skill.values[1]];
                rightDamages = [<EffectValueSynergy>right.skill.values[1]];
                const leftBleedDamages = (<EffectValueSynergy>left.skill.values[0]).displaySynergy;
                const rightBleedDamages = (<EffectValueSynergy>right.skill.values[0]).displaySynergy;
                differences.push(this.buildCharacterStatDifference(
                    leftBleedDamages,
                    rightBleedDamages,
                    'Training Lance'));
            }
            // The Elder Lance
            if (left.skill.heroClass === HeroClass.Mage && left.skill.id === 6) {
                leftDamages = [<EffectValueSynergy>left.skill.values[0]];
                rightDamages = [<EffectValueSynergy>right.skill.values[0]];
                const leftBleedDamages = (<EffectValueSynergy>left.skill.values[1]).displaySynergy;
                const rightBleedDamages = (<EffectValueSynergy>right.skill.values[1]).displaySynergy;
                differences.push(this.buildCharacterStatDifference(
                    leftBleedDamages,
                    rightBleedDamages,
                    'Rift Nova (distributed)'));
            }

            if (leftDamages.length > 0) { 
                const leftDamagesValue = leftDamages.map(damage => damage.displaySynergy).reduce((t, v) => add(t, v), <number | MinMax>0);
                const rightDamagesValue = rightDamages.map(damage => damage.displaySynergy).reduce((t, v) => add(t, v), <number | MinMax>0);
                differences.push(this.buildCharacterStatDifference(leftDamagesValue, rightDamagesValue, left.skill.name));
            }
        }
    }

    private addActivableDps(differences: Array<CharacterStatDifference>, left: Activable | null, right: Activable | null) {
        if (left && right && left.id === right.id) {
            const leftSynergyDamages = left.values.filter(value => isDamageType(value.stat));
            const rightSynergyDamages = right.values.filter(value => isDamageType(value.stat));
            if (leftSynergyDamages.length > 0 && rightSynergyDamages.length > 0) {
                const leftDamages = leftSynergyDamages
                    .reduce((total, value) => add(total, (<EffectValueSynergy>value).displaySynergy), <number | MinMax>0);
                const rightDamages = rightSynergyDamages
                    .reduce((total, value) => add(total, (<EffectValueSynergy>value).displaySynergy), <number | MinMax>0);
                differences.push(this.buildCharacterStatDifference(leftDamages, rightDamages, left.name));
            }
        }
    }

    private addPassiveDamages(differences: Array<CharacterStatDifference>, left: CharacterSkillAndUpgrades | null, right: CharacterSkillAndUpgrades | null) {
        if (left && right && left.skill.heroClass === right.skill.heroClass && left.skill.id === right.skill.id) {
            const commonUpgrades = left.selectedUpgrades.filter(upgrade => right.selectedUpgrades.includes(upgrade));

            for (const commonUpgrade of commonUpgrades) {
                const leftUpgrade = <SkillUpgrade>left.upgrades.find(upgrade => upgrade.id === commonUpgrade);
                const rightUpgrade = <SkillUpgrade>right.upgrades.find(upgrade => upgrade.id === commonUpgrade);

                if (leftUpgrade && rightUpgrade) {
                    const leftSynergyDamage = leftUpgrade.values
                        .filter(value => isDamageType(value.stat))
                        .reduce((total, value) => add(total, (<EffectValueSynergy>value).displaySynergy), <number | MinMax>0);
                    const rightSynergyDamage = rightUpgrade.values
                        .filter(value => isDamageType(value.stat))
                        .reduce((total, value) => add(total, (<EffectValueSynergy>value).displaySynergy), <number | MinMax>0);
                    differences.push(this.buildCharacterStatDifference(leftSynergyDamage, rightSynergyDamage, leftUpgrade.name));
                }
            }
        }
    }

    private addAdditionalDifferences(differences: Array<CharacterStatDifference>, left: Character, right: Character) {
        this.addCharacterStatDifference(differences, left, right, 'inner_fire_damage');
        this.addCharacterStatDifference(differences, left, right, 'overdrive_damage');
    }

    private addReaperDamages(differences: Array<CharacterStatDifference>, left: Reaper, right: Reaper) {
        const leftSynergyDamages = [...left.templates.base, ...left.templates.benediction, ...left.templates.malediction]
            .map(effect => effect.values).flat()
            .filter(value => isDamageType(value.stat))
            .map(value => (<EffectValueSynergy>value).displaySynergy);
        const rightSynergyDamages = [...right.templates.base, ...right.templates.benediction, ...right.templates.malediction]
            .map(effect => effect.values).flat()
            .filter(value => isDamageType(value.stat))
            .map(value => (<EffectValueSynergy>value).displaySynergy);

        if (left.id === 46 && right.id === 46) {
            differences.push(this.buildCharacterStatDifference(<MinMax | number>leftSynergyDamages[0], <MinMax | number>rightSynergyDamages[0], 'Affliction'));
        } else if ([65, 66, 67].includes(left.id) && [65, 66, 67].includes(right.id)) {
            differences.push(this.buildCharacterStatDifference(<MinMax | number>leftSynergyDamages[0], <MinMax | number>rightSynergyDamages[0], 'Vindictive Slam'));
            if (left.primordial && right.primordial) {
                differences.push(this.buildCharacterStatDifference(<MinMax | number>leftSynergyDamages[1], <MinMax | number>rightSynergyDamages[1], 'Holy Ground'));
            }
        } else if ([78, 79, 80].includes(left.id) && [78, 79, 80].includes(right.id)) {
            differences.push(this.buildCharacterStatDifference(<MinMax | number>leftSynergyDamages[0], <MinMax | number>rightSynergyDamages[0], 'Exhaustion'));
        } else if ([81, 82, 83].includes(left.id) && [81, 82, 83].includes(right.id)) {
            differences.push(this.buildCharacterStatDifference(<MinMax | number>leftSynergyDamages[0], <MinMax | number>rightSynergyDamages[0], 'Crystal Shard'));
        }

        let commonActivableIds = left.activables
            .map(activable => activable.id)
            .filter(id => right.activables.some(activable => activable.id === id));
        
        for (const activableId of commonActivableIds) {
            const leftActivable = left.activables.find(activable => activable.id === activableId);
            const rightActivable = right.activables.find(activable => activable.id === activableId);

            if (leftActivable && rightActivable) {
                this.addActivableDps(differences, leftActivable, rightActivable);
            }
        }
    }

    private addAncestralLegacyDamages(differences: Array<CharacterStatDifference>, left: CharacterAncestralLegacies, right: CharacterAncestralLegacies) {
        const commonIds = left.activeAncestralLegacies.filter(id => right.activeAncestralLegacies.includes(id));

        for (const commonId of commonIds) {
            const leftAncestralLegacy = left.ancestralLegacies[commonId];
            const rightAncestralLegacy = right.ancestralLegacies[commonId];

            if (leftAncestralLegacy && rightAncestralLegacy) {
                const leftSynergyDamages = leftAncestralLegacy.values
                    .filter(value => isDamageType(value.stat))
                    .map(value => (<EffectValueSynergy>value).displaySynergy);
                const rightSynergyDamages = rightAncestralLegacy.values
                    .filter(value => isDamageType(value.stat))
                    .map(value => (<EffectValueSynergy>value).displaySynergy);
        
                if (leftSynergyDamages.length > 0 && rightSynergyDamages.length > 0) {
                    differences.push(this.buildCharacterStatDifference(<MinMax | number>leftSynergyDamages[0], <MinMax | number>rightSynergyDamages[0], leftAncestralLegacy.name));
                }
            }
        }
    }

    private addLegendariesDamages(differences: Array<CharacterStatDifference>, left: Character, right: Character) {
        const leftLegendaries = ALL_GEAR_SLOT_VALUES
            .map(slot => left.gear[slot]?.legendaryEffect)
            .filter(isNotNullOrUndefined)
            .filter((effect, index, effects) => isFirst(effect, index, effects, (a, b) => a.id === b.id));
        const rightLegendaries = ALL_GEAR_SLOT_VALUES
            .map(slot => right.gear[slot]?.legendaryEffect)
            .filter(isNotNullOrUndefined)
            .filter((effect, index, effects) => isFirst(effect, index, effects, (a, b) => a.id === b.id));

        let commonLegendaryIds = leftLegendaries
            .map(effect => effect.id)
            .filter(id => rightLegendaries.some(effect => effect.id === id));

        for (const commonId of commonLegendaryIds) {
            const leftLegendary = <LegendaryEffect>leftLegendaries.find(leftLegendary => leftLegendary.id === commonId);
            const rightLegendary = <LegendaryEffect>rightLegendaries.find(rightLegendary => rightLegendary.id === commonId);

            

            const leftSynergyDamages = leftLegendary.effects
                .filter(value => isDamageType(value.effect.stat))
                .map(value => (<EffectValueSynergy>value.effect).displaySynergy);
            const rightSynergyDamages = rightLegendary.effects
                .filter(value => isDamageType(value.effect.stat))
                .map(value => (<EffectValueSynergy>value.effect).displaySynergy);
    
            if (leftSynergyDamages.length > 0 && rightSynergyDamages.length > 0) {
                differences.push(this.buildCharacterStatDifference(<MinMax | number>leftSynergyDamages[0], <MinMax | number>rightSynergyDamages[0], leftLegendary.name));
            }

            this.addActivableDps(differences, leftLegendary.activable, rightLegendary.activable);
        }
    }

    public compareCharacters(left: Character, right: Character): Array<CharacterStatDifference> {
        let result: Array<CharacterStatDifference> = [];

        this.addCharacterStatDifference(result, left, right, 'max_health')
        this.addCharacterStatDifference(result, left, right, 'max_mana');

        this.addCharacterStatDifference(result, left, right, 'armor');
        this.addCharacterStatDifference(result, left, right, 'elemental_resist');
        this.addCharacterStatDifference(result, left, right, 'dodge');

        this.addCharacterStatDifference(result, left, right, 'elemental_damage');
        this.addCharacterStatDifference(result, left, right, 'physical_damage');

        let leftSkill = valueOrNull(left.skills.find(skillAndUpgrade => skillAndUpgrade.skill === left.supportSkill));
        let rightSkill = valueOrNull(right.skills.find(skillAndUpgrade => skillAndUpgrade.skill === right.supportSkill));
        this.addSkillDps(result, leftSkill, rightSkill);
        this.addPassiveDamages(result, leftSkill, rightSkill);
        leftSkill = valueOrNull(left.skills.find(skillAndUpgrade => skillAndUpgrade.skill === left.primarySkill));
        rightSkill = valueOrNull(right.skills.find(skillAndUpgrade => skillAndUpgrade.skill === right.primarySkill));
        this.addSkillDps(result, leftSkill, rightSkill);
        this.addPassiveDamages(result, leftSkill, rightSkill);
        leftSkill = valueOrNull(left.skills.find(skillAndUpgrade => skillAndUpgrade.skill === left.secondarySkill));
        rightSkill = valueOrNull(right.skills.find(skillAndUpgrade => skillAndUpgrade.skill === right.secondarySkill));
        this.addSkillDps(result, leftSkill, rightSkill);
        this.addPassiveDamages(result, leftSkill, rightSkill);

        this.addReaperDamages(result, left.reaper, right.reaper);

        this.addAncestralLegacyDamages(result, left.ancestralLegacies, right.ancestralLegacies);

        this.addLegendariesDamages(result, left, right);

        this.addAdditionalDifferences(result, left, right);
        
        return result
            .filter(difference => difference.difference !== 0)
            .sort((a, b) => - compare(a.difference, b.difference));
    }
    
}