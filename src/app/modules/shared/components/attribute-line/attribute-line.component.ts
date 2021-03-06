import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AttributeTraits } from '@slormancer/model/content/attribut-traits';
import { MinMax } from '@slormancer/model/minmax';
import { SlormancerAttributeService } from '@slormancer/services/content/slormancer-attribute.service';
import { Trait } from 'src/app/modules/slormancer/model/content/trait';

import { BuildStorageService } from '../../services/build-storage.service';

@Component({
  selector: 'app-attribute-line',
  templateUrl: './attribute-line.component.html',
  styleUrls: ['./attribute-line.component.scss']
})
export class AttributeLineComponent implements OnInit, OnChanges {

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
                this.cappedCursor = this.attribute.rank;
                this.highlightRange = { min: 0, max: 0 };
                this.unlockedRange = { min: 0, max: this.attribute.rank };
                this.bonusRange = { min: this.attribute.rank, max: this.attribute.rank + this.attribute.bonusRank };
            } else {
                this.cappedCursor = Math.min(this.attribute.rank + this.remainingPoints, this.cursorIndex + 1);
                this.bonusRange = { min: Math.max(this.cappedCursor, this.attribute.rank), max: this.attribute.rank + this.attribute.bonusRank };
                if (this.cursorIndex < this.attribute.rank) {
                    this.highlightRange = { min: this.cursorIndex + 1, max: Math.max(this.attribute.rank, this.cursorIndex + 1) };
                } else {
                    this.highlightRange = { min: this.attribute.rank, max: this.cappedCursor };
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
        if (this.attribute !== null && this.attribute.rank !== rank && !this.readonly) {
            this.attribute.rank = rank;
            this.slormancerAttributeService.updateAttributeTraits(this.attribute);
            this.buildStorageService.saveLayer();
            this.updateCursor();
        }
    }

    public nodeClick() {
        if (this.attribute !== null) {
            this.setRank(this.cappedCursor);
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
            this.setRank(this.attribute.rank + Math.min(this.remainingPoints, event.shiftKey ? 10 : 1));
        }
    }

    public removePoint(event: MouseEvent) {
        if (this.attribute !== null && this.attribute.rank > 0) {
            this.setRank(this.attribute.rank - Math.min(this.attribute.rank, event.shiftKey ? 10 : 1));
        }
    }

    public trackByTrait(index: number, trait: Trait): number {
        return index;
    }
}
