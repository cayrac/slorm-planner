import { Injectable } from '@angular/core';

import { UltimatumType } from '../../model/content/enum/ultimatum-type';
import { Ultimatum } from '../../model/content/ultimatum';

@Injectable()
export class SlormancerUltimatumService {

    constructor() { }

    public getUltimatum(type: UltimatumType, level: number): Ultimatum {
        const result = {
            type,
            level
        };

        this.updateUltimatum(result);

        return result;
    }

    public updateUltimatum(ultimatum: Ultimatum) {

    }

}