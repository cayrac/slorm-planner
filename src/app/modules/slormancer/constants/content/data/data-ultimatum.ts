import { DataUltimatum } from '../../../model/content/data/data-ultimatum';
import { EffectValueUpgradeType } from '../../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { UltimatumType } from '../../../model/content/enum/ultimatum-type';
import { effectValueVariable } from '../../../util/effect-value.util';

export const DATA_ULTIMATUM = {
    [UltimatumType.InfiniteWisdom]: <DataUltimatum>{
        value: () => effectValueVariable(20, 3, EffectValueUpgradeType.UpgradeRank, true, 'xp_find', EffectValueValueType.Stat),
        extendedMalus: false
    },
    [UltimatumType.IndisputedSpeed]: <DataUltimatum>{
        value: () => effectValueVariable(2.6, 0.05, EffectValueUpgradeType.UpgradeRank, false, 'movement_speed', EffectValueValueType.Stat),
        extendedMalus: false
    },
    [UltimatumType.AdamantAbundance]: <DataUltimatum>{
        value: () => effectValueVariable(100, 15, EffectValueUpgradeType.UpgradeRank, false, 'mana_regeneration', EffectValueValueType.Stat),
        extendedMalus: false
    },
    [UltimatumType.EndlessWealth]: <DataUltimatum>{
        value: () => effectValueVariable(25, 5, EffectValueUpgradeType.UpgradeRank, true, 'gold_find', EffectValueValueType.Stat),
        extendedMalus: false
    },
    [UltimatumType.EchoingBeyond]: <DataUltimatum>{
        value: () => effectValueVariable(15, 1.5, EffectValueUpgradeType.UpgradeRank, true, 'recast_chance', EffectValueValueType.Stat),
        extendedMalus: true
    },
    [UltimatumType.ProfoundDepth]: <DataUltimatum>{
        value: () => effectValueVariable(20, 2.5, EffectValueUpgradeType.UpgradeRank, true, 'reduced_on_area', EffectValueValueType.Stat),
        extendedMalus: false
    },
    [UltimatumType.PerfectSegmentation]: <DataUltimatum>{
        value: () => effectValueVariable(10, 2, EffectValueUpgradeType.UpgradeRank, true, 'fork_chance', EffectValueValueType.Stat),
        extendedMalus: true
    },
    [UltimatumType.ImpeccableTechnique]: <DataUltimatum>{
        value: () => effectValueVariable(15, 1.5, EffectValueUpgradeType.UpgradeRank, true, 'inner_fire_chance', EffectValueValueType.Stat),
        extendedMalus: true
    },
    [UltimatumType.FlawlessPower]: <DataUltimatum>{
        value: () => effectValueVariable(175, 7, EffectValueUpgradeType.UpgradeRank, true, 'critical_damage', EffectValueValueType.Stat),
        extendedMalus: true
    },
    [UltimatumType.SplendidHorizon]: <DataUltimatum>{
        value: () => effectValueVariable(15, 2, EffectValueUpgradeType.UpgradeRank, true, 'increased_on_elite', EffectValueValueType.Stat),
        extendedMalus: true
    },
    [UltimatumType.ProdigiousCalamity]: <DataUltimatum>{
        value: () => effectValueVariable(10, 1.5, EffectValueUpgradeType.UpgradeRank, true, 'attack_speed', EffectValueValueType.Stat),
        extendedMalus: true
    },
    [UltimatumType.MarvelousJudgment]: <DataUltimatum>{
        value: () => effectValueVariable(15, 1.5, EffectValueUpgradeType.UpgradeRank, true, 'aoe_increased_size', EffectValueValueType.Stat),
        extendedMalus: true
    },
    [UltimatumType.PerpendicularParallelism]: <DataUltimatum>{
        value: () => effectValueVariable(1.1, 0.06, EffectValueUpgradeType.UpgradeRank, false, 'additional_projectile', EffectValueValueType.Stat),
        extendedMalus: true
    },
    [UltimatumType.DivineIntervention]: <DataUltimatum>{
        value: () => effectValueVariable(10, 1.5, EffectValueUpgradeType.UpgradeRank, true, 'critical_chance', EffectValueValueType.Stat),
        extendedMalus: true
    },
    [UltimatumType.StoicWrath]: <DataUltimatum>{
        value: () => effectValueVariable(7.5, 0.5, EffectValueUpgradeType.UpgradeRank, true, 'ancestral_chance', EffectValueValueType.Stat),
        extendedMalus: true
    },
}