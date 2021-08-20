import { Component, Input } from '@angular/core';

import { SkillCostType } from '../../../slormancer/model/enum/skill-cost-type';
import { SkillGenre } from '../../../slormancer/model/enum/skill-genre';
import { Skill } from '../../../slormancer/model/skill';
import { SlormancerTemplateService } from '../../../slormancer/services/slormancer-template.service';

@Component({
  selector: 'app-skill-view',
  templateUrl: './skill-view.component.html',
  styleUrls: ['./skill-view.component.scss']
})
export class SkillViewComponent {

    @Input()
    public readonly skill: Skill | null = null;

    constructor(private slormancerTemplateService: SlormancerTemplateService) { }

    public getCostLabel(costType: SkillCostType): string {
        return this.slormancerTemplateService.translate(costType);
    }

    public getGenresLabel(genres: Array<SkillGenre>): string {
        return genres.map(genre => this.slormancerTemplateService.translate(genre)).join(', ');
    }
}
