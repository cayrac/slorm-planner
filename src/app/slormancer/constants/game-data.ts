import { GameDataReaper } from '../model/game/reaper';
import { GameDataStat } from '../model/game/stat';
import * as REAPER from './game/dat_rea.json';
import * as STAT from './game/dat_sta.json';

export const GAME_DATA = {
    REAPER: <Array<GameDataReaper>> Array.from(REAPER),
    STAT: <Array<GameDataStat>> Array.from(STAT)
};