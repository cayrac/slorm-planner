import { Injectable } from '@angular/core';

import { ClassMechanic } from '../../model/content/class-mechanic';
import { HeroClass } from '../../model/content/enum/hero-class';
import { SlormancerDataService } from './slormancer-data.service';

@Injectable()
export class SlormancerClassMechanicService {

    constructor(private slormancerDataService: SlormancerDataService) { }

    public getClassMechanic(heroClass: HeroClass, id: number): ClassMechanic | null {
        const data = this.slormancerDataService.getGameDataSkill(heroClass, id);
        let mechanic: ClassMechanic | null = null;

        if (data !== null) {
            mechanic = {
                id: data.REF,
                name: data.EN_NAME,
                description: '',
                icon: 'skill/' + heroClass + '/' + data.REF,
                template: data.EN_DESCRIPTION,
                values: []
            };

            this.updateMechanic(mechanic);
        }

        return mechanic;
    }

    public updateMechanic(mechanic: ClassMechanic) {
        mechanic.description = mechanic.template;
    }
}