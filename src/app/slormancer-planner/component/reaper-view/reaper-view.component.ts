import { Component, Input } from '@angular/core';

import { Reaper } from '../../../slormancer/model/reaper';
import { SlormancerTemplateService } from '../../../slormancer/services/slormancer-template.service';

@Component({
  selector: 'app-reaper-view',
  templateUrl: './reaper-view.component.html',
  styleUrls: ['./reaper-view.component.scss']
})
export class ReaperViewComponent {

    public readonly BENEDICTION_LABEL = 'tt_ancient_bonus';
    public readonly MALEDICTION_LABEL = 'tt_ancient_malus';
    public readonly VICTIMS_LABEL = 'tt_victims';
    public readonly LEVEL_LABEL = 'level';
    
    public readonly MAX_BONUS = 55;

    @Input()
    public readonly reaper: Reaper | null = null;

    constructor(private slormancerTemplateService: SlormancerTemplateService) { }

    public translate(value: string): string {
        return this.slormancerTemplateService.translate(value);
    }
}
