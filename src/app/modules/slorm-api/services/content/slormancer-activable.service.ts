import { Injectable } from '@angular/core';

import { Activable } from '../../model/content/activable';
import { DataActivable } from '../../model/content/data/data-activable';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { HeroClass } from '../../model/content/enum/hero-class';
import { SkillCostType } from '../../model/content/enum/skill-cost-type';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { GameDataActivable } from '../../model/content/game/data/game-data-activable';
import { effectValueSynergy, effectValueVariable } from '../../util/effect-value.util';
import { list, round } from '../../util/math.util';
import { emptyStringToNull, splitData, splitFloatData, valueOrDefault, valueOrNull } from '../../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerActivableService {

    private readonly COST_LABEL = this.slormancerTranslateService.translate('tt_cost');
    private readonly COOLDOWN_LABEL = this.slormancerTranslateService.translate('tt_cooldown');
    private readonly SECONDS_LABEL = this.slormancerTranslateService.translate('tt_seconds');

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService: SlormancerTranslateService,
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
                result.push(effectValueVariable(baseValue, upgrade, upgradeType, percent));
            } else {
                const typeValues = splitData(type, ':');
                const source = <string>typeValues[1];

                result.push(effectValueSynergy(baseValue, upgrade, upgradeType, percent, source));
            }
        }
        
        return result;
    }

    private applyActivableOverride(activable: Activable, dataActivable: DataActivable | null) {

        if (dataActivable !== null) {
            dataActivable.override(activable.values);
        }
    }

    private buildActivable(data: GameDataActivable, upgradeType: EffectValueUpgradeType, level: number, heroClass: HeroClass): Activable {
        const dataActivable = this.slormancerDataService.getDataActivable(data.REF);
        const activable = {
            id: data.REF,
            name: data.EN_NAME,
            icon: 'assets/img/icon/skill/activable/' + data.REF + '.png',
            description: '',
            baseCooldown: data.COOLDOWN,
            cooldown: 0,
            baseCost: data.COST,
            cost: 0,
            baseCostType: <SkillCostType>data.COST_TYPE,
            costType: <SkillCostType>data.COST_TYPE,
            hasLifeCost: false,
            hasManaCost: false,
            hasNoCost: false,
            genres: <Array<SkillGenre>>splitData(data.GENRE, ','),
            damageTypes: splitData(data.DMG_TYPE, ','),
            level,
            heroClass,

            genresLabel: null,
            costLabel: null,
            cooldownLabel: null,
        
            template: this.slormancerTemplateService.getActivableDescriptionTemplate(data),
            values: this.parseEffectValues(data, upgradeType)
        };

        this.applyActivableOverride(activable, dataActivable);

        this.updateActivableModel(activable);
        this.updateActivableView(activable);

        return activable;
    }

    public getActivableClone(activable: Activable): Activable {
        const result = {
            ...activable,
            genres: [ ...activable.genres ],
            values: activable.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        };

        return result;
    }

    public getReaperActivable(reaperId: number, level: number, heroClass: HeroClass): Array<Activable> {
        const gameDataActivables = this.slormancerDataService.getGameDataReaperActivableBasedOn(reaperId, false);
        return gameDataActivables.map(data => this.buildActivable(data, EffectValueUpgradeType.ReaperLevel, level, heroClass));
    }

    public getPrimordialReaperActivable(reaperId: number, level: number, heroClass: HeroClass): Array<Activable> {
        const gameDataActivables = this.slormancerDataService.getGameDataReaperActivableBasedOn(reaperId, true);
        return gameDataActivables.map(data => this.buildActivable(data, EffectValueUpgradeType.ReaperLevel, level, heroClass));
    }

    public getLegendaryActivable(legendaryId: number, heroClass: HeroClass): Activable | null {
        const gameDataActivable = this.slormancerDataService.getGameDataLegendaryActivableBasedOn(legendaryId);
        return gameDataActivable === null ? null : this.buildActivable(gameDataActivable, EffectValueUpgradeType.Reinforcment, 0, heroClass);
    }

    public getRuneActivable(id: number, heroClass: HeroClass): Activable | null {
        const gameDataActivable = this.slormancerDataService.getGameDataActivable(id);
        return gameDataActivable === null ? null : this.buildActivable(gameDataActivable, EffectValueUpgradeType.RuneLevel, 0, heroClass);
    }

    public updateActivableModel(activable: Activable) {
        activable.cooldown = activable.baseCooldown === null ? 0 : round(activable.baseCooldown, 2);
        this.updateActivableCost(activable);

        for (const effectValue of activable.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, activable.level);
        }
    }

    public updateActivableCost(activable: Activable) {
        activable.cost = activable.baseCost;
        activable.costType = activable.baseCostType;
        this.updateActivableCostType(activable);
    }

    public updateActivableCostType(activable: Activable) {
        activable.hasLifeCost = activable.costType === SkillCostType.LifeSecond || activable.costType === SkillCostType.LifeLockFlat || activable.costType === SkillCostType.LifeLock || activable.costType === SkillCostType.Life || activable.costType === SkillCostType.LifePercent;
        activable.hasManaCost = activable.costType === SkillCostType.ManaSecond || activable.costType === SkillCostType.ManaLockFlat || activable.costType === SkillCostType.ManaLock || activable.costType === SkillCostType.Mana || activable.costType === SkillCostType.ManaPercent;
        activable.hasNoCost = activable.costType === SkillCostType.None;
    }

    public updateActivableView(activable: Activable) {
        activable.genresLabel =  null;
        if (activable.genres.length > 0) {
            activable.genresLabel = activable.genres
                .map(genre => this.slormancerTranslateService.translate('atk_' + genre))
                .join(' ');
        }
        
        activable.costLabel = null;
        if (!activable.hasNoCost) {
            activable.costLabel = this.COST_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(activable.cost.toString(), activable.hasManaCost ? 'value mana' : 'value life')
                + ' ' + this.slormancerTranslateService.translateCostType(activable.costType);
        }

        activable.cooldownLabel = null;
        if (activable.cooldown > 0) {
            activable.cooldownLabel = this.COOLDOWN_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(activable.cooldown.toString(), 'value')
                + ' ' + this.SECONDS_LABEL;
        }

        activable.description = this.slormancerTemplateService.formatActivableDescription(activable.template, activable.values)
                .replace(/\{weaponClass\}/g, this.slormancerTranslateService.translate('weapon_' + activable.heroClass))
                .replace(/\[([a-zA-Z ]+)\/([a-zA-Z ]+)\/([a-zA-Z ]+)\]/g, '$' + (activable.heroClass + 1));
    }
}