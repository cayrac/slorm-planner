import { Injectable } from '@angular/core';

import { GAME_DATA } from '../constants/game/game-data';
import { GameDataStat } from '../model/game/data/game-data-stat';
import { GameAffixe } from '../model/game/game-item';

@Injectable()
export class SlormancerGameDataService {

    public getGameDataStat(affixe: GameAffixe): GameDataStat {
        const stat = GAME_DATA.STAT.find(stat => stat.REF_NB === affixe.type);

        if (stat === undefined) {
            throw new Error('No game data found for affixe type ' + affixe.type);
        }

        return stat;
    }
}