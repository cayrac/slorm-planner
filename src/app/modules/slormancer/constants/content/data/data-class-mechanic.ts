import { DataClassMechanic } from '../../../model/content/data/data-class-mechanic';
import { EffectValueUpgradeType } from '../../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { HeroClass } from '../../../model/content/enum/hero-class';
import { GameHeroesData } from '../../../model/parser/game/game-save';
import { effectValueSynergy } from '../../../util/effect-value.util';

export const DATA_CLASS_MECHANIC: GameHeroesData<{ [key: number]:  DataClassMechanic }> = {
    [HeroClass.Warrior]: {
        216: {
            values: [
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'skewer_damage_percent', 'percent', EffectValueValueType.Stat),
                effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'skewer_max_stacks', 'stacks', EffectValueValueType.Stat),
            ]
        }
    },
    [HeroClass.Huntress]: { },
    [HeroClass.Mage]: { },
}