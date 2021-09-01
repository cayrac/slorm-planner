import { Injectable } from '@angular/core';

import { strictParseInt } from '../util/parse.util';
import { splitData } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';

@Injectable()
export class SlormancerTranslateService {

    private readonly REGEXP_REMOVE_GENRE = /(.*)\((MS|MP|FS|FP)\)$/g;
    private readonly REGEXP_KEEP_GENRE = /.*\((MS|MP|FS|FP)\)$/g;

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
        key = key.startsWith('*') ? key.substr(1) : key;
        const gameData = this.slormancerDataService.getTranslation(key);
        const data = this.slormancerDataService.getDataAffixByRef(key);
        const keyword = this.slormancerDataService.getKeywordName(key);
        const dataTranslate = this.slormancerDataService.getDataTranslate(key);
        let result = key;

        if (gameData !== null) {
            result = gameData.EN;
        } else if (data !== null) {
            result = data.name;
        } else if (keyword !== null) {
            result = keyword;
        } else if (dataTranslate !== null) {
            result = dataTranslate;
        } else if (key.startsWith('victims_reaper_')) {
            const reaper = this.slormancerDataService.getGameDataReaper(strictParseInt(key.substr(15)));
            if (reaper !== null) {
                result = reaper.EN_NAME;
            }
        }

        if (genre !== null) {
            result = this.getTextGenre(result, genre);
        }

        return result;
    }

}