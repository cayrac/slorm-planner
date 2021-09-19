import { Injectable } from '@angular/core';

import { Character } from '../../model/character';
import { SlormancerStatsExtractorService } from './slormancer-stats-extractor.service';

@Injectable()
export class SlormancerStatsService {

    constructor(private slormancerStatsExtractorService: SlormancerStatsExtractorService) { }
    
    public getStats(character: Character) {
        return this.slormancerStatsExtractorService.extractStats(character);
    }
}