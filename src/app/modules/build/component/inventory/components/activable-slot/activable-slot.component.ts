import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { PlannerService } from '../../../../../shared/services/planner.service';
import { Character } from '../../../../../slormancer/model/character';
import { Activable } from '../../../../../slormancer/model/content/activable';
import { AncestralLegacy } from '../../../../../slormancer/model/content/ancestral-legacy';
import { itemMoveService } from '../../services/item-move.service';


@Component({
  selector: 'app-activable-slot',
  templateUrl: './activable-slot.component.html',
  styleUrls: ['./activable-slot.component.scss']
})
export class ActivableSlotComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public readonly activable: Activable | AncestralLegacy | null = null;

    @Output()
    public readonly changed = new EventEmitter<Activable | AncestralLegacy | null>();

    @ViewChild(MatMenuTrigger, { static: true })
    private menu: MatMenuTrigger | null = null; 

    private character: Character | null = null;

    public showOverlay = false;

    @HostListener('mouseenter')
    public onOver() {
        this.showOverlay = true;
    }

    @HostListener('mouseleave')
    public onLeave() {
        this.showOverlay = false;
    }

    @HostListener('contextmenu')
    public onMouseContextMenu() {
        this.itemMoveService.releaseHoldItem();
        if (this.menu !== null) {
            this.menu.openMenu();
        }
        return false;
    }
    
    constructor(private plannerService: PlannerService,
                private itemMoveService: itemMoveService) {
        super();
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);}

    public ngOnInit() { }

    public isAncestralLegacy(activable: Activable | AncestralLegacy): activable is AncestralLegacy {
        return (<AncestralLegacy>activable).element !== undefined;
    } 

    public isActivable(activable: Activable | AncestralLegacy): activable is Activable {
        return (<AncestralLegacy>activable).element === undefined;
    }

    public getAvailableActivables(): Array<Activable | AncestralLegacy> {
        return this.plannerService.getAvailableActivables();
    }

    public isSelectedActivable(activable: Activable | AncestralLegacy): boolean {
        return this.character !== null && (
                this.character.activable1 === activable
             || this.character.activable2 === activable
             || this.character.activable3 === activable
             || this.character.activable4 === activable); 
    }

    public updateActivable(activable: Activable | AncestralLegacy | null) {
        if (this.activable !== activable) {
            this.changed.emit(activable);
        }
    }
}
