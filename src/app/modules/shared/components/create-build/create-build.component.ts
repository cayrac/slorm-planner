import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-create-build',
    templateUrl: './create-build.component.html',
    styleUrls: ['./create-build.component.scss']
})
export class CreateBuildComponent {

    @Output()
    public readonly created = new EventEmitter();

    public buildName: string = 'My build';

    constructor() {}
    
    public passCreatedEvent() {
        this.created.emit();
    }
}
