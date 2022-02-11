import { Injectable } from '@angular/core';

import { ALL_ATTRIBUTES } from '../../slormancer/model/content/enum/attribute';
import { EQUIPABLE_ITEM_BASE_VALUES, EquipableItemBase } from '../../slormancer/model/content/enum/equipable-item-base';
import { HeroClass } from '../../slormancer/model/content/enum/hero-class';
import { Rarity } from '../../slormancer/model/content/enum/rarity';
import { ALL_REAPER_SMITH, ReaperSmith } from '../../slormancer/model/content/enum/reaper-smith';
import { ALL_ULTIMATUM_TYPES, UltimatumType } from '../../slormancer/model/content/enum/ultimatum-type';
import { GameDataStat } from '../../slormancer/model/content/game/data/game-data-stat';
import { GameHeroesData } from '../../slormancer/model/parser/game/game-save';
import { SlormancerDataService } from '../../slormancer/services/content/slormancer-data.service';
import { SlormancerReaperService } from '../../slormancer/services/content/slormancer-reaper.service';
import { SlormancerTranslateService } from '../../slormancer/services/content/slormancer-translate.service';
import { compareString, valueOrDefault } from '../../slormancer/util/utils';
import { SelectOption } from '../model/select-option';

@Injectable({ providedIn: 'root' })
export class FormOptionsService {

    private STATS_OPTIONS_CACHE: { [key: string]: { P: Array<SelectOption<string>>, S: Array<SelectOption<string>> } } = {};

    private LEGENDARY_OPTIONS_CACHE: { [key: string]: GameHeroesData<Array<SelectOption<number>>> } = {};

    private ALL_STATS_OPTIONS_CACHE: Array<SelectOption<string>> = [];

    private ALL_REAPER_BUFF_OPTIONS_CACHE: Array<SelectOption<number>> = [];

    private ALL_SKILL_BUFF_OPTIONS_CACHE: GameHeroesData<Array<SelectOption<number>>> = { 0: [], 1: [], 2: [] };

    private ALL_ATTRIBUTE_BUFF_OPTIONS_CACHE: Array<SelectOption<number>> = [];

    private ALL_REAPER_OPTIONS_CACHE: { p: GameHeroesData<Array<SelectOption<number>>>, b: GameHeroesData<Array<SelectOption<number>>>} = {
        p: { 0: [], 1: [], 2: [] },
        b: { 0: [], 1: [], 2: [] }
    };

