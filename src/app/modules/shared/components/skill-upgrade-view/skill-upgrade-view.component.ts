import { Component, Input } from '@angular/core';

import { Buff } from '../../../slormancer/model/content/buff';
import { ClassMechanic } from '../../../slormancer/model/content/class-mechanic';
import { Mechanic } from '../../../slormancer/model/content/mechanic';
import { SkillType } from '../../../slormancer/model/content/skill-type';
import { SkillUpgrade } from '../../../slormancer/model/content/skill-upgrade';
import { SlormancerTranslateService } from '../../../slormancer/services/content/slormancer-translate.service';

@Component({
  selector: 'app-skill-upgrade-view',
  templateUrl: './skill-upgrade-view.component.html',
  styleUrls: ['./skill-upgrade-view.component.scss']
})
export class SkillUpgradeViewComponent {

    public readonly RANK_LABEL = this.slormancerTranslateService.translate('tt_rank');
    public readonly MASTERY_LABEL = this.slormancerTranslateService.translate('tt_mastery');

    @Input()
    public readonly upgrade: SkillUpgrade | null = null;

    public mouseOverElement: Mechanic | ClassMechanic | Buff | null = null

    constructor(private slormancerTranslateService: SlormancerTranslateService) { }

    public getTypeLabel(type: SkillType): string {
        return this.slormancerTranslateService.translate('tt_' + type);
    }

    public showMechanicOverlay(mechanic: Mechanic | ClassMechanic | Buff) {
        this.mouseOverElement = mechanic;
    }

    public hideMechanicOverlay() {
        this.mouseOverElement = null;
    }
}
