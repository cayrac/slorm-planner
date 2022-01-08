import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { takeUntil } from 'rxjs/operators';

import { Character } from '../../../slormancer/model/character';
import { Activable } from '../../../slormancer/model/content/activable';
import { AncestralLegacy } from '../../../slormancer/model/content/ancestral-legacy';
import { compare, isFirst, isNotNullOrUndefined } from '../../../slormancer/util/utils';
import { BuildService } from '../../services/build.service';
import { ItemMoveService } from '../../services/item-move.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';


@Component({
  selector: 'app-activable-slot',
  templateUrl: './activable-slot.component.html',
  styleUrls: ['./activable-slot.component.scss']
})
export class ActivableSlotComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public readonly activable: Activable | AncestralLegacy | null = null;

    @Input()
    public readonly readonly: boolean = false;

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
        if (this.menu !== null && !this.readonly) {
            this.menu.openMenu();
        }
        return false;
    }

    @HostListener('click')
    public onMouseClick() {
        this.itemMoveService.releaseHoldItem();
        if (this.menu !== null && !this.readonly) {
            this.menu.openMenu();
        }
        return false;
    }
    
    constructor(private plannerService: BuildService,
                private itemMoveService: ItemMoveService) {
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
        let result: Array<Activable | AncestralLegacy> = [];

        const character = this.character;
        if (character !== null) {
            const legendaryActivables = [
                character.gear.amulet,
                character.gear.belt,
                character.gear.body,
                character.gear.boot,
                character.gear.bracer,
                character.gear.cape,
                character.gear.glove,
                character.gear.helm,
                character.gear.ring_l,
                character.gear.ring_r,
                character.gear.shoulder
                ]
                .map(item => item !== null && item.legendaryEffect !== null ? item.legendaryEffect.activable : null)
                .filter(isNotNullOrUndefined)
                .sort((a, b) => -compare(a.level, b.level))
                .filter((value, index, values) => isFirst(value, index, values, (a, b) => a.id === b.id));
            const reaperActivables = character.reaper === null ? [] : character.reaper.activables;
            const ancestralLegacies = character.ancestralLegacies.activeAncestralLegacies
                .map(ancestralLegacy => character.ancestralLegacies.ancestralLegacies[ancestralLegacy])
                .filter(isNotNullOrUndefined)
                .filter(ancestralLegacy => ancestralLegacy.isActivable);

            result = [
                ...legendaryActivables,
                ...reaperActivables,
                ...ancestralLegacies
            ];

        }

        return result;
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
