import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DeleteLayerModalData {
    name: string;   
}

@Component({
    selector: 'app-delete-layer-modal',
    templateUrl: './delete-layer-modal.component.html',
    styleUrls: ['./delete-layer-modal.component.scss']
})
export class DeleteLayerModalComponent {

    public name: string;

    constructor(@Inject(MAT_DIALOG_DATA) data: DeleteLayerModalData) {
        this.name = data.name;
    }
}