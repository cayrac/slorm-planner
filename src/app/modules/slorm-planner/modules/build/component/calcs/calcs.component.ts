import { Component } from '@angular/core';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { Character } from '@slorm-api';
import { takeUntil } from 'rxjs/operators';

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

    constructor(private buildStorageService: BuildStorageService) {
        super();
        this.buildStorageService.layerChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => this.character = layer === null ? null : layer.character);
    }
}
