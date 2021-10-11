import { Component } from '@angular/core';

import { HeroClass } from '../../../slormancer/model/content/enum/hero-class';

export interface DeleteLayerModalData {
    name: string;   
}

@Component({
    selector: 'app-content-blocked-modal',
    templateUrl: './content-blocked-modal.component.html',
    styleUrls: ['./content-blocked-modal.component.scss']
})
export class ContentBlockedModalComponent {

    public readonly HUNTRESS = HeroClass.Huntress;

    constructor() { }
}