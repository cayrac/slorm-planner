import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../../../shared/services/planner.service';
import { Character } from '../../../../../slormancer/model/character';
import { Activable } from '../../../../../slormancer/model/content/activable';
import { AncestralLegacy } from '../../../../../slormancer/model/content/ancestral-legacy';
import { Skill } from '../../../../../slormancer/model/content/skill';
import { SlormancerCharacterService } from '../../../../../slormancer/services/slormancer-character.service';


@Component({
  selector: 'app-skill-bar',
  templateUrl: './skill-bar.component.html',
  styleUrls: ['./skill-bar.component.scss']
})
export class SkillBarComponent extends AbstractUnsubscribeComponent implements OnInit {

    public character: Character | null = null;

    constructor(private plannerService: PlannerService,
                private slormancerCharacterService: SlormancerCharacterService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }

    public updatePrimarySkill(skill: Skill) {
        if (this.character !== null) {
            this.slormancerCharacterService.setPrimarySkill(this.character, skill)
        }
    }

    public updateSecondarySkill(skill: Skill) {
        if (this.character !== null) {
            this.slormancerCharacterService.setSecondarySkill(this.character, skill)
        }
    }

    public updateSupportSkill(skill: Skill) {
        if (this.character !== null) {
            this.slormancerCharacterService.setSupportSkill(this.character, skill)
        }
    }

    public updateActivable1(activable: Activable | AncestralLegacy | null) {
        if (this.character !== null && this.character.activable1 !== activable) {
            if (activable !== null) {
                if (this.character.activable2 === activable) {
                    this.character.activable2 = this.character.activable1;
                } else if (this.character.activable3 === activable) {
                    this.character.activable3 = this.character.activable1;
                } else if (this.character.activable4 === activable) {
                    this.character.activable4 = this.character.activable1;
                }
            }
            this.character.activable1 = activable;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }

    public updateActivable2(activable: Activable | AncestralLegacy | null) {
        if (this.character !== null && this.character.activable2 !== activable) {
            if (activable !== null) {
                if (this.character.activable1 === activable) {
                    this.character.activable1 = this.character.activable2;
                } else if (this.character.activable3 === activable) {
                    this.character.activable3 = this.character.activable2;
                } else if (this.character.activable4 === activable) {
                    this.character.activable4 = this.character.activable2;
                }
            }
            this.character.activable2 = activable;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }

    public updateActivable3(activable: Activable | AncestralLegacy | null) {
        if (this.character !== null && this.character.activable3 !== activable) {
            if (activable !== null) {
                if (this.character.activable1 === activable) {
                    this.character.activable1 = this.character.activable3;
                } else if (this.character.activable2 === activable) {
                    this.character.activable2 = this.character.activable3;
                } else if (this.character.activable4 === activable) {
                    this.character.activable4 = this.character.activable3;
                }
            }
            this.character.activable3 = activable;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }

    public updateActivable4(activable: Activable | AncestralLegacy | null) {
        if (this.character !== null && this.character.activable4 !== activable) {
            if (activable !== null) {
                if (this.character.activable1 === activable) {
                    this.character.activable1 = this.character.activable4;
                } else if (this.character.activable3 === activable) {
                    this.character.activable3 = this.character.activable4;
                } else if (this.character.activable2 === activable) {
                    this.character.activable2 = this.character.activable4;
                }
            }
            this.character.activable4 = activable;
            this.slormancerCharacterService.updateCharacter(this.character);
        }
    }
}
    
