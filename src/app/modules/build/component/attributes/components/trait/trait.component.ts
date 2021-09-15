import { Component, Input, OnInit } from '@angular/core';

import { TraitLevel } from '../../../../../slormancer/model/content/enum/trait-level';
import { Trait } from '../../../../../slormancer/model/content/trait';

/*
export interface Trait {
    attribute: Attribute;
    requiredRank: number;
    traitLevel: TraitLevel;
    rank: number;
    unlocked: boolean;

    attributeName: string;
    cumulativeStats: string | null;
    description: string | null;
    rankLabel: string;
    traitLevelLabel: string;
    unlockLabel: string | null;
    
    template: string | null;
    values: Array<AbstractEffectValue>;
    cumulativeValues: Array<EffectValueVariable>;
}

    Minor = 'trait_minor',
    Major = 'trait_major',
    Greater = 'trait_greater',

*/

@Component({
  selector: 'app-trait',
  templateUrl: './trait.component.html',
  styleUrls: ['./trait.component.scss']
})
export class TraitComponent implements OnInit {

    @Input()
    public trait: Trait | null = null;

    @Input()
    public first: boolean = false;

    @Input()
    public last: boolean = false;

    @Input()
    public highlight: boolean = false;

    constructor() { }

    public ngOnInit() {
    }

    public isMinor(trait: Trait): boolean {
        return trait.traitLevel === TraitLevel.Minor;
    }

    public isMajor(trait: Trait): boolean {
        return trait.traitLevel === TraitLevel.Major;
    }

    public isGreater(trait: Trait): boolean {
        return trait.traitLevel === TraitLevel.Greater;
    }
}
