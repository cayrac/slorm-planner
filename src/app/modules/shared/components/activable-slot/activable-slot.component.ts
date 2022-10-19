import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Activable, AncestralLegacy, compare, isFirst, isNotNullOrUndefined } from 'slormancer-api';

import { BuildStorageService } from '../../services/build-storage.service';
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
    
    constructor(private buildStorageService: BuildStorageService,
                private itemMoveService: ItemMoveService) {
        super();
    }

    public ngOnInit() { }

    public isAncestralLegacy(activable: Activable | AncestralLegacy): activable is AncestralLegacy {
        return (<AncestralLegacy>activable).element !== undefined;
    } 

    public isActivable(activable: Activable | AncestralLegacy): activable is Activable {
        return (<AncestralLegacy>activable).element === undefined;
    }

    public getAvailableActivables(): Array<Activable | AncestralLegacy> {
        let result: Array<Activable | AncestralLegacy> = [];

        const layer = this.buildStorageService.getLayer();
        if (layer !== null) {
            const legendaryActivables = [
                layer.character.gear.amulet,
                layer.character.gear.belt,
                layer.character.gear.body,
                layer.character.gear.boot,
                layer.character.gear.bracer,
                layer.character.gear.cape,
                layer.character.gear.glove,
                layer.character.gear.helm,
                layer.character.gear.ring_l,
                layer.character.gear.ring_r,
                layer.character.gear.shoulder
                ]
                .map(item => item !== null && item.legendaryEffect !== null ? item.legendaryEffect.activable : null)
                .filter(isNotNullOrUndefined)
                .sort((a, b) => -compare(a.level, b.level))
                .filter((value, index, values) => isFirst(value, index, values, (a, b) => a.id === b.id));
            const reaperActivables = layer.character.reaper === null ? [] : layer.character.reaper.activables;
            const runeActivables = [layer.character.runes.activation, layer.character.runes.effect, layer.character.runes.enhancement]
                .map(rune => rune === null ? null : rune.activable)
                .filter(isNotNullOrUndefined);
            const ancestralLegacies = layer.character.ancestralLegacies.activeAncestralLegacies
                .map(ancestralLegacy => layer.character.ancestralLegacies.ancestralLegacies[ancestralLegacy])
                .filter(isNotNullOrUndefined)
                .filter(ancestralLegacy => ancestralLegacy.isActivable);

            result = [
                ...legendaryActivables,
                ...runeActivables,
                ...reaperActivables,
                ...ancestralLegacies
            ];

        }

        return result;
    }

    public isSelectedActivable(activable: Activable | AncestralLegacy): boolean {
        const layer = this.buildStorageService.getLayer();
        return layer !== null && (
                layer.character.activable1 === activable
             || layer.character.activable2 === activable
             || layer.character.activable3 === activable
             || layer.character.activable4 === activable); 
    }

    public updateActivable(activable: Activable | AncestralLegacy | null) {
        if (this.activable !== activable) {
            this.changed.emit(activable);
        }
    }
}
