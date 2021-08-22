import { Injectable } from '@angular/core';

import { MechanicType } from '../model/enum/mechanic-type';
import { Mechanic } from '../model/mechanic';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerMechanicService {

    constructor(private slormancerTemplateService: SlormancerTemplateService) { }

    public getMechanic(type: MechanicType): Mechanic {
        const mechanic = {
            name: this.slormancerTemplateService.translate('tt_' + type + '_name'),
            type,
            description: '',
            icon: 'mechanic/' + type,
            template: this.slormancerTemplateService.translate('tt_help_' + type + '_effect')
        };

        this.updateMechanic(mechanic);

        return mechanic;
    }

    public updateMechanic(mechanic: Mechanic) {
        mechanic.description = mechanic.template;
    }
}