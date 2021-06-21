import { Injectable } from '@angular/core';

import { SkillCostType } from '../model/enum/skill-cost-type';
import { SkillGenre } from '../model/enum/skill-genre';
import { GameDataActivable } from '../model/game/data/game-data-activable';
import { MinMax } from '../model/minmax';
import { Skill } from '../model/skill';
import { SkillValue } from '../model/skill-value';
import { list } from '../util/math.util';
import { splitData, splitNumberData, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerSkillService {

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerDataService: SlormancerDataService) { }

    private parseCostType(costType: string): SkillCostType {
        let result = SkillCostType.None;

        if (costType === 'life') {
            result = SkillCostType.Life;
        } else if (costType === 'life_second') {
            result = SkillCostType.LifeSecond;
        } else if (costType === 'life_lock') {
            result = SkillCostType.LifeLock;
        } else if (costType === 'mana') {
            result = SkillCostType.Mana;
        } else if (costType === 'mana_second') {
            result = SkillCostType.ManaSecond;
        } else if (costType === 'mana_lock') {
            result = SkillCostType.ManaLock;
        }

        return result;
    }

    private parseSkillValues(data: GameDataActivable, level: number): Array<SkillValue> {
        const valueBases = splitNumberData(data.DESC_VALUE_BASE);
        const valuePerLevels = splitNumberData(data.DESC_VALUE_LEVEL);
        const valueTypes = splitData(data.DESC_VALUE_TYPE);
        const valueReals = splitData(data.DESC_VALUE_REAL);

        const max = Math.max(valueBases.length, valuePerLevels.length, valueTypes.length, valueReals.length);

        return list(max).map(index => {
            const valueReal = valueOrNull(valueReals[index]);
            const type = valueOrNull(valueTypes[index]);
            const baseValue = valueBases[index] ? valueOrDefault(valueBases[index], 0) + level * valueOrDefault(valuePerLevels[index], 0) : null;
            let computedValue: null | number | MinMax = valueReal === null || valueReal.length === 0 ? baseValue : 0;

            if (valueReal !== null && valueOrNull(splitData(valueReal, ':')[1]) === 'physical_damage') {
                computedValue = { min: 0, max: 0 };
            }

            return { baseValue, type, valueReal, computedValue };
        });
            
    }

    private isGenre(genre: string): genre is SkillGenre {
        return genre === SkillGenre.Aoe
            || genre === SkillGenre.Aura
            || genre === SkillGenre.Totem
            || genre === SkillGenre.Movement
            || genre === SkillGenre.Melee
            || genre === SkillGenre.Projectile
            || genre === SkillGenre.Special
            || genre === SkillGenre.Minion;
    }

    public getActivable(gameData: GameDataActivable, level: number): Skill {
        const data = this.slormancerDataService.getDataActivable(gameData.REF);

        if (data !== null) {
            gameData = { ...gameData }
            if (data.description !== null) {
                gameData.EN_DESCRIPTION = data.description;
            }
        }

        return {
            name: gameData.EN_NAME,
            icon: 'activable_' + gameData.REF,
            description: this.slormancerTemplateService.getSkillDescriptionTemplate(gameData),
            baseCooldown: gameData.COOLDOWN,
            cooldown: gameData.COOLDOWN,
            baseCost: gameData.COST,
            cost: gameData.COST,
            costType: this.parseCostType(gameData.COST_TYPE),
            damageTypes: splitData(gameData.DMG_TYPE, ','),
            genres: splitData(gameData.GENRE, ',').filter(this.isGenre),
            values: this.parseSkillValues(gameData, level),
            constants: data !== null ? data.constants : []
        };
    }
}