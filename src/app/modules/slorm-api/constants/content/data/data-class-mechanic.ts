import { DataClassMechanic } from '../../../model/content/data/data-class-mechanic';
import { EffectValueUpgradeType } from '../../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { HeroClass } from '../../../model/content/enum/hero-class';
import { SkillGenre } from '../../../model/content/enum/skill-genre';
import { GameHeroesData } from '../../../model/parser/game/game-save';
import { effectValueConstant, effectValueSynergy } from '../../../util/effect-value.util';
import {
    ARCANE_BOND_DAMAGE_FROM_MANA_SPENT,
    ARCANE_BOND_DAMAGE_FROM_MAX_MANA,
    ARCANE_CLONE_ATTACK_SPEED_REDUCTION,
    ASTRAL_METEOR_AOE,
    ASTRAL_METEOR_DAMAGE_PERCENT,
    ASTRAL_RETRIBUTION_DAMAGE_PERCENT,
    POISON_DAMAGE_PERCENT,
    POISON_DURATION,
    RAVENOUS_DAGGER_DAMAGE_PERCENT,
    TRAP_AOE,
    TRAP_DAMAGE_PERCENT,
    TRAP_STUN_DURATION,
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
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'weapon_damage', 'astral_retribution_damage', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true),
                effectValueConstant(ASTRAL_RETRIBUTION_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'skill_damage', 'astral_meteor_damage', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true),
                effectValueConstant(ASTRAL_METEOR_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueConstant(ASTRAL_METEOR_AOE, false, 'astral_meteor_aoe', EffectValueValueType.AreaOfEffect),
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
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'ravenous_dagger_damage', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true),
                effectValueConstant(RAVENOUS_DAGGER_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
            ],
            genres: [ SkillGenre.AreaOfEffect ]
        },
        210: {
            values: [
                effectValueSynergy(TRAP_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'trap_damage', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true),
                effectValueConstant(TRAP_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueConstant(TRAP_AOE, false, 'trap_aoe', EffectValueValueType.AreaOfEffect),
                effectValueConstant(TRAP_STUN_DURATION, false, 'trap_stun_duration', EffectValueValueType.Duration),
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'trap_arm_time', 'garbage_stat', EffectValueValueType.Stat, undefined, 3, false),
            ],
            genres: [ SkillGenre.AreaOfEffect ],
            templateOverride: template => template.replace('£', '$')
        },
        211: {
            values: [
                effectValueSynergy(POISON_DAMAGE_PERCENT, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'poison_damage', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true),
                effectValueConstant(POISON_DAMAGE_PERCENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueConstant(POISON_DURATION, false, 'duration', EffectValueValueType.Stat),
            ],
            genres: [ SkillGenre.DamageOverTime ]
        }
    },
    [HeroClass.Mage]: {
        214: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'max_emblems', 'max', EffectValueValueType.Stat, undefined, 3),
            ],
            templateOverride: template => template.replace('¥', '$')
        },
        215: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'time_lock_duration', 'duration', EffectValueValueType.Stat, undefined, 3),
            ]
        },
        216: {
            values: [                
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'arcane_bond_damage', 'garbage_stat', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true),
                effectValueConstant(ARCANE_BOND_DAMAGE_FROM_MANA_SPENT, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueConstant(ARCANE_BOND_DAMAGE_FROM_MAX_MANA, false, 'garbage_stat', EffectValueValueType.Stat),
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'arcane_bond_duration', 'duration', EffectValueValueType.Stat, undefined, 3),
            ],
            templateOverride: template => template.replace('£', '@').replace('_', '$')
        },
        217: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'remnant_decreased_damage', 'garbage_stat', EffectValueValueType.Stat, undefined, 3, undefined, undefined, undefined, true),
            ]
        },
        218: {
            values: [
                effectValueConstant(ARCANE_CLONE_ATTACK_SPEED_REDUCTION, false, 'garbage_stat', EffectValueValueType.Stat),
            ]
            
        }
    },
}