import { Component, Input, OnInit } from '@angular/core';

import { PlannerService } from '../../../../../shared/services/planner.service';
import { AttributeTraits } from '../../../../../slormancer/model/content/attribut-traits';
import { MinMax } from '../../../../../slormancer/model/minmax';
import { SlormancerAttributeService } from '../../../../../slormancer/services/content/slormancer-attribute.service';

/*

    attribute: Attribute;
    rank: number;
    bonusRank: number;
    traits: Array<Trait>;

    recapLabel: string;
    attributeName: string;
    title: string;
    icon: string;
    summary: string;

    template: string;
*/

@Component({
  selector: 'app-attribute-line',
  templateUrl: './attribute-line.component.html',
  styleUrls: ['./attribute-line.component.scss']
})
export class AttributeLineComponent implements OnInit {

    public highlightRange: MinMax = { min: -1, max: -1 };

    @Input()
    public attribute: AttributeTraits | null = null;

    constructor(private slormancerAttributeService: SlormancerAttributeService,
                private plannerService: PlannerService) { }

    public ngOnInit() {
    }

    public nodeEnter(index: number) {
        console.log('nodeEnter ' + index);
        if (this.attribute !== null) {
            this.highlightRange = index < this.attribute.rank ? { min: index, max: this.attribute.rank } : { min: this.attribute.rank, max: index };
        }
    }

    public nodeLeave(index: number) {
        console.log('nodeLeave ' + index);
        this.highlightRange = { min: -1, max: -1 };
    }

    public nodeClick(index: number) {
        if (this.attribute !== null) {
            this.attribute.rank = index + 1;
            this.slormancerAttributeService.updateAttributeTraits(this.attribute);
            this.plannerService.updateCurrentCharacter();
        }
    }

    public isHighlight(index: number): boolean {
        return index >= this.highlightRange.min && index <= this.highlightRange.max
    }
}
