import { Component } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildService } from '../../../shared/services/build.service';
import { Character } from '../../../slormancer/model/character';

enum CalcPage {
    Defense,
    TurretSyndrome
}

@Component({
  selector: 'app-calcs',
  templateUrl: './calcs.component.html',
  styleUrls: ['./calcs.component.scss']
})
export class CalcsComponent extends AbstractUnsubscribeComponent {

    public readonly CalcPage = CalcPage;

    public character: Character | null = null;

    public readonly options = [
        { value: CalcPage.Defense, label: 'Defenses' },
        { value: CalcPage.TurretSyndrome, label: 'Turret' },
    ];

    public currentCalc: CalcPage | null = null;

    constructor(private plannerService: BuildService) {
        super();
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }
}
