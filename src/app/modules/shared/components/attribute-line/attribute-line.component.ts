import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AttributeTraits, MinMax, SlormancerAttributeService, Trait } from '@slorm-api';

import { BuildStorageService } from '../../services/build-storage.service';

@Component({
  selector: 'app-attribute-line',
  templateUrl: './attribute-line.component.html',
  styleUrls: ['./attribute-line.component.scss']
})
export class AttributeLineComponent implements OnInit, OnChanges {

    public readonly MAX_RANK = 75;

    @Input()
    public readonly attribute: AttributeTraits | null = null;

    @Input()
    public readonly remainingPoints: number = 0;

    @Input()
    public readonly iconShift: boolean = false;

    @Input()
    public readonly short: boolean = false;

    @Input()
    public readonly readonly: boolean = false;

    public unlockedRange: MinMax = { min: 0, max: 0 };

    public highlightRange: MinMax = { min: 0, max: 0 };

    public bonusRange: MinMax = { min: 0, max: 0 };

    public cappedCursor: number = 0;

    public showSummary = false;

    public cursorIndex: number | null = null;
    
    constructor(private slormancerAttributeService: SlormancerAttributeService,
                private buildStorageService: BuildStorageService) { }

    public ngOnInit() {
        this.updateCursor();
    }

    public ngOnChanges() {
        this.updateCursor();
    }

    private updateCursor() {
        if (this.attribute !== null) {
            if (this.cursorIndex === null) {
                this.cappedCursor = this.attribute.baseRank;
                this.highlightRange = { min: 0, max: 0 };
                this.unlockedRange = { min: 0, max: this.attribute.baseRank };
                this.bonusRange = { min: this.attribute.baseRank, max: this.attribute.baseRank + this.attribute.bonusRank };
            } else {
                this.cappedCursor = Math.min(this.attribute.baseRank + this.remainingPoints, this.cursorIndex + 1);
                this.bonusRange = { min: Math.max(this.cappedCursor, this.attribute.baseRank), max: this.attribute.baseRank + this.attribute.bonusRank };
                if (this.cursorIndex < this.attribute.baseRank) {
                    this.highlightRange = { min: this.cursorIndex + 1, max: Math.max(this.attribute.baseRank, this.cursorIndex + 1) };
                } else {
                    this.highlightRange = { min: this.attribute.baseRank, max: this.cappedCursor };
                }
            }
        }
    }

    public nodeEnter(index: number) {
        this.cursorIndex = index;
        this.updateCursor();
    }

    public nodeLeave() {
        this.cursorIndex = null;
        this.updateCursor();
    }

    private setRank(rank: number) {
        if (this.attribute !== null && this.attribute.baseRank !== rank && !this.readonly) {
            this.attribute.baseRank = rank;
            this.slormancerAttributeService.updateAttributeTraits(this.attribute);
            this.buildStorageService.saveLayer();
            this.updateCursor();
        }
    }

    public nodeClick(index: number) {
        if (this.attribute !== null) {
            this.setRank(this.cappedCursor);
            console.log(this.attribute.traits[index]);
        }
    }

    public isUnlocked(index: number): boolean {
        return index >= this.unlockedRange.min && index < this.unlockedRange.max;
    }

    public isHighlight(index: number): boolean {
        return index >= this.highlightRange.min && index < this.highlightRange.max
    }

    public isBonus(index: number): boolean {
        return index >= this.bonusRange.min && index < this.bonusRange.max
    }

    public addPoint(event: MouseEvent) {
        if (this.attribute !== null && this.remainingPoints > 0) {
            let maxPoints = Math.min(this.remainingPoints, (this.MAX_RANK - this.attribute.baseRank))
            this.setRank(this.attribute.baseRank + Math.min(maxPoints, event.shiftKey ? 10 : 1));
        }
    }

    public removePoint(event: MouseEvent) {
        if (this.attribute !== null && this.attribute.baseRank > 0) {
            this.setRank(this.attribute.baseRank - Math.min(this.attribute.baseRank, event.shiftKey ? 10 : 1));
        }
    }

    public trackByTrait(index: number, trait: Trait): number {
        return index;
    }
}
