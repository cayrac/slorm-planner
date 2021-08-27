import { Injectable } from '@angular/core';

import { MechanicType } from '../model/enum/mechanic-type';
import { Mechanic } from '../model/mechanic';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerMechanicService {

    constructor(private slormancerTemplateService: SlormancerTemplateService) { }

    private getName(type: MechanicType): string {
        let key = 'tt_' + type + '_name';
        
        if (type === MechanicType.ShieldGlove) {
            key = 'tt_mechanic_' + type;
        }

        return this.slormancerTemplateService.translate(key);
    }
    private getDescription(type: MechanicType): string {
        let key = 'tt_help_' + type + '_effect';

        if (type === MechanicType.ShieldGlove) {
            key = 'tt_mechanic_' + type + '_effect';
        }

        return this.slormancerTemplateService.translate(key);
    }

    public getMechanic(type: MechanicType): Mechanic {
        const mechanic = {
            name: this.getName(type),
            type,
            description: '',
            icon: 'mechanic/' + type,
            template: this.getDescription(type)
        };

        this.updateMechanic(mechanic);

        return mechanic;
    }

    public updateMechanic(mechanic: Mechanic) {
        mechanic.description = mechanic.template;
    }
}