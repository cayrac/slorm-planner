import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildService } from '../../../shared/services/build.service';
import { CharacterAttributes } from '../../../slormancer/model/character';
import { ALL_ATTRIBUTES } from '../../../slormancer/model/content/enum/attribute';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss']
})
export class AttributesComponent extends AbstractUnsubscribeComponent implements OnInit {

    public readonly ALL_ATTRIBUTES = ALL_ATTRIBUTES;

    public attributes: CharacterAttributes | null = null;

    constructor(private plannerService: BuildService) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.attributes = character === null ? null : character.attributes);
    }


}