    private ULTIMATUM_OPTIONS_CACHE: Array<SelectOption<UltimatumType>> = []

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerReaperService: SlormancerReaperService
                ) {
        this.initStatOptionsCache();
        this.initLegendaryOptionsCache();
        this.initReaperBuffOptions();
        this.initSkillBuffOptions();
        this.initAttributeBuffOptions();
        this.initReaperOptions();
        this.initUltimatumOptions();
    }

    public getReaperOptions(heroClass: HeroClass, primordial: boolean): Array<SelectOption<number>> {
        return this.ALL_REAPER_OPTIONS_CACHE[primordial ? 'p' : 'b'][heroClass];
    }

    public getAllStatsoptions(): Array<SelectOption<string>> {
        return this.ALL_STATS_OPTIONS_CACHE;
    }

    public getStatsOptions(base: EquipableItemBase, rarity: Rarity): Array<SelectOption<string>> {
        let result = this.ALL_STATS_OPTIONS_CACHE;

        const baseStats = this.STATS_OPTIONS_CACHE[base];
        if (baseStats) {
            if (rarity === Rarity.Normal) {
                result = valueOrDefault(baseStats['P'], []);
            } else if (rarity === Rarity.Magic || rarity === Rarity.Rare) {
                result = valueOrDefault(baseStats['S'], []);
            }
        }

        return result;
    }

    public getLegendaryOptions(base: EquipableItemBase, heroClass: HeroClass): Array<SelectOption<number>> {
        let result: Array<SelectOption<number>> = [];

        const baseLegendaries = this.LEGENDARY_OPTIONS_CACHE[base];
        if (baseLegendaries) {
            result = baseLegendaries[heroClass];
        }

        return result;
    }

    public getReaperBuffOptions(): Array<SelectOption<number>> {
        return this.ALL_REAPER_BUFF_OPTIONS_CACHE;
    }

    public getSkillBuffOptions(heroClass: HeroClass): Array<SelectOption<number>> {
        return this.ALL_SKILL_BUFF_OPTIONS_CACHE[heroClass];
    }

    public getAttributeBuffOptions(): Array<SelectOption<number>> {
        return this.ALL_ATTRIBUTE_BUFF_OPTIONS_CACHE;
    }

    public getUltimatumOptions(): Array<SelectOption<UltimatumType>> {
        return this.ULTIMATUM_OPTIONS_CACHE;
    }

    private getBaseKey(base: EquipableItemBase): keyof GameDataStat {
        return <keyof GameDataStat>(base === EquipableItemBase.Body ? 'ARMOR' : base.toUpperCase());
    }

    private initStatOptionsCache() {
        const stats = this.slormancerDataService.getGameDataStats().filter(stat => stat.PERCENT !== 'X');

        this.STATS_OPTIONS_CACHE = {};
        this.ALL_STATS_OPTIONS_CACHE = [];

        for (const stat of stats) {
            const option: SelectOption<string> = {
                label: this.slormancerTranslateService.translate(stat.REF) + (stat.PERCENT === '%' ? ' (%)' : ''),
                value: stat.REF
            }

            this.ALL_STATS_OPTIONS_CACHE.push(option);

            for (const base of EQUIPABLE_ITEM_BASE_VALUES) {
                const statKey = this.getBaseKey(base);
                const rarity = stat[statKey];

                if (rarity !== '') {
                    let statBase = this.STATS_OPTIONS_CACHE[base];
                    if (statBase === undefined) {
                        statBase = {
                            P: [],
                            S: []
                        };
                        this.STATS_OPTIONS_CACHE[base] = statBase;
                    }

                    if (rarity === 'P') {
                        statBase.P.push(option);
                    }

                    if (rarity === 'P' ||rarity === 'S') {
                        statBase.S.push(option);
                    }
                }
            }
        }

        for (const base of EQUIPABLE_ITEM_BASE_VALUES) {
            const key = this.getBaseKey(base);
            
            const baseOptions = this.STATS_OPTIONS_CACHE[key];
            if (baseOptions) {

                const primaryOptions = baseOptions['P'];
                const secondaryOptions = baseOptions['S'];

                if (primaryOptions) {
                    primaryOptions.sort((a, b) => compareString(a.label, b.label));
                }
                if (secondaryOptions) {
                    secondaryOptions.sort((a, b) => compareString(a.label, b.label));
                }
            }
        }

        this.ALL_STATS_OPTIONS_CACHE.sort((a, b) => compareString(a.label, b.label));
    }

    private initLegendaryOptionsCache() {
        const legendaries = this.slormancerDataService.getGameDataLegendaries().filter(legendary => legendary.LOOTABLE);
        this.LEGENDARY_OPTIONS_CACHE = {};

        for (const legendary of legendaries) {
            const option: SelectOption<number> = { value: legendary.REF, label: legendary.EN_NAME }
            let data = this.LEGENDARY_OPTIONS_CACHE[legendary.ITEM];
            if (data === undefined) {
                data = { 0: [], 1: [], 2: [] };
                this.LEGENDARY_OPTIONS_CACHE[legendary.ITEM] = data;
            }

            if (legendary.HERO === -1 || legendary.HERO === 99) {
                data[0].push(option);
                data[1].push(option);
                data[2].push(option);
            } else {
                data[legendary.HERO].push(option);
            }
        }
    }

    private initReaperBuffOptions() {
        this.ALL_REAPER_BUFF_OPTIONS_CACHE = ALL_REAPER_SMITH
            .filter(smith => smith !== ReaperSmith.OhmAgad && smith !== ReaperSmith.ReapersmithBrotherhood)
            .map(smith => ({ value: smith, label: this.slormancerTranslateService.translate('weapon_reapersmith_' + smith) }));
    }

    private initSkillBuffOptions() {
        this.ALL_SKILL_BUFF_OPTIONS_CACHE = {
            [HeroClass.Warrior]: this.slormancerDataService.getGameDataActiveSkills(HeroClass.Warrior)
                .map(skill => ({ value: skill.REF, label: skill.EN_NAME })),
            [HeroClass.Huntress]: this.slormancerDataService.getGameDataActiveSkills(HeroClass.Huntress)
                .map(skill => ({ value: skill.REF, label: skill.EN_NAME })),
            [HeroClass.Mage]: this.slormancerDataService.getGameDataActiveSkills(HeroClass.Mage)
                .map(skill => ({ value: skill.REF, label: skill.EN_NAME }))
        }
    }

    private initAttributeBuffOptions() {
        this.ALL_ATTRIBUTE_BUFF_OPTIONS_CACHE = ALL_ATTRIBUTES
            .map(attribute => ({ value: attribute, label: this.slormancerTranslateService.translate('character_trait_' + attribute) }));
    }

    private initReaperOptions() {
        this.ALL_REAPER_OPTIONS_CACHE = {
            p: { 0: [], 1: [], 2: [] },
            b: { 0: [], 1: [], 2: [] }
        }

        const reapers = this.slormancerDataService.getGameDataAvailableReaper();

        for (const reaper of reapers) {
            this.ALL_REAPER_OPTIONS_CACHE.p[HeroClass.Warrior].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.EN_NAME, true, HeroClass.Warrior ) });
            this.ALL_REAPER_OPTIONS_CACHE.p[HeroClass.Huntress].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.EN_NAME, true, HeroClass.Huntress ) });
            this.ALL_REAPER_OPTIONS_CACHE.p[HeroClass.Mage].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.EN_NAME, true, HeroClass.Mage ) });
            this.ALL_REAPER_OPTIONS_CACHE.b[HeroClass.Warrior].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.EN_NAME, false, HeroClass.Warrior ) });
            this.ALL_REAPER_OPTIONS_CACHE.b[HeroClass.Huntress].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.EN_NAME, false, HeroClass.Huntress ) });
            this.ALL_REAPER_OPTIONS_CACHE.b[HeroClass.Mage].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.EN_NAME, false, HeroClass.Mage ) });
        }
    }

    private initUltimatumOptions() {
        this.ULTIMATUM_OPTIONS_CACHE = ALL_ULTIMATUM_TYPES.map(type => ({ value: type, label: this.slormancerTranslateService.translate('ultimatum_' + type) }))
    }
}