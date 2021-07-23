import { Component, Input } from '@angular/core';

import { SkillCostType } from '../../../slormancer/model/enum/skill-cost-type';
import { SkillGenre } from '../../../slormancer/model/enum/skill-genre';
import { Skill } from '../../../slormancer/model/skill';
import { SlormancerTemplateService } from '../../../slormancer/services/slormancer-template.service';

@Component({
  selector: 'app-activable-view',
  templateUrl: './activable-view.component.html',
  styleUrls: ['./activable-view.component.scss']
})
export class ActivableViewComponent { // TODO continuer ici

    @Input()
    public readonly activable: Skill | null = null;

    @Input()
    public readonly reinforcment: number = 0;

    constructor(private slormancerTemplateService: SlormancerTemplateService) { }

    public getActivableDescription(): string | null {
        let description: string | null = null;

        if (this.activable !== null) {
            description = this.slormancerTemplateService.formatSkillDescription(this.activable, this.reinforcment);
        }

        return description;
    }

    public activableHasCost(activable: Skill): boolean {
        return activable.costType !== SkillCostType.None;
    }

    public activableHasLifeCost(activable: Skill): boolean {
        return activable.costType === SkillCostType.LifeSecond || activable.costType === SkillCostType.LifeLock || activable.costType === SkillCostType.Life;
    }

    public activableHasManaCost(activable: Skill): boolean {
        return activable.costType === SkillCostType.ManaSecond || activable.costType === SkillCostType.ManaLock || activable.costType === SkillCostType.Mana;
    }

    public getCostLabel(costType: SkillCostType): string {
        let result = '??';

        if (costType === SkillCostType.Life) {
            result = 'Life';
        } else if (costType === SkillCostType.Mana) {
            result = 'Mana';
        } else if (costType === SkillCostType.LifeLock) {
            result = '% Life Locked';
        } else if (costType === SkillCostType.ManaLock) {
            result = '% Mana Locked';
        } else if (costType === SkillCostType.LifeSecond) {
            result = 'Mana per Second';
        } else if (costType === SkillCostType.ManaSecond) {
            result = 'Mana per Second';
        }

        return result;
    }

    public getGenresLabel(genres: Array<SkillGenre>): string {
        return genres.map(genre => {
            let result = null;

            if (genre === SkillGenre.Aoe) {
                result = 'Area of Effect';
            } else if (genre === SkillGenre.Aura) {
                result = 'Aura';
            } else if (genre === SkillGenre.Melee) {
                result = 'Melee';
            } else if (genre === SkillGenre.Minion) {
                result = 'Minion';
            } else if (genre === SkillGenre.Movement) {
                result = 'Movement';
            } else if (genre === SkillGenre.Projectile) {
                result = 'Projectile';
            } else if (genre === SkillGenre.Special) {
                result = 'Special';
            } else if (genre === SkillGenre.Totem) {
                result = 'Totem';
            }

            return result;
        }).join(', ');
    }
}
