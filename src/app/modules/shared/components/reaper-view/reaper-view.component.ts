import { AfterViewChecked, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { adaptTooltip, Reaper } from '@slorm-api';

@Component({
  selector: 'app-reaper-view',
  templateUrl: './reaper-view.component.html',
  styleUrls: ['./reaper-view.component.scss']
})
export class ReaperViewComponent implements AfterViewChecked {
    
    @Input()
    public readonly reaper: Reaper | null = null;

    @Input()
    public readonly maxHeight: string | null = null;

    @Input()
    public readonly tooltip: boolean = false;

    @ViewChild('content')
    private content: ElementRef<HTMLElement> | null = null; 

    @ViewChild('main')
    private main: ElementRef<HTMLElement> | null = null;

    constructor() { }

    public ngAfterViewChecked() {
        if (this.main) {
            adaptTooltip(this.main.nativeElement);
        }
    }

    public scroll(event: WheelEvent) {
        if (this.content) {
            this.content.nativeElement.scrollTop += event.deltaY;
        }
    }
}
