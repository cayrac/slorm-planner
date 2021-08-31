import { Injectable } from '@angular/core';

import { Activable } from '../model/activable';
import { DataActivable } from '../model/data/data-activable';
import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { SkillCostType } from '../model/enum/skill-cost-type';
import { SkillGenre } from '../model/enum/skill-genre';
import { GameDataActivable } from '../model/game/data/game-data-activable';
import { list, round } from '../util/math.util';
import { emptyStringToNull, splitData, splitFloatData, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerActivableService {

    private readonly COST_LABEL = this.slormancerTemplateService.translate('tt_cost');
    private readonly COOLDOWN_LABEL = this.slormancerTemplateService.translate('tt_cooldown');
    private readonly SECONDS_LABEL = this.slormancerTemplateService.translate('tt_seconds');

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerDataService: SlormancerDataService) { }

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
                } as EffectValueVariable);
            } else {
                const typeValues = splitData(type, ':');
                const source = valueOrNull(typeValues[1]);

                result.push({
                    type: EffectValueType.Synergy,
                    value: value,
                    upgrade,
                    percent,
                    source,
                } as EffectValueSynergy);
            }
        }
        
        return result;
    }

    private applyActivableOverride(activable: Activable, dataActivable: DataActivable | null) {

        if (dataActivable !== null) {
            dataActivable.override(activable.values);
        }
    }

    private buildActivable(data: GameDataActivable): Activable {
        const dataActivable = this.slormancerDataService.getDataActivable(data.REF);
        const activable = {
            id: data.REF,
            name: data.EN_NAME,
            icon: 'skill/activable/' + data.REF,
            description: '',
            baseCooldown: data.COOLDOWN,
            cooldown: 0,
            baseCost: data.COST,
            cost: 0,
            costType: <SkillCostType>data.COST_TYPE,
            hasLifeCost: false,
            hasManaCost: false,
            hasNoCost: false,
            genres: <Array<SkillGenre>>splitData(data.GENRE, ','),
            damageTypes: splitData(data.DMG_TYPE, ','),

            genresLabel: null,
            costLabel: null,
            cooldownLabel: '',
        
            template: this.slormancerTemplateService.getActivableDescriptionTemplate(data),
            values: this.parseEffectValues(data)
        };

        this.applyActivableOverride(activable, dataActivable);

        this.updateActivable(activable);

        return activable;
    }

    public getReaperActivable(reaperId: number): Array<Activable> {
        const gameDataActivables = this.slormancerDataService.getGameDataReaperActivableBasedOn(reaperId, false);
        return gameDataActivables.map(data => this.buildActivable(data));
    }

    public getPrimordialReaperActivable(reaperId: number): Array<Activable> {
        const gameDataActivables = this.slormancerDataService.getGameDataReaperActivableBasedOn(reaperId, true);
        return gameDataActivables.map(data => this.buildActivable(data));
    }

    public getLegendaryActivable(legendaryId: number): Activable | null {
        const gameDataActivable = this.slormancerDataService.getGameDataLegendaryActivableBasedOn(legendaryId);
        return gameDataActivable === null ? null : this.buildActivable(gameDataActivable);
    }

    public updateActivable(activable: Activable) {
        activable.description = this.slormancerTemplateService.formatActivableDescription(activable.template, activable.values);
        activable.cooldown = round(activable.baseCooldown, 2);
        activable.cost = activable.baseCost;

        activable.hasLifeCost = activable.costType === SkillCostType.LifeSecond || activable.costType === SkillCostType.LifeLock || activable.costType === SkillCostType.Life;
        activable.hasManaCost = activable.costType === SkillCostType.ManaSecond || activable.costType === SkillCostType.ManaLock || activable.costType === SkillCostType.Mana;
        activable.hasNoCost = activable.costType === SkillCostType.None;

        
        activable.genresLabel =  null;
        if (activable.genres.length > 0) {
            activable.genresLabel = activable.genres
                .map(genre => this.slormancerTemplateService.translate(genre))
                .join(' ');
        }
        
        activable.costLabel = null;
        if (!activable.hasNoCost) {
            activable.costLabel = this.COST_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(activable.cost.toString(), activable.hasManaCost ? 'value mana' : 'value life')
                + ' ' + this.slormancerTemplateService.translate(activable.costType);
        }

        activable.cooldownLabel = null;
        if (activable.cooldown > 0) {
            activable.cooldownLabel = this.COOLDOWN_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(activable.cooldown.toString(), 'value')
                + ' ' + this.SECONDS_LABEL;
        }
    }
}