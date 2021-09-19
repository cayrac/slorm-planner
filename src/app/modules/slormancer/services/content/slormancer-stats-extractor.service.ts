import { Injectable } from '@angular/core';

import { Character } from '../../model/character';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { ALL_ATTRIBUTES } from '../../model/content/enum/attribute';
import { ALL_GEAR_SLOT_VALUES } from '../../model/content/enum/gear-slot';
import { Skill } from '../../model/content/skill';
import { SkillType } from '../../model/content/skill-type';
import { isEffectValueSynergy, isNotNullOrUndefined } from '../../util/utils';

export declare type CharacterExtractedStatMap = { [key: string]: Array<number> }

export interface CharacterExtractedStats {
    heroStats: CharacterExtractedStatMap,
    synergies: Array<AbstractEffectValue>
    supportStats: CharacterExtractedStatMap,
    primaryStats: CharacterExtractedStatMap,
    secondaryStats: CharacterExtractedStatMap,
}

@Injectable()
export class SlormancerStatsExtractorService {

    private getHeroEffectValues(character: Character): Array<AbstractEffectValue> {
        let effectValues: Array<AbstractEffectValue> = [];

        effectValues.push(...ALL_GEAR_SLOT_VALUES
            .map(slot => character.gear[slot])
            .filter(isNotNullOrUndefined)
            .map(item => [...item.affixes.map(affix => affix.craftedEffect), ...(item.legendaryEffect === null ? [] : item.legendaryEffect.effects)])
            .flat()
            .map(craftedEffect => craftedEffect.effect));

        effectValues.push(...ALL_ATTRIBUTES
            .map(attribute => character.attributes.allocated[attribute].values)
            .flat());

        if (character.reaper !== null) {
            effectValues.push(...character.reaper.templates.base.map(effect => effect.values).flat());
            if (character.reaper.primordial) {
                effectValues.push(...character.reaper.templates.benediction.map(effect => effect.values).flat());
                effectValues.push(...character.reaper.templates.malediction.map(effect => effect.values).flat());
            }
        }

        effectValues.push(...[character.supportSkill, character.primarySkill, character.secondarySkill]
            .filter(isNotNullOrUndefined)
            .map(skill => character.skills.find(ccu => ccu.skill === skill))
            .filter(isNotNullOrUndefined)
            .map(ccu => ccu.upgrades.filter(upgrade => upgrade.type === SkillType.Passive && ccu.selectedUpgrades.indexOf(upgrade.id) !== -1).map(upgrade => upgrade.values))
            .flat().flat());
        
        effectValues.push(...character.ancestralLegacies.ancestralLegacies
            .filter(ancestralLegacy => character.ancestralLegacies.activeAncestralLegacies.indexOf(ancestralLegacy.id) !== -1 && !ancestralLegacy.isActivable)
            .map(ancestralLegacy => ancestralLegacy.values)
            .flat());

        return effectValues;
    }

    public getSkillEffectValues(character: Character, skill: Skill | null): Array<AbstractEffectValue> {
        let effectValues: Array<AbstractEffectValue> = [];

        if (skill !== null) {
            const csu = character.skills.find(c => c.skill === skill);

            if (csu) {
                const upgrades = csu.upgrades.filter(upgrade => csu.selectedUpgrades.indexOf(upgrade.id) !== -1);

                effectValues.push(...skill.values);
                effectValues.push(...upgrades.map(upgrade => upgrade.values).flat())
            }
        }

        return effectValues;
    }

    private addStat(cache: { [key: string]: Array<number> }, stat: string, value: number) {
        let foundStat = cache[stat];

        if (foundStat === undefined) {
            foundStat = [];
            cache[stat] = foundStat;
        }

        foundStat.push(value);
    }

    public extractStats(character: Character): CharacterExtractedStats {
        const result: CharacterExtractedStats = {
            synergies:  [],
            heroStats: { },
            supportStats: { },
            primaryStats: { },
            secondaryStats: { },
        }

        const baseStats = character.baseStats.map(stat => stat.values.map(value => <[string, number]>[stat.stat, value])).flat();

        for (const baseStat of baseStats) {
            this.addStat(result.heroStats, baseStat[0], baseStat[1]);
        }

        const heroEffectValues = this.getHeroEffectValues(character);
        result.synergies.push(...heroEffectValues.filter(isEffectValueSynergy));
        for (const effectvalue of heroEffectValues) {
            if (!isEffectValueSynergy(effectvalue)) {
                this.addStat(result.heroStats, effectvalue.stat, effectvalue.value);
            }
        }

        const supportEffectValues = this.getSkillEffectValues(character, character.supportSkill);
        result.synergies.push(...supportEffectValues.filter(isEffectValueSynergy));
        for (const effectvalue of supportEffectValues) {
            if (!isEffectValueSynergy(effectvalue)) {
                this.addStat(result.heroStats, effectvalue.stat, effectvalue.value);
            }
        }

        const primaryEffectValues = this.getSkillEffectValues(character, character.primarySkill);
        result.synergies.push(...primaryEffectValues.filter(isEffectValueSynergy));
        for (const effectvalue of primaryEffectValues) {
            if (!isEffectValueSynergy(effectvalue)) {
                this.addStat(result.heroStats, effectvalue.stat, effectvalue.value);
            }
        }

        const secondaryEffectValues = this.getSkillEffectValues(character, character.secondarySkill);
        result.synergies.push(...secondaryEffectValues.filter(isEffectValueSynergy));
        for (const effectvalue of secondaryEffectValues) {
            if (!isEffectValueSynergy(effectvalue)) {
                this.addStat(result.heroStats, effectvalue.stat, effectvalue.value);
            }
        }

        if (character.reaper !== null) {
            this.addStat(result.heroStats, 'min_weapon_damage_add', character.reaper.damages.min);
            this.addStat(result.heroStats, 'max_weapon_damage_add', character.reaper.damages.max - character.reaper.damages.min);
        }            

        return result;
    }
}