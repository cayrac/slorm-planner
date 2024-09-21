import { Injectable } from '@angular/core';

import { SkillCostType } from '../../model/content/enum/skill-cost-type';
import { strictParseInt } from '../../util/parse.util';
import { splitData, valueOrNull } from '../../util/utils';
import { SlormancerDataService } from './slormancer-data.service';

@Injectable()
export class SlormancerTranslateService {

    private readonly REGEXP_REMOVE_GENRE = /(.*)\((MS|MP|FS|FP)\)$/g;
    private readonly REGEXP_KEEP_GENRE = /.*\((MS|MP|FS|FP)\)$/g;

    private readonly TRANSLATION_CACHE: { [key: string]: string } = {
    };

    private readonly TRANSLATION_KEY_MAPPING: { [key: string]: string } = {
        training_lance_additional_damage_add: 'physical_damage',
        percent_missing_mana_base_100: 'percent_missing_mana',
        damage_taken_to_mana: 'damage',
        atk_arcanic: 'school_0',
        atk_temporal: 'school_1',
        atk_obliteration: 'school_2',
        chance_to_rebound_orb: 'chance_to_rebound',
        health_regen: 'health_regeneration',
    };

    constructor(private slormancerDataService: SlormancerDataService) { }

    private getTextGenre(textWithGenre: string, genre: string): string {
        let result = textWithGenre;

        const splitedData = splitData(textWithGenre, '/');
        if (splitedData.length === 4) {
            if (genre === 'MS') {
                result = <string>splitedData[0];
            } else if (genre === 'FS') {
                result = <string>splitedData[1];
            } else if (genre === 'MP') {
                result = <string>splitedData[2];
            } else {
                result = <string>splitedData[3];
            }
        }

        return result;
    }

    public splitTextAndGenre(text: string): { text: string, genre: string } {
        const genre = text.replace(this.REGEXP_KEEP_GENRE, '$1');
        return {
            text: this.removeGenre(text),
            genre: genre.length !== 2 ? 'MS' : genre
        } 
    }

    public removeGenre(text: string): string {
        return text.replace(this.REGEXP_REMOVE_GENRE, '$1');
    }

    public translate(key: string, genre: string | null = null): string {
        key = key.startsWith('*') ? key.slice(1) : key;
        let result = key;

        const cache = valueOrNull(this.TRANSLATION_CACHE[key]);

        if (cache !== null) {
            result = cache;
        } else {
            const replacment = this.TRANSLATION_KEY_MAPPING[key];
            if (replacment) {
                key = replacment;
            }

            const gameData = this.slormancerDataService.getTranslation(key);
            if (gameData !== null) {
                result = gameData.EN;
            } else if (key.startsWith('victims_reaper_')) {
                const reaper = this.slormancerDataService.getGameDataReaper(strictParseInt(key.substr(15)));
                if (reaper !== null) {
                    result = reaper.EN_NAME;
                }
            }

            this.TRANSLATION_CACHE[key] = result;
        }

        if (genre !== null) {
            result = this.getTextGenre(result, genre);
        }

        return result;
    }

    public translateCostType(costType: SkillCostType): string {
        return this.translate(costType === SkillCostType.ManaLockFlat ? costType : ('tt_' + costType));
    }

}