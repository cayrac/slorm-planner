import { Injectable } from '@angular/core';

import { DATA_MECHANIC } from '../../constants/content/data/data-mechanic';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { MechanicType } from '../../model/content/enum/mechanic-type';
import { Mechanic } from '../../model/content/mechanic';
import { isDamageType, isEffectValueSynergy, valueOrDefault } from '../../util/utils';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerMechanicService {

    constructor(private slormancerTranslateService: SlormancerTranslateService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    private getName(type: MechanicType): string {
        let key = 'tt_' + type + '_name';
        
        if (type === MechanicType.ShieldGlobe) {
            key = 'tt_mechanic_' + type;
        }

        return this.slormancerTranslateService.translate(key);
    }
    private getDescription(type: MechanicType, values: Array<AbstractEffectValue>): string {
        let key = 'tt_help_' + type + '_effect';

        if (type === MechanicType.ShieldGlobe) {
            key = 'tt_mechanic_' + type + '_effect';
        }

        const template = this.slormancerTranslateService.translate(key);

        return this.slormancerTemplateService.prepareMechanicTemplate(template, values.map(value => value.stat).filter(isDamageType));
    }

    public getMechanic(type: MechanicType): Mechanic {
        const values = valueOrDefault(DATA_MECHANIC[<string>type]?.values, []);
        const mechanic: Mechanic = {
            name: this.getName(type),
            type,
            description: '',
            icon: 'mechanic/' + type,
            template: this.getDescription(type, values),
            values,
        };

        this.updateMechanicView(mechanic);

        return mechanic;
    }

    public updateMechanicView(mechanic: Mechanic) {
        console.log('updating mechanic view : ', mechanic, mechanic.values.filter(isEffectValueSynergy).map(synergy => synergy.displaySynergy).join(', '));
        mechanic.description = this.slormancerTemplateService.formatMechanicTemplate(mechanic.template, mechanic.values);
    }
}