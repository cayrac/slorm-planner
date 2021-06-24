import { GameDataActivable } from '../../model/game/data/game-data-activable';
import { GameDataLegendary } from '../../model/game/data/game-data-legendary';
import { GameDataReaper } from '../../model/game/data/game-data-reaper';
import { GameDataSkill } from '../../model/game/data/game-data-skill';
import { GameDataStat } from '../../model/game/data/game-data-stat';
import { GameDataTranslation } from '../../model/game/data/game-data-translation';
import { GameHeroesData } from '../../model/game/game-save';
import * as ACTIVABLE from './data/dat_act.json';
import * as WARRIOR_SKILL from './data/dat_cla_0.json';
import * as HUNTRESS_SKILL from './data/dat_cla_1.json';
import * as MAGE_SKILL from './data/dat_cla_2.json';
import * as LEGENDARY from './data/dat_leg.json';
import * as REAPER from './data/dat_rea.json';
import * as STAT from './data/dat_sta.json';
import * as TRANSLATION from './data/dat_str.json';

export const GAME_DATA = {
    REAPER: <Array<GameDataReaper>> Array.from(REAPER),
    STAT: <Array<GameDataStat>> Array.from(STAT),
    LEGENDARY: <Array<GameDataLegendary>> Array.from(LEGENDARY),
    ACTIVABLE: <Array<GameDataActivable>> Array.from(ACTIVABLE),
    SKILL: <GameHeroesData<Array<GameDataSkill>>> {
        warrior:    <Array<GameDataSkill>>Array.from(WARRIOR_SKILL),
        huntress:   <Array<GameDataSkill>>Array.from(HUNTRESS_SKILL),
        mage:       <Array<GameDataSkill>>Array.from(MAGE_SKILL)
    },
    TRANSLATION: <Array<GameDataTranslation>>Array.from(TRANSLATION)
};