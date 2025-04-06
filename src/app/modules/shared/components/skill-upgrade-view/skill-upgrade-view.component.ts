import { Component, Input } from '@angular/core';
import { Buff, ClassMechanic, Mechanic, SkillType, SkillUpgrade, SlormancerTranslateService } from '@slorm-api';

@Component({
  selector: 'app-skill-upgrade-view',
  templateUrl: './skill-upgrade-view.component.html',
  styleUrls: ['./skill-upgrade-view.component.scss']
})
export class SkillUpgradeViewComponent {

    public readonly RANK_LABEL: string;
    public readonly MASTERY_LABEL: string;

    @Input()
    public readonly upgrade: SkillUpgrade | null = null;

    public mouseOverElement: Mechanic | ClassMechanic | Buff | null = null

    constructor(private slormancerTranslateService: SlormancerTranslateService
    ) {
        this.RANK_LABEL = this.slormancerTranslateService.translate('tt_rank');
        this.MASTERY_LABEL = this.slormancerTranslateService.translate('tt_mastery');
    }

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
