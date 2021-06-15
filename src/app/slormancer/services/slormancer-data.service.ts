import { Injectable } from '@angular/core';

import { AFFIX_DATA, AffixData } from '../constants/affix-data';
import { EQUIPABLE_ITEM_DATA } from '../constants/equipable-item-data';
import { EquipableItemType } from '../constants/equipable-item-type';
import { GAME_DATA } from '../constants/game/game-data';
import { EquipableItemTypeData } from '../model/equipable-item-type-data';
import { GameDataStat } from '../model/game/data/game-data-stat';
import { GameAffix } from '../model/game/game-item';

@Injectable()
export class SlormancerGameDataService {

    public getGameStatData(affix: GameAffix): GameDataStat | null {
        const stat = GAME_DATA.STAT.find(stat => stat.REF_NB === affix.type);
        return stat ? stat : null;
    }

    public getEquipableItemData(type: EquipableItemType, base: string): EquipableItemTypeData | null {
        let result: EquipableItemTypeData | null = null;

        const typeData = EQUIPABLE_ITEM_DATA[type];
        if (typeData !== undefined) {
            const data = typeData[base];
            if (data !== undefined) {
                result = data;
            }
        }

        return result;
    }

    public getAffixData(affix: GameAffix): AffixData | null {
        const stat = this.getGameStatData(affix);
        let result: AffixData | null = null;

        if (stat !== null) {
            const affixData = AFFIX_DATA[stat.REF];

            if (affixData) {
                result = affixData;
            }
        }

        return result;
    }
}