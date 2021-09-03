import { Injectable } from '@angular/core';

import { Buff } from '../../model/content/buff';
import { SlormancerDataService } from './slormancer-data.service';

@Injectable()
export class SlormancerBuffService {

    constructor(private slormancerDataService: SlormancerDataService) { }

    public getBuff(ref: string): Buff | null {
        const gameDataBuff = this.slormancerDataService.getGameDataBuff(ref);
        let buff: Buff | null = null;

        if (gameDataBuff !== null) {
            buff = {
                name: gameDataBuff.EN_NAME,
                description: gameDataBuff.EN_DESCRIPTION,
                icon: 'buff/' + ref
            };
        }

        return buff;
    }
}