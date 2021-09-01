import { Component, Input } from '@angular/core';

import { SkillCostType } from '../../../slormancer/model/enum/skill-cost-type';
import { SkillGenre } from '../../../slormancer/model/enum/skill-genre';
import { SkillType } from '../../../slormancer/model/skill-type';
import { SkillUpgrade } from '../../../slormancer/model/skill-upgrade';
import { SlormancerTranslateService } from '../../../slormancer/services/slormancer-translate.service';

@Component({
  selector: 'app-skill-upgrade-view',
  templateUrl: './skill-upgrade-view.component.html',
  styleUrls: ['./skill-upgrade-view.component.scss']
})
export class SkillUpgradeViewComponent {

    public readonly RANK_LABEL = 'tt_rank';
    public readonly MASTERY_LABEL = 'tt_mastery';
    public readonly NEXT_RANK_LABEL = 'tt_next_rank';
    public readonly MAX_RANK_LABEL = 'tt_max_rank';

    @Input()
    public readonly upgrade: SkillUpgrade | null = null;

    constructor(private slormancerTranslateService: SlormancerTranslateService) { }

    public getCostLabel(costType: SkillCostType): string {
        return this.slormancerTranslateService.translate('tt_' + costType);
    }

    public getGenresLabel(genres: Array<SkillGenre>): string {
        return genres.map(genre => this.slormancerTranslateService.translate(genre)).join(', ');
    }

    public getTypeLabel(type: SkillType): string {
        return this.slormancerTranslateService.translate('tt_' + type);
    }

    public translate(key: string): string {
        return this.slormancerTranslateService.translate(key);
    }
}
