import { Component, Input } from '@angular/core';

import { SkillCostType } from '../../../slormancer/model/enum/skill-cost-type';
import { SkillGenre } from '../../../slormancer/model/enum/skill-genre';
import { SkillUpgrade } from '../../../slormancer/model/skill-upgrade';
import { SlormancerTemplateService } from '../../../slormancer/services/slormancer-template.service';

@Component({
  selector: 'app-skill-upgrade-view',
  templateUrl: './skill-upgrade-view.component.html',
  styleUrls: ['./skill-upgrade-view.component.scss']
})
export class SkillUpgradeViewComponent {

    @Input()
    public readonly upgrade: SkillUpgrade | null = null;

    constructor(private slormancerTemplateService: SlormancerTemplateService) { }

    public getCostLabel(costType: SkillCostType): string {
        return this.slormancerTemplateService.translate('tt_' + costType);
    }

    public getGenresLabel(genres: Array<SkillGenre>): string {
        return genres.map(genre => this.slormancerTemplateService.translate(genre)).join(', ');
    }
}
