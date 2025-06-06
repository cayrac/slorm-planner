import { Injectable } from '@angular/core';
import {
    ALL_ATTRIBUTES,
    ALL_RARITIES,
    ALL_REAPER_SMITH,
    ALL_ULTIMATUM_TYPES,
    compareString,
    EQUIPABLE_ITEM_BASE_VALUES,
    EquipableItemBase,
    GameDataStat,
    GameHeroesData,
    HeroClass,
    Rarity,
    ReaperSmith,
    SlormancerDataService,
    SlormancerReaperService,
    SlormancerTranslateService,
    UltimatumType,
    valueOrDefault,
} from '@slorm-api';

import { SelectOption } from '../model/select-option';

@Injectable({ providedIn: 'root' })
export class FormOptionsService {

    private DEFENSIVE_STATS: string[] = [
        'reduced_damage_from_all_percent',
        'reduced_damage_from_area_percent',
        'reduced_damage_from_melee_percent',
        'reduced_damage_from_projectile_percent',
        'reduced_damage_on_elite_percent',
        'res_phy_add',
        'res_phy_percent',
        'res_mag_add',
        'res_mag_percent',
        'dodge_add',
        'dodge_percent',
        'the_max_health_add',
        'the_max_health_percent',
        'tenacity_percent',
    ];

    private STATS_LABELS: { [key in string]: string }= {};

    private STATS_OPTIONS_CACHE: { [key: string]: { P: Array<SelectOption<string>>, S: Array<SelectOption<string>>, E: Array<SelectOption<string>>, D: Array<SelectOption<string>> } } = {};

    private LEGENDARY_OPTIONS_CACHE: { [key: string]: GameHeroesData<Array<SelectOption<number>>> } = {};

    private ALL_LEGENDARY_OPTIONS_CACHE: GameHeroesData<Array<SelectOption<number>>> = { 0: [], 1: [], 2: [] };

    private ALL_STATS_OPTIONS_CACHE: Array<SelectOption<string>> = [];

    private ALL_RARITIES_OPTIONS_CACHE: Array<SelectOption<Rarity>> = [];

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
        this.initRarityOptionsCache();
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

    public getAllStatsOptions(): Array<SelectOption<string>> {
        return this.ALL_STATS_OPTIONS_CACHE;
    }

    public getAllRaritiesOptions(): Array<SelectOption<Rarity>> {
        return this.ALL_RARITIES_OPTIONS_CACHE;
    }

