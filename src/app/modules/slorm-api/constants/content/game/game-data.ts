import { GameDataActivable } from '../../../model/content/game/data/game-data-activable';
import { GameDataAncestralLegacy } from '../../../model/content/game/data/game-data-ancestral-legacy';
import { GameDataAttribute } from '../../../model/content/game/data/game-data-attribute';
import { GameDataBuff } from '../../../model/content/game/data/game-data-buff';
import { GameDataLegendary } from '../../../model/content/game/data/game-data-legendary';
import { GameDataRune } from '../../../model/content/game/data/game-data-rune';
import { GameDataSkill } from '../../../model/content/game/data/game-data-skill';
import { GameDataStat } from '../../../model/content/game/data/game-data-stat';
import { GameDataTranslation } from '../../../model/content/game/data/game-data-translation';
import { GameHeroesData } from '../../../model/parser/game/game-save';
import { GAME_DATA_ACTIVABLES } from './data/dat_act';
import { GAME_DATA_ATTRIBUTES } from './data/dat_att';
import { GAME_DATA_BUFF } from './data/dat_buf';
import { GAME_DATA_WARRIOR_SKILL } from './data/dat_cla_0';
import { GAME_DATA_HUNTRESS_SKILL } from './data/dat_cla_1';
import { GAME_DATA_MAGE_SKILL } from './data/dat_cla_2';
import { GAME_DATA_ANCESTRAL_LEGACY } from './data/dat_ele';
import { GAME_DATA_LEGENDARY } from './data/dat_leg';
import { GAME_DATA_REAPER } from './data/dat_rea';
import { GAME_DATA_RUNE } from './data/dat_run';
import { GAME_DATA_STAT } from './data/dat_sta';
import { GAME_DATA_TRANSLATION } from './data/dat_str';

export const GAME_DATA = {
    REAPER: GAME_DATA_REAPER,
    STAT: <Array<GameDataStat>> GAME_DATA_STAT,
    LEGENDARY: <Array<GameDataLegendary>> GAME_DATA_LEGENDARY,
    RUNE: <Array<GameDataRune>> GAME_DATA_RUNE,
    ACTIVABLE: <Array<GameDataActivable>> GAME_DATA_ACTIVABLES,
    SKILL: <GameHeroesData<Array<GameDataSkill>>> {
        0: <Array<GameDataSkill>>GAME_DATA_WARRIOR_SKILL,
        1: <Array<GameDataSkill>>GAME_DATA_HUNTRESS_SKILL,
        2: <Array<GameDataSkill>>GAME_DATA_MAGE_SKILL
    },
    TRANSLATION: <Array<GameDataTranslation>>GAME_DATA_TRANSLATION,
    BUFF: <Array<GameDataBuff>>GAME_DATA_BUFF,
    ANCESTRAL_LEGACY: <Array<GameDataAncestralLegacy>>GAME_DATA_ANCESTRAL_LEGACY,
    ATTRIBUTES: <Array<GameDataAttribute>>GAME_DATA_ATTRIBUTES
};