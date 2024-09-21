import { Injectable } from '@angular/core';

import { DATA_CLASS_MECHANIC } from '../../constants/content/data/data-class-mechanic';
import { ClassMechanic } from '../../model/content/class-mechanic';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { HeroClass } from '../../model/content/enum/hero-class';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { isDamageType, valueOrDefault } from '../../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerClassMechanicService {

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    public getClassMechanicClone(classMechanic: ClassMechanic): ClassMechanic {
        return {
            ...classMechanic,
            genres : [ ...classMechanic.genres ],
            values: classMechanic.values.map(value => ({ ...value }))
        }
    }

    public getClassMechanic(heroClass: HeroClass, id: number): ClassMechanic | null {
        const data = this.slormancerDataService.getGameDataSkill(heroClass, id);
        let mechanic: ClassMechanic | null = null;

        if (data !== null) {
            const values: Array<AbstractEffectValue> = valueOrDefault(DATA_CLASS_MECHANIC[heroClass][id]?.values, []);
            const genres: Array<SkillGenre> = valueOrDefault(DATA_CLASS_MECHANIC[heroClass][id]?.genres, []);
            const templateOverride = valueOrDefault(DATA_CLASS_MECHANIC[heroClass][id]?.templateOverride, template => template);
            mechanic = {
                id: data.REF,
                name: data.EN_NAME,
                genres,
                description: '',
                icon: 'skill/' + heroClass + '/' + data.REF,
                template: this.slormancerTemplateService.prepareMechanicTemplate(templateOverride(data.EN_DESCRIPTION), values.map(value => value.stat).filter(isDamageType)),
                values: values.map(value => ({ ...value }))
            };

            this.updateClassMechanicView(mechanic);
        }

        return mechanic;
    }

    public updateClassMechanicView(mechanic: ClassMechanic) {
        mechanic.description = this.slormancerTemplateService.formatMechanicTemplate(mechanic.template, mechanic.values);
    }
}