    public getStatsOptions(base: EquipableItemBase, rarity: Rarity): Array<SelectOption<string>> {
        let result = this.ALL_STATS_OPTIONS_CACHE;
        const statKey = this.getBaseKey(base);

        const baseStats = this.STATS_OPTIONS_CACHE[statKey];
        if (baseStats) {
            if (rarity === Rarity.Normal) {
                result = valueOrDefault(baseStats['P'], []);
            } else if (rarity === Rarity.Magic || rarity === Rarity.Rare) {
                result = valueOrDefault(baseStats['S'], []);
            } else if (rarity === Rarity.Epic) {
                result = valueOrDefault(baseStats['E'], []);
            } else if (rarity === Rarity.Defensive) {
                result = valueOrDefault(baseStats['D'], []);
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

    public getAllLegendaryOptions(heroClass: HeroClass): Array<SelectOption<number>> {
        return this.ALL_LEGENDARY_OPTIONS_CACHE[heroClass];
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

    public getStatsLabels(): { [key in string]: string } {
        return this.STATS_LABELS;
    }

    private getBaseKey(base: EquipableItemBase): keyof GameDataStat {
        return <keyof GameDataStat>(base === EquipableItemBase.Body ? 'ARMOR' : base.toUpperCase());
    }

    private initRarityOptionsCache() {
        this.ALL_RARITIES_OPTIONS_CACHE = ALL_RARITIES.map(rarity => ({
            label: this.slormancerTranslateService.translate('RAR_loot_' + rarity),
            value: rarity
        }));
    }

    private initStatOptionsCache() {
        const stats = this.slormancerDataService.getGameDataStats().filter(stat => stat.PERCENT !== 'X');

        /*
         * P : normal / magic / rare
         * S : magic / rare / epic
         */

        this.STATS_OPTIONS_CACHE = {};
        this.ALL_STATS_OPTIONS_CACHE = [];

        for (const stat of stats) {
            const label = this.slormancerTranslateService.translate(stat.REF) + (stat.PERCENT === '%' ? ' (%)' : '');
            const option: SelectOption<string> = { label, value: stat.REF };
            this.STATS_LABELS[stat.REF] = label;

            this.ALL_STATS_OPTIONS_CACHE.push(option);

            for (const base of EQUIPABLE_ITEM_BASE_VALUES) {
                const statKey = this.getBaseKey(base);
                const rarity = stat[statKey];
                

                if (rarity !== '') {
                    let statBase = this.STATS_OPTIONS_CACHE[statKey];
                    if (statBase === undefined) {
                        statBase = {
                            P: [],
                            S: [],
                            E: [],
                            D: [],
                        };
                        this.STATS_OPTIONS_CACHE[statKey] = statBase;
                    }

                    if (rarity === 'P') {
                        statBase.P.push(option);
                        statBase.S.push(option);

                        if (this.DEFENSIVE_STATS.includes(stat.REF)) {
                            statBase.D.push(option);
                        }
                    }

                    if (rarity === 'S') {
                        statBase.S.push(option);
                        statBase.E.push(option);

                        if (this.DEFENSIVE_STATS.includes(stat.REF)) {
                            statBase.D.push(option);
                        }
                    }

                    if (rarity === 'E') {
                        statBase.E.push(option);
                    }
                }
            }
        }

        for (const base of EQUIPABLE_ITEM_BASE_VALUES) {
            const statKey = this.getBaseKey(base);
            
            const baseOptions = this.STATS_OPTIONS_CACHE[statKey];
            if (baseOptions) {
                baseOptions.P.sort((a, b) => compareString(a.label, b.label));
                baseOptions.S.sort((a, b) => compareString(a.label, b.label));
                baseOptions.E.sort((a, b) => compareString(a.label, b.label));
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

            if (legendary.HERO === -1 || legendary.HERO === 99 || legendary.HERO === 999) {
                data[0].push(option);
                this.ALL_LEGENDARY_OPTIONS_CACHE[0].push(option);
                data[1].push(option);
                this.ALL_LEGENDARY_OPTIONS_CACHE[1].push(option);
                data[2].push(option);
                this.ALL_LEGENDARY_OPTIONS_CACHE[2].push(option);
            } else {
                data[legendary.HERO].push(option);
                this.ALL_LEGENDARY_OPTIONS_CACHE[legendary.HERO].push(option);
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
            this.ALL_REAPER_OPTIONS_CACHE.p[HeroClass.Warrior].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.LOCAL_NAME, true, HeroClass.Warrior ) });
            this.ALL_REAPER_OPTIONS_CACHE.p[HeroClass.Huntress].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.LOCAL_NAME, true, HeroClass.Huntress ) });
            this.ALL_REAPER_OPTIONS_CACHE.p[HeroClass.Mage].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.LOCAL_NAME, true, HeroClass.Mage ) });
            this.ALL_REAPER_OPTIONS_CACHE.b[HeroClass.Warrior].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.LOCAL_NAME, false, HeroClass.Warrior ) });
            this.ALL_REAPER_OPTIONS_CACHE.b[HeroClass.Huntress].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.LOCAL_NAME, false, HeroClass.Huntress ) });
            this.ALL_REAPER_OPTIONS_CACHE.b[HeroClass.Mage].push({ value: reaper.REF, label: this.slormancerReaperService.getReaperName(reaper.LOCAL_NAME, false, HeroClass.Mage ) });
        }
    }

    private initUltimatumOptions() {
        this.ULTIMATUM_OPTIONS_CACHE = ALL_ULTIMATUM_TYPES.map(type => ({ value: type, label: this.slormancerTranslateService.translate('ultimatum_' + type) }))
    }
}