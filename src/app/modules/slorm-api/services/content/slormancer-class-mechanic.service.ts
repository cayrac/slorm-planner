import { Injectable } from '@angular/core';

import { DATA_CLASS_MECHANIC } from '../../constants/content/data/data-class-mechanic';
import { GameHeroesData } from '../../model';
import { ClassMechanic } from '../../model/content/class-mechanic';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { HeroClass } from '../../model/content/enum/hero-class';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { isDamageType, valueOrDefault } from '../../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerClassMechanicService {

    private classMechanics: GameHeroesData<{ [key: number]: ClassMechanic }> = { 0: {}, 1: {}, 2: {} }

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    public getClassMechanic(heroClass: HeroClass, id: number): ClassMechanic | null {
        let mechanic: ClassMechanic | null = this.classMechanics[heroClass][id] ?? null;
        if (mechanic === null) {
            const data = this.slormancerDataService.getGameDataSkill(heroClass, id);
    
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
                this.classMechanics[heroClass][id] = mechanic;
            }
        }

        return mechanic;
    }

    private updateClassMechanicView(mechanic: ClassMechanic) {
        mechanic.description = this.slormancerTemplateService.formatMechanicTemplate(mechanic.template, mechanic.values);
    }

    public updateClassMechanicViews(heroClass: HeroClass) {
        for(const id in this.classMechanics[heroClass]) {
            const mechanic = this.classMechanics[heroClass][id];
            if (mechanic) {
                this.updateClassMechanicView(mechanic);
            }
        }
    }

    public getClassMechanics(heroClass: HeroClass): ClassMechanic[] {
        return Object.values(this.classMechanics[heroClass]);
    }
}