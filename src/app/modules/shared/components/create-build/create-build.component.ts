import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-create-build',
    templateUrl: './create-build.component.html',
    styleUrls: ['./create-build.component.scss']
})
export class CreateBuildComponent implements OnInit {

    @Output()
    public readonly created = new EventEmitter();

    public more: boolean = false;

    public buildName: string = 'My build';

    constructor() {}

    public ngOnInit() {
        this.more = false;
    }
    
    public passCreatedEvent() {
        this.created.emit();
    }
}
