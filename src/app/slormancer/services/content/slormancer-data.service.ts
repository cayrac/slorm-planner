import { Injectable } from '@angular/core';

import { DATA_ACTIVABLE } from '../../constants/content/data/data-activable';
import { DATA_AFFIX } from '../../constants/content/data/data-affix';
import { DATA_ANCESTRAL_LEGACY } from '../../constants/content/data/data-ancestral-legacy';
import { DATA_ATTRIBUTE_MECHANIC } from '../../constants/content/data/data-attribute-mechanic';
import { DATA_EQUIPABLE_ITEM } from '../../constants/content/data/data-equipable-item';
import { DATA_KEYWORD_NAME } from '../../constants/content/data/data-keyword-name';
import { DATA_LEGENDARY } from '../../constants/content/data/data-legendary';
import { DATA_LEGENDARY_BASE } from '../../constants/content/data/data-legendary-base';
import { DATA_REAPER } from '../../constants/content/data/data-reaper';
import { DATA_REAPER_DAMAGES } from '../../constants/content/data/data-reaper-damages';
import { DATA_SKILL } from '../../constants/content/data/data-skill';
import { DATA_SKILL_BUFF } from '../../constants/content/data/data-skill-buff';
import { DATA_SKILL_CLASS_MECHANIC_ID } from '../../constants/content/data/data-skill-class-mechanic-id';
import { DATA_TEMPLATE_MECHANIC } from '../../constants/content/data/data-template-mechanic';
import { DATA_TRANSLATE } from '../../constants/content/data/data-translate';
import { GAME_DATA } from '../../constants/content/game/game-data';
import { DataActivable } from '../../model/content/data/data-activable';
import { DataAffix } from '../../model/content/data/data-affix';
import { DataAncestralLegacy } from '../../model/content/data/data-ancestral-legacy';
import { DataEquipableItemType } from '../../model/content/data/data-equipable-item-type';
import { DataLegendary } from '../../model/content/data/data-legendary';
import { DataReaper } from '../../model/content/data/data-reaper';
import { DataSkill } from '../../model/content/data/data-skill';
import { Attribute } from '../../model/content/enum/attribute';
import { EquippableItemBase } from '../../model/content/enum/equippable-item-base';
import { HeroClass } from '../../model/content/enum/hero-class';
import { MechanicType } from '../../model/content/enum/mechanic-type';
import { GameDataActivable } from '../../model/content/game/data/game-data-activable';
import { GameDataAncestralLegacy } from '../../model/content/game/data/game-data-ancestral-legacy';
import { GameDataAttribute } from '../../model/content/game/data/game-data-attribute';
import { GameDataBuff } from '../../model/content/game/data/game-data-buff';
import { GameDataLegendary } from '../../model/content/game/data/game-data-legendary';
import { GameDataReaper } from '../../model/content/game/data/game-data-reaper';
import { GameDataSkill } from '../../model/content/game/data/game-data-skill';
import { GameDataStat } from '../../model/content/game/data/game-data-stat';
import { GameDataTranslation } from '../../model/content/game/data/game-data-translation';
import { MinMax } from '../../model/minmax';
import { GameAffix } from '../../model/parser/game/game-item';
import { valueOrNull } from '../../util/utils';

@Injectable()
export class SlormancerDataService {

    public getGameDataStat(affix: GameAffix): GameDataStat | null {
        return valueOrNull(GAME_DATA.STAT.find(stat => stat.REF_NB === affix.type));
    }

    public getGameDataReaper(id: number): GameDataReaper | null {
        return valueOrNull(GAME_DATA.REAPER.find(stat => stat.EN_NAME !== '' && stat.REF === id));
    }

    public getGameDataBuff(ref: string): GameDataBuff | null {
        return valueOrNull(GAME_DATA.BUFF.find(stat => stat.REF === ref));
    }

    public getGameDataAttribute(ref: number): GameDataAttribute | null {
        return valueOrNull(GAME_DATA.ATTRIBUTES.find(attribute => attribute.REF === ref));
    }

    public getGameDataAttributes(attribute: Attribute): Array<GameDataAttribute> {
        return GAME_DATA.ATTRIBUTES.filter(attr => attr.TRAIT === attribute);
    }

    public getParentsGameDataReaper(id: number): Array<GameDataReaper> {
        return GAME_DATA.REAPER.filter(stat => stat.EN_NAME !== '' && stat.EVOLVE_IN === id)
    }

    public getDataReaperDamages(id: number): { [key: number]: MinMax } | null {
        const data = DATA_REAPER_DAMAGES[id];
        return data ? data.damages : null;
    }    
    
    public getGameDataSkill(heroClass: HeroClass, id: number): GameDataSkill | null {
        return valueOrNull(GAME_DATA.SKILL[heroClass].find(skill => skill.REF === id));
    }
    
    public getDataSkillClassMechanicIdByName(heroClass: HeroClass, mechanicName: string): number | null {
        return valueOrNull(DATA_SKILL_CLASS_MECHANIC_ID[heroClass][mechanicName.toLowerCase()]);
    }
    
    public getDataAttributeMechanic(attributeName: string): MechanicType | null {
        return valueOrNull(DATA_ATTRIBUTE_MECHANIC[attributeName]);
    }
    
    public getDataTemplateMechanic(templateName: string): MechanicType | null {
        return valueOrNull(DATA_TEMPLATE_MECHANIC[templateName.toLowerCase()]);
    }

    public getDataSkillBuff(buffName: string): string | null {
        return valueOrNull(DATA_SKILL_BUFF[buffName.toLowerCase()]);
    }

    public getDataEquipableItem(type: EquippableItemBase, base: string): DataEquipableItemType | null {
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

    public getGameDataAncestralLegacy(id: number): GameDataAncestralLegacy | null {
        return valueOrNull(GAME_DATA.ANCESTRAL_LEGACY.find(ancestralLegacu => ancestralLegacu.REF === id));
    }

    public getTranslation(key: string): GameDataTranslation | null {
        return valueOrNull(GAME_DATA.TRANSLATION.find(translation => translation.REF === key));
    }

    public getDataLegendary(id: number): DataLegendary | null {
        return valueOrNull(DATA_LEGENDARY[id]);
    }

    public getDataReaper(id: number): DataReaper | null {
        return valueOrNull(DATA_REAPER[id]);
    }

    public getDataSkill(heroClass: HeroClass, id: number): DataSkill | null {
        return valueOrNull(DATA_SKILL[heroClass][id]);
    }

    public getDataAncestralLegacy(ref: number): DataAncestralLegacy | null {
        return valueOrNull(DATA_ANCESTRAL_LEGACY[ref]);
    }

    public getGameDataLegendaryActivableBasedOn(id: number): GameDataActivable | null {
        const activable = GAME_DATA.ACTIVABLE
            .filter(activable => activable.BASED_ON === 'legendary')
            .find(activable => activable.ID_BASED_ON === id);
        return valueOrNull(activable);
    }

    public getGameDataReaperActivableBasedOn(id: number, primordial: boolean): Array<GameDataActivable> {
        return GAME_DATA.ACTIVABLE
            .filter(activable => activable.BASED_ON === 'reaper' && activable.ID_BASED_ON === id && activable.ON_REAPER_PRIMORDIAL === primordial);
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

    public getDataTranslate(key: string): string | null {
        return valueOrNull(DATA_TRANSLATE[key]);
    }
}