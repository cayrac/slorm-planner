import { Component, Input } from '@angular/core';

import { AttributeTraits } from '../../../slormancer/model/attribut-traits';

@Component({
  selector: 'app-attribute-summary-view',
  templateUrl: './attribute-summary-view.component.html',
  styleUrls: ['./attribute-summary-view.component.scss']
})
export class AttributeSummaryViewComponent {

    @Input()
    public readonly attributeTraits: AttributeTraits | null = null;

    constructor() { }
}
