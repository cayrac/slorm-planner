import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import {
    SlormancerCharacterModifierService,
} from 'src/app/modules/slormancer/services/slormancer-character.modifier.service';

import { Character } from '../../../slormancer/model/character';
import { Activable } from '../../../slormancer/model/content/activable';
import { AncestralLegacy } from '../../../slormancer/model/content/ancestral-legacy';
import { Skill } from '../../../slormancer/model/content/skill';
import { BuildStorageService } from '../../services/build-storage.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';



@Component({
  selector: 'app-skill-bar',
  templateUrl: './skill-bar.component.html',
  styleUrls: ['./skill-bar.component.scss']
})
export class SkillBarComponent extends AbstractUnsubscribeComponent implements OnInit {

    public character: Character | null = null;

    constructor(private buildStorageService: BuildStorageService,
                private slormancerCharacterModifierService: SlormancerCharacterModifierService) {
        super();
    }

    public ngOnInit() {
        this.buildStorageService.layerChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => this.character = layer !== null && layer.character !== null ? layer.character : null);
    }

    public updatePrimarySkill(skill: Skill) {
        if (this.character !== null) {
            this.slormancerCharacterModifierService.setPrimarySkill(this.character, skill);
            this.buildStorageService.saveLayer();
        }
    }

    public updateSecondarySkill(skill: Skill) {
        if (this.character !== null) {
            this.slormancerCharacterModifierService.setSecondarySkill(this.character, skill);
            this.buildStorageService.saveLayer();
        }
    }

    public updateSupportSkill(skill: Skill) {
        if (this.character !== null) {
            this.slormancerCharacterModifierService.setSupportSkill(this.character, skill);
            this.buildStorageService.saveLayer();
        }
    }

    public updateActivable1(activable: Activable | AncestralLegacy | null) {
        if (this.character !== null && this.character.activable1 !== activable) {
            if (activable !== null) {
                // à déplacer dans character modifier
                if (this.character.activable2 === activable) {
                    this.character.activable2 = this.character.activable1;
                } else if (this.character.activable3 === activable) {
                    this.character.activable3 = this.character.activable1;
                } else if (this.character.activable4 === activable) {
                    this.character.activable4 = this.character.activable1;
                }
            }
            this.character.activable1 = activable;
            this.buildStorageService.saveLayer();
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
            this.buildStorageService.saveLayer();
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
            this.buildStorageService.saveLayer();
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
            this.buildStorageService.saveLayer();
        }
    }
}
    
