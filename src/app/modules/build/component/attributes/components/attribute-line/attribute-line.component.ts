import { Component, Input, OnInit } from '@angular/core';

import { PlannerService } from '../../../../../shared/services/planner.service';
import { AttributeTraits } from '../../../../../slormancer/model/content/attribut-traits';
import { MinMax } from '../../../../../slormancer/model/minmax';
import { SlormancerAttributeService } from '../../../../../slormancer/services/content/slormancer-attribute.service';

@Component({
  selector: 'app-attribute-line',
  templateUrl: './attribute-line.component.html',
  styleUrls: ['./attribute-line.component.scss']
})
export class AttributeLineComponent implements OnInit {

    @Input()
    public readonly attribute: AttributeTraits | null = null;

    @Input()
    public readonly remainingPoints: number = 0;

    @Input()
    public readonly iconShift: boolean = false;

    public highlightRange: MinMax = { min: 0, max: 0 };

    public showSummary = false;
    

    constructor(private slormancerAttributeService: SlormancerAttributeService,
                private plannerService: PlannerService) { }

    public ngOnInit() {
    }

    public nodeEnter(index: number) {
        if (this.attribute !== null) {
            if (index < this.attribute.rank) {
                this.highlightRange = { min: index + 1, max: this.attribute.rank };
            } else {
                this.highlightRange = { min: this.attribute.rank, max: Math.min(this.attribute.rank + this.remainingPoints, index + 1) };
            }
        }
    }

    public nodeLeave() {
        this.highlightRange = { min: -1, max: -1 };
    }

    private setRank(rank: number) {
        if (this.attribute !== null) {
            this.attribute.rank = rank;
            this.slormancerAttributeService.updateAttributeTraits(this.attribute);
            this.plannerService.updateCurrentCharacter();
            this.highlightRange = { min: -1, max: -1 };
        }
    }

    public nodeClick() {
        if (this.attribute !== null && this.highlightRange.min !== -1 && this.highlightRange.max !== -1) {
            this.setRank(this.attribute.rank === this.highlightRange.max ? this.highlightRange.min : this.highlightRange.max);
        }
    }

    public isHighlight(index: number): boolean {
        return index >= this.highlightRange.min && index < this.highlightRange.max
    }

    public addPoint(event: MouseEvent) {
        if (this.attribute !== null && this.remainingPoints > 0) {
            this.setRank(this.attribute.rank + Math.min(this.remainingPoints, event.shiftKey ? 10 : 1));
        }
    }

    public removePoint(event: MouseEvent) {
        if (this.attribute !== null && this.attribute.rank > 0) {
            this.setRank(this.attribute.rank - Math.min(this.attribute.rank, event.shiftKey ? 10 : 1));
        }
    }
}
