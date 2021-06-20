import { Injectable } from '@angular/core';

import { DATA_ACTIVABLE } from '../constants/data/data-activable';
import { DATA_AFFIX } from '../constants/data/data-affix';
import { DATA_EQUIPABLE_ITEM } from '../constants/data/data-equipable-item';
import { DATA_LEGENDARY } from '../constants/data/data-legendary';
import { GAME_DATA } from '../constants/game/game-data';
import { DataActivable } from '../model/data/data-activable';
import { DataAffix } from '../model/data/data-affix';
import { DataEquipableItemType } from '../model/data/data-equipable-item-type';
import { DataLegendary } from '../model/data/data-legendary';
import { EquipableItemType } from '../model/enum/equipable-item-type';
import { GameDataActivable } from '../model/game/data/game-data-activable';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { GameDataStat } from '../model/game/data/game-data-stat';
import { GameAffix } from '../model/game/game-item';

@Injectable()
export class SlormancerDataService {

    public getGameDataStat(affix: GameAffix): GameDataStat | null {
        const stat = GAME_DATA.STAT.find(stat => stat.REF_NB === affix.type);
        return stat ? stat : null;
    }

    public getDataEquipableItem(type: EquipableItemType, base: string): DataEquipableItemType | null {
        let result: DataEquipableItemType | null = null;

        const typeData = DATA_EQUIPABLE_ITEM[type];
        if (typeData !== undefined) {
            const data = typeData[base];
            if (data !== undefined) {
                result = data;
            }
        }

        return result;
    }

    public getDataAffix(affix: GameAffix): DataAffix | null {
        const stat = this.getGameDataStat(affix);
        let result: DataAffix | null = null;

        if (stat !== null) {
            result = this.getDataAffixByRef(stat.REF);
        }

        return result;
    }

    public getDataAffixByRef(ref: string): DataAffix | null {
        const stat = DATA_AFFIX[ref];
        return stat ? stat : null;
    }

    public getGameLegendaryData(id: number): GameDataLegendary | null {
        const legendary = GAME_DATA.LEGENDARY.find(leg => leg.REF === id);
        return legendary ? legendary : null;
    }

    public getDataLegendary(id: number): DataLegendary | null {
        const legendary = DATA_LEGENDARY[id];
        return legendary ? legendary : null;
    }

    public getlegendaryGameDataActivableBasedOn(id: number): GameDataActivable | null {
        const activable = GAME_DATA.ACTIVABLE
            .filter(activable => activable.BASED_ON === 'legendary')
            .find(activable => activable.ID_BASED_ON=== id);
        return activable ? activable : null;
    }

    public getDataActivable(id: number): DataActivable | null {
        const activable = DATA_ACTIVABLE[id];
        return activable ? activable : null;
    }
}