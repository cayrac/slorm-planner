import { Injectable } from '@angular/core';

import { EQUIPABLE_ITEM_BASE_VALUES, EquipableItemBase } from '../../slormancer/model/content/enum/equipable-item-base';
import { Rarity } from '../../slormancer/model/content/enum/rarity';
import { GameDataStat } from '../../slormancer/model/content/game/data/game-data-stat';
import { SlormancerDataService } from '../../slormancer/services/content/slormancer-data.service';
import { SlormancerTranslateService } from '../../slormancer/services/content/slormancer-translate.service';
import { compareString, valueOrDefault } from '../../slormancer/util/utils';
import { SelectOption } from '../model/select-option';

@Injectable()
export class ItemFormService {

    private STATS_OPTIONS_CACHE: { [key: string]: { [key: string]: Array<SelectOption<string>> } } = {};

    private ALL_STATS_OPTIONS: Array<SelectOption<string>> = [];

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTranslateService: SlormancerTranslateService
                ) {
        console.log('NEW ItemFormService Instance');
        this.initStatOptionsCache();
    }

    private getBaseKey(base: EquipableItemBase): keyof GameDataStat {
        return <keyof GameDataStat>(base === EquipableItemBase.Body ? 'ARMOR' : base.toUpperCase());
    }

    private initStatOptionsCache() {
        const stats = this.slormancerDataService.getGameDataStats().filter(stat => stat.PERCENT !== 'X');


        this.STATS_OPTIONS_CACHE = {};
        this.ALL_STATS_OPTIONS = [];

        for (const stat of stats) {
            const option: SelectOption<string> = {
                label: this.slormancerTranslateService.translate(stat.REF) + (stat.PERCENT === '%' ? ' (%)' : ''),
                value: stat.REF
            }

            this.ALL_STATS_OPTIONS.push(option);

            for (const base of EQUIPABLE_ITEM_BASE_VALUES) {
                const statKey = this.getBaseKey(base);
                const rarity = stat[statKey];

                if (rarity !== '') {
                    let statBase = this.STATS_OPTIONS_CACHE[base];
                    if (statBase === undefined) {
                        statBase = {};
                        this.STATS_OPTIONS_CACHE[base] = statBase;
                    }
                    let statRarity = statBase[rarity];
                    if (statRarity === undefined) {
                        statRarity = [];
                        statBase[rarity] = statRarity;
                    }

                    statRarity.push(option);
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

        this.ALL_STATS_OPTIONS.sort((a, b) => compareString(a.label, b.label));

        console.log(this.STATS_OPTIONS_CACHE);

    }

    public getStatsOptions(base: EquipableItemBase, rarity: Rarity): Array<SelectOption<string>> {
        let result = this.ALL_STATS_OPTIONS;

        const baseStats = this.STATS_OPTIONS_CACHE[base];
        if (baseStats) {
            if (rarity === Rarity.Basic) {
                result = valueOrDefault(baseStats['P'], []);
            } else if (rarity === Rarity.Magic || rarity === Rarity.Rare) {
                result = valueOrDefault(baseStats['S'], []);
            }
        }

        return result;
    }
}