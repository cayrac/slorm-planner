import { LanguageService } from '@shared/services/language.service';
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
import { GameDataReaper } from '../../../model';

const langService = new LanguageService();

function localizeGameData(data: any, suffixList: string[]) {
  const currentLang = langService.getCurrentLanguage();
  const localizedData = data.map((item: any) => {
    const newItem = { ...item };
    suffixList.forEach(suffix => {
      const key = `${currentLang}${suffix}`;
      if (key in item) {
        newItem[`LOCAL${suffix}`] = item[key];
      }
    });
    return newItem;
  });
  return localizedData;
}

export const GAME_DATA = {
    REAPER: <Array<GameDataReaper>> localizeGameData(GAME_DATA_REAPER, ['_NAME', '_DESC', '_LORE']),
    STAT: <Array<GameDataStat>> GAME_DATA_STAT,
    LEGENDARY: <Array<GameDataLegendary>> localizeGameData(GAME_DATA_LEGENDARY, ['_NAME', '_DESC']),
    RUNE: <Array<GameDataRune>> localizeGameData(GAME_DATA_RUNE, ['_NAME', '_DESCRIPTION']),
    ACTIVABLE: <Array<GameDataActivable>> localizeGameData(GAME_DATA_ACTIVABLES, ['_NAME', '_DESCRIPTION']),
    SKILL: <GameHeroesData<Array<GameDataSkill>>> {
        0: <Array<GameDataSkill>> localizeGameData(GAME_DATA_WARRIOR_SKILL, ['', '_NAME', '_DESCRIPTION']),
        1: <Array<GameDataSkill>> localizeGameData(GAME_DATA_HUNTRESS_SKILL, ['', '_NAME', '_DESCRIPTION']),
        2: <Array<GameDataSkill>> localizeGameData(GAME_DATA_MAGE_SKILL, ['', '_NAME', '_DESCRIPTION'])
    },
    TRANSLATION: <Array<GameDataTranslation>> localizeGameData(GAME_DATA_TRANSLATION, ['']),
    BUFF: <Array<GameDataBuff>> localizeGameData(GAME_DATA_BUFF, ['_NAME', '_DESCRIPTION']),
    ANCESTRAL_LEGACY: <Array<GameDataAncestralLegacy>> localizeGameData(GAME_DATA_ANCESTRAL_LEGACY, ['_NAME', '_DESCRIPTION']),
    ATTRIBUTES: <Array<GameDataAttribute>> localizeGameData(GAME_DATA_ATTRIBUTES, ['_TEXT'])
};