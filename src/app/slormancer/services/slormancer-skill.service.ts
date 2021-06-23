import { Injectable } from '@angular/core';

import { AbstractEffectValue, EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { SkillCostType } from '../model/enum/skill-cost-type';
import { SkillGenre } from '../model/enum/skill-genre';
import { GameDataActivable } from '../model/game/data/game-data-activable';
import { Skill } from '../model/skill';
import { list } from '../util/math.util';
import { emptyStringToNull, splitData, splitFloatData, valueOrDefault, valueOrNull } from '../util/utils';
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

    private parseEffectValues(data: GameDataActivable): Array<AbstractEffectValue> {
        const valueBases = splitFloatData(data.DESC_VALUE_BASE);
        const valuePerLevels = splitFloatData(data.DESC_VALUE_LEVEL);
        const valueTypes = emptyStringToNull(splitData(data.DESC_VALUE_TYPE));
        const valueReals = emptyStringToNull(splitData(data.DESC_VALUE_REAL));

        const max = Math.max(valueBases.length, valuePerLevels.length, valueTypes.length);

        let result: Array<AbstractEffectValue> = [];
        for (let i of list(max)) {
            const type = valueOrNull(valueReals[i]);
            const percent = valueOrNull(valueTypes[i]) === '%';
            const value = valueOrDefault(valueBases[i], 0);
            const upgrade = valueOrDefault(valuePerLevels[i], 0);

            if (type === null) {
                result.push({
                    type: EffectValueType.Variable,
                    value,
                    upgrade,
                    percent,
                    range: false
                } as EffectValueVariable);
            } else {
                const typeValues = splitData(type, ':');
                const source = valueOrNull(typeValues[1]);

                result.push({
                    type: EffectValueType.Synergy,
                    ratio: value,
                    upgrade,
                    source,
                    range: false
                } as EffectValueSynergy);
            }
        }
        
        return result;
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

    private applyActivableOverride(activable: Skill, ref: number) {
        const data = this.slormancerDataService.getDataActivable(ref);

        if (data !== null) {
            for (const constant of data.constants) {
                activable.values.push({
                    type: EffectValueType.Constant,
                    value: constant
                } as EffectValueConstant);
            }
        }
    }

    public getActivable(gameData: GameDataActivable): Skill {
        const activable = {
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
            values: this.parseEffectValues(gameData),
        };

        this.applyActivableOverride(activable, gameData.REF);

        return activable;
    }
}