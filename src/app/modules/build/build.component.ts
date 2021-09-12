import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { AbstractUnsubscribeComponent } from '../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../shared/services/planner.service';
import { HeroClass } from '../slormancer/model/content/enum/hero-class';
import { itemMoveService } from './component/inventory/services/item-move.service';

@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent extends AbstractUnsubscribeComponent {

    public readonly ROUTES = [
        { name: 'Inventory', route: 'inventory'},
        { name: 'Skills', route: 'skills'},
        { name: 'Ancestral legacy', route: 'ancestral-legacy'},
    ];

    public isDragging: boolean = false;

    @ViewChild('dragImage')
    private dragImage: ElementRef<HTMLImageElement> | null = null;

    @ViewChild('dragBackground')
    private dragBackground: ElementRef<HTMLImageElement> | null = null;

    @HostListener('mousemove', ['$event'])
    public onMouseMove(event: MouseEvent) {
        this.itemMoveService.startDragging();
        if (this.isDragging && this.itemMoveService.getHoldItem() !== null && this.dragImage && this.dragBackground) {
            const top = (event.clientY - this.dragImage.nativeElement.height / 2) + 'px';
            const left = (event.clientX - this.dragImage.nativeElement.width / 2) + 'px';

            this.dragImage.nativeElement.style.top = top;
            this.dragImage.nativeElement.style.left = left;
            this.dragBackground.nativeElement.style.top = top;
            this.dragBackground.nativeElement.style.left = left;
        }
    }
    @HostListener('mouseup')
    public onMouseUp() {
        this.itemMoveService.releaseHoldItem();
    }

    @HostListener('contextmenu')
    public onMouseContextMenu() {
        this.itemMoveService.releaseHoldItem();
    }

    constructor(private plannerService: PlannerService,
                private itemMoveService: itemMoveService) {
        super();
        this.itemMoveService.draggingItem
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(dragging => {
                this.isDragging = dragging;
                const item = this.itemMoveService.getHoldItem();
                if (item !== null && this.dragImage && this.dragBackground) {
                    this.dragImage.nativeElement.src = item.icon;
                    this.dragBackground.nativeElement.src = item.itemIconBackground;
                }
            });
    }
    
    public uploadSave(file: Event) {
        if (file.target !== null) {
            const files = (<HTMLInputElement>file.target).files;
            if (files !== null && files[0]) {
                this.upload(files[0]);
            }
        }
    }

    public upload(file: File) {
        var reader: FileReader | null = new FileReader();

        reader.onerror = () => {
            reader = null;
            alert('Failed to upload file');
        };
        reader.onloadend = () => {
            if (reader !== null && reader.result !== null) {
                this.plannerService.loadSave(reader.result.toString(), HeroClass.Mage);
                reader = null;
            }
        };

        reader.readAsText(file);
    }
}
