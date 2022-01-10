import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-create-build-modal',
    templateUrl: './create-build-modal.component.html',
    styleUrls: ['./create-build-modal.component.scss']
})
export class CreateBuildModalComponent {

    constructor(private dialog: MatDialogRef<CreateBuildModalComponent>) {}
    
    public created() {
        console.log('CreateBuildModalComponent created')
        this.dialog.close();
    }
}
