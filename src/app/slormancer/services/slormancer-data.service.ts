import { Injectable } from '@angular/core';

import { DATA_ACTIVABLE } from '../constants/data/data-activable';
import { DATA_AFFIX } from '../constants/data/data-affix';
import { DATA_EQUIPABLE_ITEM } from '../constants/data/data-equipable-item';
import { DATA_KEYWORD_NAME } from '../constants/data/data-keyword-name';
import { DATA_LEGENDARY } from '../constants/data/data-legendary';
import { DATA_LEGENDARY_BASE } from '../constants/data/data-legendary-base';
import { DATA_REAPER_BUILDER } from '../constants/data/data-reaper-builder';
import { GAME_DATA } from '../constants/game/game-data';
import { DataActivable } from '../model/data/data-activable';
import { DataAffix } from '../model/data/data-affix';
import { DataEquipableItemType } from '../model/data/data-equipable-item-type';
import { DataLegendary } from '../model/data/data-legendary';
import { DataReaperBuilder } from '../model/data/data-reaper-builder';
import { EquipableItemType } from '../model/enum/equipable-item-type';
import { HeroClass } from '../model/enum/hero-class';
import { GameDataActivable } from '../model/game/data/game-data-activable';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { GameDataSkill } from '../model/game/data/game-data-skill';
import { GameDataStat } from '../model/game/data/game-data-stat';
import { GameAffix } from '../model/game/game-item';
import { valueOrNull } from '../util/utils';

@Injectable()
export class SlormancerDataService {

    public getGameDataStat(affix: GameAffix): GameDataStat | null {
        return valueOrNull(GAME_DATA.STAT.find(stat => stat.REF_NB === affix.type));
    }    
    
    public getGameDataSkill(heroClass: HeroClass, id: number): GameDataSkill | null {
        console.log(GAME_DATA.SKILL, heroClass);
        return valueOrNull(GAME_DATA.SKILL[heroClass].find(skill => skill.REF === id));
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
        return valueOrNull(DATA_AFFIX[ref]);
    }

    public getGameDataLegendary(id: number): GameDataLegendary | null {
        return valueOrNull(GAME_DATA.LEGENDARY.find(leg => leg.REF === id));
    }

    public getDataReaperBuilder(type: number): DataReaperBuilder | null {
        return valueOrNull(DATA_REAPER_BUILDER.find(builder => builder.type === type));
    }

    public getDataLegendary(id: number): DataLegendary | null {
        return valueOrNull(DATA_LEGENDARY[id]);
    }

    public getlegendaryGameDataActivableBasedOn(id: number): GameDataActivable | null {
        const activable = GAME_DATA.ACTIVABLE
            .filter(activable => activable.BASED_ON === 'legendary')
            .find(activable => activable.ID_BASED_ON=== id);
        return valueOrNull(activable);
    }

    public getDataActivable(id: number): DataActivable | null {
        return valueOrNull(DATA_ACTIVABLE[id]);
    }

    public getBaseFromLegendaryId(id: number): string | null {
        return valueOrNull(DATA_LEGENDARY_BASE[id]);
    }

    public getKeywordName(keyword: string): string | null {
        return valueOrNull(DATA_KEYWORD_NAME[keyword]);
    }
}