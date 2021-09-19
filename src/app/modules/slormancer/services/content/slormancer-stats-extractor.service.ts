import { Injectable } from '@angular/core';

import { Character } from '../../model/character';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { ExtractedCharacterStat, ExtractedCharacterStats } from '../../model/content/extracted-character-stats';

@Injectable()
export class SlormancerStatsExtractorService {

    private getAllEffectValues(character: Character): Array<AbstractEffectValue> {
        return [];
    }

    public extractStats(character: Character): ExtractedCharacterStats {
        const cache: { [key: string]: ExtractedCharacterStat } = { };

        const stats: ExtractedCharacterStats = {
            stats: [],
            synergies: []
        };

        console.warn(cache, this.getAllEffectValues(character));

        
        return stats;
    }
}