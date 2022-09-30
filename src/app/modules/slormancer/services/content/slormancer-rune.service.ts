import { Injectable } from '@angular/core';
import { Activable } from '@slormancer/model/content/activable';
import { AbstractEffectValue, EffectValueVariable } from '@slormancer/model/content/effect-value';
import { EffectValueUpgradeType } from '@slormancer/model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '@slormancer/model/content/enum/effect-value-value-type';
import { HeroClass } from '@slormancer/model/content/enum/hero-class';
import { GameDataRune } from '@slormancer/model/content/game/data/game-data-rune';
import { Rune } from '@slormancer/model/content/rune';
import { RuneType } from '@slormancer/model/content/rune-type';
import { RunesCombination } from '@slormancer/model/runes-combination';
import { effectValueSynergy, effectValueVariable } from '@slormancer/util/effect-value.util';
import { list } from '@slormancer/util/math.util';
import { emptyStringToNull, splitData, splitFloatData, valueOrDefault, valueOrNull } from '@slormancer/util/utils';

import { SlormancerActivableService } from '.././content/slormancer-activable.service';
import { SlormancerEffectValueService } from '.././content/slormancer-effect-value.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerRuneService {

    private readonly REAPERSMITH_BY = this.slormancerTranslateService.translate('weapon_reapersmith_light');

    private readonly RUNE_FLAVOR_ACTIVATION = this.slormancerTranslateService.translate('tt_rune_0_help');
    private readonly RUNE_FLAVOR_ACTIVATION_POWER = this.slormancerTranslateService.translate('tt_rune_0_help_power');

    private readonly RUNE_FLAVOR_EFFECT = this.slormancerTranslateService.translate('tt_rune_1_help');
    private readonly RUNE_FLAVOR_EFFECT_PREVENT = this.slormancerTranslateService.translate('tt_rune_1_prevent_reaper');

    private readonly RUNE_FLAVOR_ENHANCEMENT = this.slormancerTranslateService.translate('tt_rune_2_help');

    private readonly CONSTRAINT = this.slormancerTranslateService.translate('rune_power');
    
    private readonly DURATION_DESCRIPTION = this.slormancerTranslateService.translate('tt_rune_effect');

    private TRIGGER_EFFECT_RUNE_BASE_COOLDOWN: number = 0;

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerEffectValueService: SlormancerEffectValueService,
                private slormancerActivableService: SlormancerActivableService) { }
         

    private isDamageStat(stat: string): boolean {
        return stat === 'physical_damage' || stat === 'elemental_damage' || stat === 'bleed_damage';
    }    
    
    private parseDurationPerLevelvalue(data: GameDataRune): EffectValueVariable | null {
        let result: EffectValueVariable | null = null;

        if (data.DURATION_BASE !== null && data.DURATION_BASE !== 0) {
            result = effectValueVariable(data.DURATION_BASE, valueOrDefault(data.DURATION_LEVEL, 0), EffectValueUpgradeType.RuneLevel, false, 'duration', EffectValueValueType.Duration);
        }

        return result;
    }
                
    private parseEffectValues(data: GameDataRune, upgradeType: EffectValueUpgradeType): Array<AbstractEffectValue> {
        const valueBases = splitFloatData(data.VALUE_BASE);
        const valuePerLevels = splitFloatData(data.VALUE_PER_LEVEL);
        const valueTypes = emptyStringToNull(splitData(data.VALUE_TYPE));
        const valueLevels = emptyStringToNull(splitData(data.VALUE_LEVEL));
        const valueReals = emptyStringToNull(splitData(data.VALUE_REAL));
        const stats = emptyStringToNull(splitData(data.VALUE_STAT));

        const max = Math.max(valueBases.length, valuePerLevels.length, valueTypes.length);

        let result: Array<AbstractEffectValue> = [];
        for (let i of list(max)) {
            const real = valueOrNull(valueReals[i]);
            const level = valueOrNull(valueLevels[i]);
            const percent = valueOrNull(valueTypes[i]) === '%';
            const value = valueOrDefault(valueBases[i], 0);
            const upgrade = valueOrDefault(valuePerLevels[i], 0);
            const stat = valueOrDefault(stats[i], null);

            if (level === 'rl3') {
                upgradeType = EffectValueUpgradeType.Every3RuneLevel;
            }

            if (stat !== null && this.isDamageStat(stat)) {
                result.push(effectValueSynergy(value, upgrade, upgradeType, false, stat, EffectValueValueType.Damage));
            } else if (real === null) {
                result.push(effectValueVariable(value, upgrade, upgradeType, percent, stat, EffectValueValueType.Stat));
            } else {
                const realValues = splitData(real, ':');
                const source = <string>realValues[1];
                if (realValues[0] === 'based_on_mastery') {
                    result.push(effectValueSynergy(value * 100, 0, upgradeType, false, 'based_on_mastery_' + source, stat));
                } else {
                    result.push(effectValueSynergy(value, upgrade, upgradeType, false, source, stat));
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

        if (id === 4) {
            activable = this.slormancerActivableService.getRuneActivable(26, heroClass);
        } else if (id === 26) {
            activable = this.slormancerActivableService.getRuneActivable(27, heroClass);
        }

        return activable;
    }

    
    public getRuneById<T extends Rune>(id: number, heroClass: HeroClass, level: number, reaperId: number | null = null): T | null {
        const data = this.slormancerDataService.getGameDataRune(id);
        let result: T | null = null;

        if (data !== null)  {
            result = this.getRune<T>(data, heroClass, level, reaperId);
        }

        return result;
    }

    public getRunes(heroClass: HeroClass, level: number, reaperId: number | null): Array<Rune> {
        return this.slormancerDataService.getGameDataRunes()
            .map(data => this.getRune(data, heroClass, level, reaperId));
    }

    public getRune<T extends Rune>(data: GameDataRune, heroClass: HeroClass, level: number, reaperId: number | null = null): T {
        const rune: Rune = {
            id: data.REF,
            heroClass,
            level,
            type: this.idToType(data.REF),
            activable: this.getActivableById(data.REF, heroClass),
            constraint: data.POWER,
            constraintLabel: null,
            description: '',
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
            typeLabel: '',
            values: this.parseEffectValues(data, EffectValueUpgradeType.RuneLevel),
            duration: this.parseDurationPerLevelvalue(data)
        };

        if (data.REF === 4 && rune.activable !== null && rune.activable.baseCooldown !== null) {
            this.TRIGGER_EFFECT_RUNE_BASE_COOLDOWN = rune.activable.baseCooldown;
        }
        
        const dataRune = this.slormancerDataService.getDataRune(data.REF);

        if (dataRune !== null) {
            dataRune.override(rune);
        }

        this.updateRuneModel(rune, reaperId);
        this.updateRuneView(rune);

        return <T>rune;
    }

    public getRuneClone<T extends Rune>(rune: T): T {
        return {
            ...rune,
            activable: rune.activable === null ? null : this.slormancerActivableService.getActivableClone(rune.activable),
            values: rune.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        };
    }

    public getRunesCombinationClone(runes: RunesCombination): RunesCombination {
        return {
            activation: runes.activation === null ? null : this.getRuneClone(runes.activation),
            effect: runes.effect === null ? null : this.getRuneClone(runes.effect),
            enhancement: runes.enhancement === null ? null : this.getRuneClone(runes.enhancement),
        };
    }

    public updateRunesModel(runes: RunesCombination, reaperId: number | null) {
        if (runes.activation !== null) {
            this.updateRuneModel(runes.activation, reaperId);
        }
        if (runes.effect !== null) {
            this.updateRuneModel(runes.effect, reaperId);
        }
        if (runes.enhancement !== null) {
            this.updateRuneModel(runes.enhancement, reaperId);
        }
    }

    public updateRuneModel(rune: Rune, reaperId: number | null) {
        rune.enabled = rune.reaper === null || rune.reaper !== reaperId; 
        
        if (rune.duration !== null) {
            this.slormancerEffectValueService.updateEffectValue(rune.duration, rune.level);
        }

        for (const effectValue of rune.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, rune.level);
        }

        if (rune.activable !== null) {
            if (rune.id === 4) {
                const durationReduction = rune.values[0];

                if (durationReduction) {
                    rune.activable.baseCooldown = this.TRIGGER_EFFECT_RUNE_BASE_COOLDOWN - durationReduction.value;
                }
            }

            rune.activable.level = rune.level;
            this.slormancerActivableService.updateActivableModel(rune.activable);
        }
    }

    public updateRunesView(runes: RunesCombination) {
        if (runes.activation !== null) {
            this.updateRuneView(runes.activation);
        }
        if (runes.effect !== null) {
            this.updateRuneView(runes.effect);
        }
        if (runes.enhancement !== null) {
            this.updateRuneView(runes.enhancement);
        }
    }

    public updateRuneView(rune: Rune) {
        rune.runeIcon = 'assets/img/icon/rune/' + rune.id + '.png';
        rune.levelBorder = 'assets/img/icon/level/rune/' + rune.level + '.png';
        rune.levelIcon = 'assets/img/icon/level/' + rune.level + '.png';

        rune.description = this.slormancerTemplateService.formatRuneDescription(rune.template, rune.values);
        rune.smithLabel = this.REAPERSMITH_BY.replace('$', this.slormancerTranslateService.translate('weapon_reapersmith_' + rune.reapersmith));
        rune.typeLabel = this.slormancerTranslateService.translate('rune_' + rune.type);
        rune.constraintLabel = rune.constraint === null ? null : this.CONSTRAINT + ' : ' + this.slormancerTemplateService.asSpan(rune.constraint.toString(), 'power value') + ' %';

        if (rune.duration !== null) {
            rune.description += '<br/><br/>' + this.slormancerTemplateService.formatRuneDescription(this.DURATION_DESCRIPTION, [rune.duration]);
        }

        const flavorTexts: Array<string> = [];

        if (rune.type === RuneType.Activation) {
            flavorTexts.push(this.RUNE_FLAVOR_ACTIVATION);
            flavorTexts.push(this.RUNE_FLAVOR_ACTIVATION_POWER);
        } else if (rune.type === RuneType.Effect) {
            flavorTexts.push(this.RUNE_FLAVOR_EFFECT);
            if (rune.enabled) {
                flavorTexts.push(this.RUNE_FLAVOR_EFFECT_PREVENT);
            } else {
                flavorTexts.push(this.slormancerTemplateService.asSpan(this.RUNE_FLAVOR_EFFECT_PREVENT, 'disabled'));
            }
        } else {
            flavorTexts.push(this.RUNE_FLAVOR_ENHANCEMENT);
        }

        rune.flavor = flavorTexts.join('<br/><br/>');

        if (rune.activable !== null) {
            this.slormancerActivableService.updateActivableView(rune.activable);
        }

    }
}