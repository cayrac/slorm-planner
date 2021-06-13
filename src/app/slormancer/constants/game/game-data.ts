import { GameDataReaper } from '../../model/game/data/game-data-reaper';
import { GameDataStat } from '../../model/game/data/game-data-stat';
import * as REAPER from './data/dat_rea.json';
import * as STAT from './data/dat_sta.json';

export const GAME_DATA = {
    REAPER: <Array<GameDataReaper>> Array.from(REAPER),
    STAT: <Array<GameDataStat>> Array.from(STAT)
};