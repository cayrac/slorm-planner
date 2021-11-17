import { Injectable } from '@angular/core';

import { DATA_MECHANIC } from '../../constants/content/data/data-mechanic';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { MechanicType } from '../../model/content/enum/mechanic-type';
import { Mechanic } from '../../model/content/mechanic';
import { isDamageType, valueOrDefault } from '../../util/utils';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerMechanicService {

    constructor(private slormancerTranslateService: SlormancerTranslateService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    private getName(type: MechanicType): string {
        let key;
        
        if (type === MechanicType.WalkingBomb) {
            key = 'tt_' + type;
        } else if (type === MechanicType.ShieldGlobe || type === MechanicType.Fireball || type === MechanicType.Dart) {
            key = 'tt_mechanic_' + type;
        } else {
            key = 'tt_' + type + '_name';
        }

        return this.slormancerTranslateService.translate(key);
    }
    private getDescription(type: MechanicType, values: Array<AbstractEffectValue>): string {
        let key;

        if (type === MechanicType.WalkingBomb) {
            key = 'tt_' + type + '_effect';
        } else if (type === MechanicType.ShieldGlobe || type === MechanicType.Fireball || type === MechanicType.Dart) {
            key = 'tt_mechanic_' + type + '_effect';
        } else {
            key = 'tt_help_' + type + '_effect';
        }

        const template = this.slormancerTranslateService.translate(key);

        return this.slormancerTemplateService.prepareMechanicTemplate(template, values.map(value => value.stat).filter(isDamageType));
    }

    public getMechanicClone(mechanic: Mechanic): Mechanic {
        return {
            ...mechanic,
            values: mechanic.values.map(value => ({ ...value })),
        };
    }

    public getMechanic(type: MechanicType): Mechanic {
        const values = valueOrDefault(DATA_MECHANIC[<string>type]?.values, []);
        const genres = valueOrDefault(DATA_MECHANIC[<string>type]?.genres, []);
        const mechanic: Mechanic = {
            name: this.getName(type),
            type,
            description: '',
            icon: 'mechanic/' + type,
            genres, 
            template: this.getDescription(type, values),
            values: values.map(value => ({ ...value })),
        };

        this.updateMechanicView(mechanic);

        return mechanic;
    }

    public updateMechanicView(mechanic: Mechanic) {
        mechanic.description = this.slormancerTemplateService.formatMechanicTemplate(mechanic.template, mechanic.values);
    }
}