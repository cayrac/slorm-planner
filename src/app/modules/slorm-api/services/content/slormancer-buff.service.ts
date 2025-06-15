import { Injectable } from '@angular/core';

import { Buff } from '../../model/content/buff';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerBuffService {

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    public getBuff(ref: string): Buff | null {
        const gameDataBuff = this.slormancerDataService.getGameDataBuff(ref);
        let buff: Buff | null = null;

        if (gameDataBuff !== null) {
            // aucune data dans les json du jeu mais par chance @ est toujours à 50% (pour le moment)
            const template = gameDataBuff.LOCAL_DESCRIPTION.replace('@', '50');

            buff = {
                name: gameDataBuff.LOCAL_NAME,
                description: this.slormancerTemplateService.prepareBuffTemplate(template),
                icon: 'buff/' + ref
            };
        }

        return buff;
    }
}