import { Injectable } from '@angular/core';

import { Activable } from '../model/activable';
import { DataActivable } from '../model/data/data-activable';
import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { EffectValueType } from '../model/enum/effect-value-type';
import { EffectValueUpgradeType } from '../model/enum/effect-value-upgrade-type';
import { SkillCostType } from '../model/enum/skill-cost-type';
import { SkillGenre } from '../model/enum/skill-genre';
import { GameDataActivable } from '../model/game/data/game-data-activable';
import { list, round } from '../util/math.util';
import { emptyStringToNull, splitData, splitFloatData, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerActivableService {

    private readonly COST_LABEL = this.slormancerTemplateService.translate('tt_cost');
    private readonly COOLDOWN_LABEL = this.slormancerTemplateService.translate('tt_cooldown');
    private readonly SECONDS_LABEL = this.slormancerTemplateService.translate('tt_seconds');

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerDataService: SlormancerDataService,
                private slormancerEffectValueService: SlormancerEffectValueService) { }

    private parseEffectValues(data: GameDataActivable, upgradeType: EffectValueUpgradeType): Array<AbstractEffectValue> {
        const valueBases = splitFloatData(data.DESC_VALUE_BASE);
        const valuePerLevels = splitFloatData(data.DESC_VALUE_LEVEL);
        const valueTypes = emptyStringToNull(splitData(data.DESC_VALUE_TYPE));
        const valueReals = emptyStringToNull(splitData(data.DESC_VALUE_REAL));

        const max = Math.max(valueBases.length, valuePerLevels.length, valueTypes.length);

        let result: Array<AbstractEffectValue> = [];
        for (let i of list(max)) {
            const type = valueOrNull(valueReals[i]);
            const percent = valueOrNull(valueTypes[i]) === '%';
            const baseValue = valueOrDefault(valueBases[i], 0);
            const upgrade = valueOrDefault(valuePerLevels[i], 0);

            if (type === null) {
                result.push({
                    type: EffectValueType.Variable,
                    value: 0,
                    baseValue,
                    upgrade,
                    upgradeType,
                    percent,
                } as EffectValueVariable);
            } else {
                const typeValues = splitData(type, ':');
                const source = valueOrNull(typeValues[1]);

                result.push({
                    type: EffectValueType.Synergy,
                    value: 0,
                    baseValue,
                    upgrade,
                    upgradeType,
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

    private buildActivable(data: GameDataActivable, upgradeType: EffectValueUpgradeType, level: number): Activable {
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
            level,

            genresLabel: null,
            costLabel: null,
            cooldownLabel: null,
        
            template: this.slormancerTemplateService.getActivableDescriptionTemplate(data),
            values: this.parseEffectValues(data, upgradeType)
        };

        this.applyActivableOverride(activable, dataActivable);

        this.updateActivable(activable);

        return activable;
    }

    public getReaperActivable(reaperId: number, level: number): Array<Activable> {
        const gameDataActivables = this.slormancerDataService.getGameDataReaperActivableBasedOn(reaperId, false);
        return gameDataActivables.map(data => this.buildActivable(data, EffectValueUpgradeType.ReaperLevel, level));
    }

    public getPrimordialReaperActivable(reaperId: number, level: number): Array<Activable> {
        const gameDataActivables = this.slormancerDataService.getGameDataReaperActivableBasedOn(reaperId, true);
        return gameDataActivables.map(data => this.buildActivable(data, EffectValueUpgradeType.ReaperLevel, level));
    }

    public getLegendaryActivable(legendaryId: number): Activable | null {
        const gameDataActivable = this.slormancerDataService.getGameDataLegendaryActivableBasedOn(legendaryId);
        return gameDataActivable === null ? null : this.buildActivable(gameDataActivable, EffectValueUpgradeType.Reinforcment, 0);
    }

    public updateActivable(activable: Activable) {
        activable.cooldown = round(activable.baseCooldown, 2);
        activable.cost = activable.baseCost;

        activable.hasLifeCost = activable.costType === SkillCostType.LifeSecond || activable.costType === SkillCostType.LifeLock || activable.costType === SkillCostType.Life;
        activable.hasManaCost = activable.costType === SkillCostType.ManaSecond || activable.costType === SkillCostType.ManaLock || activable.costType === SkillCostType.Mana;
        activable.hasNoCost = activable.costType === SkillCostType.None;

        for (const effectValue of activable.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, activable.level);
        }

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

        activable.description = this.slormancerTemplateService.formatActivableDescription(activable.template, activable.values);
    }
}