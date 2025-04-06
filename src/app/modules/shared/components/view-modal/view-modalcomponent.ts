import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Activable, AncestralLegacy, AttributeTraits, Entity, EquipableItem, Mechanic, Reaper, Rune, Skill, SkillUpgrade, Trait, Ultimatum } from '@slorm-api';

export interface ViewData {
    entity: Entity;
    tooltip?: boolean;
    details?: boolean;
    hideNextRank?: boolean;
}

@Component({
  selector: 'app-view-modal',
  templateUrl: './view-modal.component.html',
  styleUrls: ['./view-modal.component.scss']
})
export class ViewModalComponent {

    public entity: Entity;

    public tooltip = false;
    public details = false;
    public hideNextRank = false;

    constructor(@Inject(MAT_DIALOG_DATA) data: ViewData) {
        this.entity = data.entity;

        this.tooltip = this.tooltip ?? false;
        this.details = this.details ?? false;
        this.hideNextRank = this.hideNextRank ?? false;
    }

    public isReaper(entity: Entity): entity is { reaper: Reaper } {
        return 'reaper' in entity;
    }

    public isAttribute(entity: Entity): entity is { attribute: AttributeTraits } {
        return 'attribute' in entity;
    }

    public isItem(entity: Entity): entity is { item: EquipableItem } {
        return 'item' in entity;
    }

    public isAncestralLegacy(entity: Entity): entity is { ancestralLegacy: AncestralLegacy } {
        return 'ancestralLegacy' in entity;
    }

    public isActivable(entity: Entity): entity is { activable: Activable } {
        return 'activable' in entity;
    }

    public isMechanic(entity: Entity): entity is { mechanic: Mechanic } {
        return 'mechanic' in entity;
    }

    public isRune(entity: Entity): entity is { rune: Rune } {
        return 'rune' in entity;
    }

    public isSkill(entity: Entity): entity is { skill: Skill } {
        return 'skill' in entity;
    }

    public isTrait(entity: Entity): entity is { trait: Trait } {
        return 'trait' in entity;
    }

    public isUltimatum(entity: Entity): entity is { ultimatum: Ultimatum } {
        return 'ultimatum' in entity;
    }

    public isUpgrade(entity: Entity): entity is { upgrade: SkillUpgrade } {
        return 'upgrade' in entity;
    }
}
