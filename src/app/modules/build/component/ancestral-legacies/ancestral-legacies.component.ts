import { Component, OnInit } from '@angular/core';

import { Character } from '../../../slormancer/model/character';

@Component({
  selector: 'app-ancestral-legacies',
  templateUrl: './ancestral-legacies.component.html',
  styleUrls: ['./ancestral-legacies.component.scss']
})
export class AncestralLegaciesComponent implements OnInit {

    public character: Character | null = null;

    constructor() {
    }

    public ngOnInit() {
    }

}
