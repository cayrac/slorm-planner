import { Injectable } from '@angular/core';
import { Activable } from '@slormancer/model/content/activable';
import { AbstractEffectValue } from '@slormancer/model/content/effect-value';
import { EffectValueUpgradeType } from '@slormancer/model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '@slormancer/model/content/enum/effect-value-value-type';
import { HeroClass } from '@slormancer/model/content/enum/hero-class';
import { GameDataRune } from '@slormancer/model/content/game/data/game-data-rune';
import { Rune } from '@slormancer/model/content/rune';
import { RuneType } from '@slormancer/model/content/rune-type';
import { effectValueSynergy, effectValueVariable } from '@slormancer/util/effect-value.util';
import { list } from '@slormancer/util/math.util';
import { emptyStringToNull, splitData, splitFloatData, valueOrDefault, valueOrNull } from '@slormancer/util/utils';

import { SlormancerActivableService } from '.././content/slormancer-activable.service';
import { SlormancerEffectValueService } from '.././content/slormancer-effect-value.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerReaperService {

    private readonly BENEDICTION_LABEL = this.slormancerTranslateService.translate('tt_ancient_bonus');

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerEffectValueService: SlormancerEffectValueService,
                private slormancerActivableService: SlormancerActivableService) { }
         

    private isDamageStat(stat: string): boolean {
        return stat === 'physical_damage' || stat === 'elemental_damage' || stat === 'bleed_damage';
    }       
                
    private parseEffectValues(data: GameDataRune, upgradeType: EffectValueUpgradeType): Array<AbstractEffectValue> {
        const valueBases = splitFloatData(data.VALUE_BASE);
        const valuePerLevels = splitFloatData(data.VALUE_PER_LEVEL);
        const valueTypes = emptyStringToNull(splitData(data.VALUE_TYPE));
        const valueReals = emptyStringToNull(splitData(data.VALUE_REAL));
        const stats = emptyStringToNull(splitData(data.VALUE_STAT));

        const max = Math.max(valueBases.length, valuePerLevels.length, valueTypes.length);

        let result: Array<AbstractEffectValue> = [];
        for (let i of list(max)) {
            const type = valueOrNull(valueReals[i]);
            const percent = valueOrNull(valueTypes[i]) === '%';
            const value = valueOrDefault(valueBases[i], 0);
            const upgrade = valueOrDefault(valuePerLevels[i], 0);
            const stat = valueOrDefault(stats[i], null);

            if (stat !== null && this.isDamageStat(stat)) {
                result.push(effectValueSynergy(value, upgrade, upgradeType, false, stat, EffectValueValueType.Damage));
            } else if (type === null) {
                result.push(effectValueVariable(value, upgrade, upgradeType, percent, stat, EffectValueValueType.Stat));
            } else if (type === 'negative') {
                result.push(effectValueVariable(value, -upgrade, upgradeType, percent, stat, EffectValueValueType.Stat));
            } else if (type === 'every_3') {
                result.push(effectValueVariable(value, upgrade, EffectValueUpgradeType.Every3, percent, stat, EffectValueValueType.Stat));
            } else {
                const typeValues = splitData(type, ':');
                const source = <string>typeValues[1];
                if (typeValues[0] === 'based_on_mastery') {
                    result.push(effectValueSynergy(value * 100, 0, upgradeType, percent, 'based_on_mastery_' + source, stat));
                } else {
                    result.push(effectValueSynergy(value, upgrade, upgradeType, percent, source, stat));
                }
            }
        }
        
        return result;
    }

    private idToType(id: number): RuneType {
        let type = RuneType.Effect;

        if (id <= 6) {
            type = RuneType.Activation;
        } else if (id >= 21) {
            type = RuneType.Enhancement;
        }

        return type;
    }

    private getActivableById(id: number, heroClass: HeroClass): Activable | null {
        let activable: Activable | null = null;

        if (id <= 4) {
            activable = this.slormancerActivableService.getRuneActivable(26, heroClass);
        } else if (id >= 26) {
            activable = this.slormancerActivableService.getRuneActivable(27, heroClass);
        }

        return activable;
    }

    
    public getRuneById(id: number, heroClass: HeroClass, level: number, reaperId: number | null = null): Rune | null {
        const data = this.slormancerDataService.getGameDataRune(id);
        let result: Rune | null = null;

        if (data !== null)  {
            result = this.getRune(data, heroClass, level, reaperId);
        }

        return result;
    }

    public getRune(data: GameDataRune, heroClass: HeroClass, level: number, reaperId: number | null = null): Rune {
        const rune = {
            id: data.REF,
            heroClass,
            level,
            type: this.idToType(data.REF),
            activable: this.getActivableById(data.REF, heroClass),
            constraint: data.POWER,
            constraintLabel: null,
            description: '',
            disabledFlavor: null,
            enabled: true,
            flavor: null,
            levelBorder: '',
            levelIcon: '',
            name: data.EN_NAME,
            reaper: data.REAPER,
            reapersmith: data.BLACKSMITH,
            runeIcon: '',
            smithLabel: '',
            template: this.slormancerTemplateService.getRuneDescriptionTemplate(data),
            typeLabel: this.BENEDICTION_LABEL,
            values: this.parseEffectValues(data, EffectValueUpgradeType.RuneLevel)
        };

        this.updateRuneModel(rune, reaperId);
        this.updateRuneView(rune);

        return rune;
    }

    public getRuneClone(rune: Rune): Rune {
        return {
            ...rune,
            activable: rune.activable === null ? null : this.slormancerActivableService.getActivableClone(rune.activable),
            values: rune.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        };
    }

    public updateRuneModel(rune: Rune, reaperId: number | null) {
        rune.enabled = rune.reaper === null || rune.reaper !== reaperId; 
        
        for (const effectValue of rune.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, rune.level);
        }

        if (rune.activable !== null) {
            // TODO
        }
    }

    public updateRuneView(rune: Rune) {
        rune.runeIcon = 'assets/img/reaper/' + rune.id + '.png';
    }
}