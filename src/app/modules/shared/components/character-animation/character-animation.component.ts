import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { HeroClass } from '@slormancer/model/content/enum/hero-class';


@Component({
  selector: 'app-character-animation',
  templateUrl: './character-animation.component.html',
  styleUrls: ['./character-animation.component.scss']
})
export class CharacterAnimationComponent implements OnInit {

    @Input()
    public readonly heroClass: HeroClass | null = null;

    @Input()
    public readonly suffix: string = '';

    public flipAnimation: boolean = false;
    
    
    @ViewChild('animation')
    private animation: ElementRef<HTMLElement> | null = null;

    @HostListener('window:mousemove', ['$event'])
    public mouseMoved(event: MouseEvent) {
        if (this.animation !== null) {
            const bounding = this.animation.nativeElement.getBoundingClientRect();
            const center = bounding.left + this.animation.nativeElement.clientWidth / 2;
            const flip = center < event.clientX;

            if (this.flipAnimation !== flip) {
                this.flipAnimation = flip;
            }
        }
    }
    
    constructor() {}

    public ngOnInit() { }
    
}
