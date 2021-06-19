import { Injectable } from '@angular/core';

import { AFFIX_DATA, AffixData } from '../constants/affix-data';
import { EQUIPABLE_ITEM_DATA } from '../constants/equipable-item-data';
import { EquipableItemType } from '../constants/equipable-item-type';
import { GAME_DATA } from '../constants/game/game-data';
import { LEGENDARY_DATA } from '../constants/legendary-data';
import { EquipableItemTypeData } from '../model/equipable-item-type-data';
import { ExtendedLegendaryData } from '../model/extended-legendary-data';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
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
            result = this.getAffixDataByRef(stat.REF);
        }

        return result;
    }

    public getAffixDataByRef(ref: string): AffixData | null {
        const stat = AFFIX_DATA[ref];
        return stat ? stat : null;
    }

    public getGameLegendaryData(id: number): GameDataLegendary | null {
        const legendary = GAME_DATA.LEGENDARY.find(leg => leg.REF === id);
        return legendary ? legendary : null;
    }

    public getLegendaryData(id: number): ExtendedLegendaryData | null {
        const legendary = LEGENDARY_DATA[id];
        return legendary ? legendary : null;
    }
}