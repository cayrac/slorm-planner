import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Reaper } from '@slorm-api';

@Component({
  selector: 'app-reaper-view',
  templateUrl: './reaper-view.component.html',
  styleUrls: ['./reaper-view.component.scss']
})
export class ReaperViewComponent {
    
    @Input()
    public readonly reaper: Reaper | null = null;

    @Input()
    public readonly maxHeight: string | null = null;

    @Input()
    public readonly tooltip: boolean = false;

    @ViewChild('content')
    private content: ElementRef<HTMLElement> | null = null; 

    constructor() { }

    public scroll(event: WheelEvent) {
        if (this.content) {
            this.content.nativeElement.scrollTop += event.deltaY;
        }
    }
}
