import { Component, Input } from '@angular/core';

import { Reaper } from '../../../slormancer/model/reaper';
import { SlormancerTemplateService } from '../../../slormancer/services/slormancer-template.service';

@Component({
  selector: 'app-reaper-view',
  templateUrl: './reaper-view.component.html',
  styleUrls: ['./reaper-view.component.scss']
})
export class ReaperViewComponent {

    public readonly MAX_BONUS = 55;

    @Input()
    public readonly reaper: Reaper | null = null;

    constructor(private slormancerTemplateService: SlormancerTemplateService) { }

    public getDamageType(type: string): string {
        return this.slormancerTemplateService.translate(type);
    }

    public getVictimsLabel(): string {
        return this.slormancerTemplateService.translate('tt_victims');
    }

    public getLevelLabel(): string {
         return this.slormancerTemplateService.translate('level');
    }
}
