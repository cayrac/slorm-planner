import { DataClassMechanic } from '../../../model/content/data/data-class-mechanic';
import { EffectValueUpgradeType } from '../../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { HeroClass } from '../../../model/content/enum/hero-class';
import { SkillGenre } from '../../../model/content/enum/skill-genre';
import { GameHeroesData } from '../../../model/parser/game/game-save';
import { effectValueConstant, effectValueSynergy } from '../../../util/effect-value.util';
import {
    ASTRAL_METEOR_DAMAGE_PERCENT,
    ASTRAL_RETRIBUTION_DAMAGE_PERCENT,
    POISON_DAMAGE_PERCENT,
    POISON_DURATION,
    RAVENOUS_DAGGER_DAMAGE_PERCENT,
} from '../../common';

export const DATA_CLASS_MECHANIC: GameHeroesData<{ [key: number]:  DataClassMechanic }> = {
    [HeroClass.Warrior]: {
        216: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'skewer_damage_percent', 'percent', EffectValueValueType.Stat),
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'skewer_max_stacks', 'stacks', EffectValueValueType.Stat),
            ]
        },
        217: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'astral_retribution_damage', 'weapon_damage', EffectValueValueType.Stat, undefined, 3),
                effectValueConstant(ASTRAL_RETRIBUTION_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'astral_meteor_damage', 'skill_damage', EffectValueValueType.Stat, undefined, 3),
                effectValueConstant(ASTRAL_METEOR_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueConstant(1.5, false, 'astral_meteor_aoe', EffectValueValueType.AreaOfEffect),
            ]
        },
        218: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'block_damage_reduction', 'percent', EffectValueValueType.Stat),
            ]
        }
    },
    [HeroClass.Huntress]: {
        209: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'ravenous_dagger_damage', 'physical_damage', EffectValueValueType.Stat, undefined, 3),
                effectValueConstant(RAVENOUS_DAGGER_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
            ],
            genres: [ SkillGenre.AreaOfEffect ]
        },
        211: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'poison_damage', 'physical_damage', EffectValueValueType.Stat, undefined, 3),
                effectValueConstant(POISON_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueConstant(POISON_DURATION, false, 'duration', EffectValueValueType.Stat),
            ],
            genres: [ SkillGenre.DamageOverTime ]
        }
    },
    [HeroClass.Mage]: { },
}