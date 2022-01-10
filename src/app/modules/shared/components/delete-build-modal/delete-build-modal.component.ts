import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DeleteBuildModalData {
  name: string;   
}

@Component({
  selector: 'app-delete-build-modal',
  templateUrl: './delete-build-modal.component.html',
  styleUrls: ['./delete-build-modal.component.scss']
})
export class DeleteBuildModalComponent {     
  
  public name: string;

  constructor(@Inject(MAT_DIALOG_DATA) data: DeleteBuildModalData) {
      this.name = data.name;
  }
}
