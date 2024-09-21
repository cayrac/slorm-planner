import { DataMechanic } from '../../../model/content/data/data-mechanic';
import { EffectValueUpgradeType } from '../../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { MechanicType } from '../../../model/content/enum/mechanic-type';
import { SkillGenre } from '../../../model/content/enum/skill-genre';
import { SkillElement } from '../../../model/content/skill-element';
import { effectValueConstant, effectValueSynergy } from '../../../util/effect-value.util';
import { SHIELD_DURATION } from '../../common';

export const DATA_MECHANIC: { [key: string]:  DataMechanic} = {
    [MechanicType.InnerFire]: {
        values: [
            effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'inner_fire_duration', 'duration', EffectValueValueType.Stat),
            effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'inner_fire_damage', 'basic_damage', EffectValueValueType.Stat),
            effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'inner_fire_max_number', 'max', EffectValueValueType.Stat),
        ]
    },
    [MechanicType.ShieldGlobe]: {
        values: [
            effectValueConstant(SHIELD_DURATION, false, 'duration', EffectValueValueType.Stat),
            effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'shield_globe_value', 'shield', EffectValueValueType.Stat, undefined, 2, false),
        ]
    },
    [MechanicType.Overdrive]: {
        values: [
            effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'overdrive_bounce_number', 'bounces', EffectValueValueType.Stat),
            effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'overdrive_damage', 'basic_damage', EffectValueValueType.Stat),
        ]
    },
    [MechanicType.Fireball]: {
        values: [
            effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'elemental_damage', EffectValueValueType.Stat),
            effectValueConstant(100, false, 'garbage_stat', EffectValueValueType.Stat),
        ]
    },
    [MechanicType.WalkingBomb]: {
        values: [
            effectValueConstant(2, false, 'duration', EffectValueValueType.Stat),
            effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'elemental_damage', EffectValueValueType.Stat, undefined, 2),
            effectValueConstant(100, false, 'garbage_stat', EffectValueValueType.Stat),
            effectValueConstant(1, false, 'walking_bomb_aoe', EffectValueValueType.AreaOfEffect),
        ],
        genres: [SkillGenre.AreaOfEffect]
    },
    [MechanicType.Dart]: {
        values: [
            effectValueSynergy(25, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'elemental_damage', EffectValueValueType.Stat),
            effectValueConstant(25, false, 'garbage_stat', EffectValueValueType.Stat),
        ]
    },
    [MechanicType.Frostbolt]: {
        values: [
            effectValueSynergy(80, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'elemental_damage', EffectValueValueType.Stat, undefined, 1),
            effectValueConstant(80, false, 'garbage_stat', EffectValueValueType.Stat),
        ]
    },
    [MechanicType.LightningRod]: {
        values: [
            effectValueConstant(7, false, 'duration', EffectValueValueType.Duration),
            effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'elemental_damage', EffectValueValueType.Stat, undefined, 1),
            effectValueConstant(100, false, 'garbage_stat', EffectValueValueType.Stat),
        ],
        genres: [SkillGenre.Totem],
        element: SkillElement.Lightning,
        template: template => template.replace('between 1 and ', '')
    },
    [MechanicType.SoulBound]: {
        values: [
            effectValueSynergy(15, 0, EffectValueUpgradeType.None, false, 'basic_damage', 'basic_damage', EffectValueValueType.Stat, undefined, 2),
            effectValueConstant(15, false, 'garbage_stat', EffectValueValueType.Stat),
            effectValueConstant(10, false, 'garbage_stat', EffectValueValueType.Stat),
        ]
    },
    [MechanicType.Burn]: {
        values: [
            effectValueSynergy(200, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'elemental_damage', EffectValueValueType.Stat, undefined, 2),
            effectValueConstant(200, false, 'garbage_stat', EffectValueValueType.Stat),
            effectValueConstant(7, false, 'garbage_stat', EffectValueValueType.Stat),
        ],
        genres: [SkillGenre.DamageOverTime],
    },
    [MechanicType.Blorm]: {
        values: [
            effectValueConstant(10, false, 'garbage_stat', EffectValueValueType.Stat),
            effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'physical_damage', 'physical_damage', EffectValueValueType.Stat, undefined, 3),
            effectValueConstant(100, false, 'garbage_stat', EffectValueValueType.Stat),
        ],
        genres: [SkillGenre.Minion],
    },
}