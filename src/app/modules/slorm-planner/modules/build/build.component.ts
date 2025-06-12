import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { CrashReport } from '@shared/model/crash-report';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { ClipboardService } from '@shared/services/clipboard.service';
import { ItemMoveService } from '@shared/services/item-move.service';
import { MessageService } from '@shared/services/message.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent extends AbstractUnsubscribeComponent {

    public readonly ROUTES = [
        { name: 'Inventory', route: 'inventory'},
        { name: 'Skills', route: 'skills'},
        { name: 'Ancestral legacies', route: 'ancestral-legacies'},
        { name: 'Attributes', route: 'attributes'},
        { name: 'Stats', route: 'stats'},
        { name: 'Config', route: 'config'},
        { name: 'Compare', route: 'compare'},
    ];

    public isDragging: boolean = false;

    public error: CrashReport | null = null;

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

    constructor(
        private itemMoveService: ItemMoveService,
        private buildStorageService: BuildStorageService,
        private clipboardService: ClipboardService,
        private messageService: MessageService,
    ) {
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
        
        this.buildStorageService.errorChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(error => this.error = error);
    }

    public copyCrash() {
        if (this.error !== null) {
            ;

            if (this.clipboardService.copyToClipboard(JSON.stringify(this.error))) {
                this.messageService.message('Crash report copied to clipboard');
            } else {
                this.messageService.error('Failed to copy crash report to clipboard');
            }
        }
    }
}
