import { Component, Input } from '@angular/core';

import { Reaper } from '../../../slormancer/model/reaper';
import { SlormancerReaperService } from '../../../slormancer/services/slormancer-reaper.service';
import { SlormancerTemplateService } from '../../../slormancer/services/slormancer-template.service';

@Component({
  selector: 'app-reaper-view',
  templateUrl: './reaper-view.component.html',
  styleUrls: ['./reaper-view.component.scss']
})
export class ReaperViewComponent {

    @Input()
    public readonly reaper: Reaper | null = null;

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerReaperservice: SlormancerReaperService) { }

    public getDamageType(type: string): string {
        return this.slormancerTemplateService.translate(type);
    }

    public getVictimsLabel(): string {
        return this.slormancerTemplateService.translate('tt_victims');
    }

    public getLevelLabel(): string {
         return this.slormancerTemplateService.translate('level');
    }

    public getDamages(reaper: Reaper, level: number): string {
        const damages = this.slormancerReaperservice.getReaperDamages(reaper, level)
        return damages.min + '-' + damages.max;
    }
}
