import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import {
    ALL_GEAR_SLOT_VALUES,
    Character,
    EquipableItem,
    EquipableItemBase,
    GearSlot,
    getAllLegendaryEffects,
    SlormancerCharacterBuilderService,
    SlormancerItemService,
} from '@slorm-api';
import { takeUntil } from 'rxjs/operators';

import { BuildStorageService } from '../../services/build-storage.service';
import { DragCallback, ItemMoveService } from '../../services/item-move.service';
import { SearchService } from '../../services/search.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { CompareItemModalComponent, CompareItemModalData } from '../compare-item-modal/compare-item-modal.component';
import { ItemBaseChoiceModalComponent } from '../item-base-choice-modal/item-base-choice-modal.component';
import { ItemEditModalComponent, ItemEditModalData } from '../item-edit-modal/item-edit-modal.component';
import { RemoveConfirmModalComponent } from '../remove-confirm-modal/remove-confirm-modal.component';
import { ViewData, ViewModalComponent } from '../view-modal/view-modalcomponent';

@Component({
  selector: 'app-item-slot',
  templateUrl: './item-slot.component.html',
  styleUrls: ['./item-slot.component.scss']
})
export class ItemSlotComponent extends AbstractUnsubscribeComponent implements OnInit, OnChanges {

    public readonly GearSlot = GearSlot;

    @Input()
    public readonly character: Character | null = null;

    @Input()
    public readonly item: EquipableItem | null = null;

    @Input()
    public readonly base: EquipableItemBase | null = null;

    @Input()
    public readonly readonly: boolean = false;

    @Output()
    public readonly changed = new EventEmitter<EquipableItem | null>();
    
    @ViewChild(MatMenuTrigger)
    private menu: MatMenuTrigger | null | undefined = null; 
            
    public isDragging: boolean = false;

    public isMouseOver: boolean = false;

    public isItemCompatible: boolean = false;

    public isDraggedItem: boolean = false;

    public hiddenBySearch: boolean = false;

    public comparableGearSlots: Array<GearSlot> = []

    @HostListener('mouseenter')
    public onMouseOver() {
        this.isMouseOver = true;
    }

    @HostListener('mouseleave')
    public onMouseLeave() {
        this.isMouseOver = false;
    }

    @HostListener('mousedown', ['$event'])
    public onMouseDown(event: MouseEvent) {
        if (event.button === 0 && !this.readonly) {
            this.take();
        }
        return false;
    }

    @HostListener('mouseup', ['$event'])
    public onMouseUp(event: MouseEvent) {
        if (event.button === 0) {
            if (this.isDragging &&  !this.readonly) {
                this.itemMoveService.swap(this.item, this.base, ((success, item) => this.moveCallback(success, item)) as DragCallback);
            } else if (event.ctrlKey && this.item !== null) {
                const data: ViewData = { entity: { item: this.item } };
                this.dialog.open(ViewModalComponent, { data });
            } else if (!this.readonly) {
                this.edit();
            }
        }
        return false;
    }

    @HostListener('contextmenu')
    public onMouseContextMenu() {
        this.itemMoveService.releaseHoldItem();
        if (this.menu && !this.readonly) {
            this.updateComparableSlots();
            this.menu.openMenu();
        }
        return false;
    }
    
    constructor(private dialog: MatDialog,
                private itemMoveService: ItemMoveService,
                private searchService: SearchService,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private slormancerItemService: SlormancerItemService,
                private buildStorageService: BuildStorageService) {
        super();
        this.itemMoveService.draggingItem
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(holding => {
                this.isDragging = holding;
                this.isDraggedItem = this.itemMoveService.isHoldItem(this.item);
                this.isItemCompatible = this.itemMoveService.isDragItemCompatible(this.item, this.base);
            });

        this.searchService.searchChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.updateSearch());
    }

    public ngOnInit() { }

    public ngOnChanges() {
        this.updateSearch();
    }

    public isMenuOpen(): boolean {
        return this.menu !== null && this.menu !== undefined && this.menu.menuOpen;
    }

    private updateComparableSlots() {
        this.comparableGearSlots = [];
        const character = this.character;
        const item = this.item;
        if (character !== null && item !== null && this.base === null) {
            this.comparableGearSlots = ALL_GEAR_SLOT_VALUES.filter(slot => {
                const characterItem = character.gear[slot];
                return characterItem !== null && characterItem.base === item.base;
            });
        }
    }

    private updateSearch() {
        this.hiddenBySearch = this.item !== null && this.searchService.hasSearch() && !this.searchService.itemMatchSearch(this.item)
    }

    private moveCallback(itemReplaced: boolean, item: EquipableItem | null) {
        if (itemReplaced) {
            this.changed.emit(item);
        }
        this.isDraggedItem = false;
        this.isItemCompatible = false;
    }

    private getItemEditModalData(character: Character, item: EquipableItem): ItemEditModalData {
        const characterClone = this.slormancerCharacterBuilderService.getCharacterClone(character);
        const itemGearSlot = ALL_GEAR_SLOT_VALUES.find(gear => character.gear[gear] === item);
        const itemFromGear = itemGearSlot ? characterClone.gear[itemGearSlot] : null;

        const itemClone = itemFromGear !== null ? itemFromGear : this.slormancerItemService.getEquipableItemClone(item);

        return { character: characterClone, item: itemClone, maxLevel: characterClone.level };
    }
    
    public edit(item: EquipableItem | null = this.item) {
        const character = this.character;
        if (character !== null) {
            const defensiveStatMultiplier = this.slormancerItemService.getDefensiveStatMultiplier(getAllLegendaryEffects(character.gear));
            if (item === null) {
                if (this.base !== null) {
                    this.edit(this.slormancerItemService.getEmptyEquipableItem(this.base, character.heroClass, character.level, defensiveStatMultiplier));
                } else {
                    this.dialog.open(ItemBaseChoiceModalComponent)
                    .afterClosed().subscribe((base: EquipableItemBase | undefined) => {
                        if (base !== undefined && base !== null) {
                            this.edit(this.slormancerItemService.getEmptyEquipableItem(base, character.heroClass, character.level, defensiveStatMultiplier));
                        }
                    });
                }
            } else {
                const data: ItemEditModalData = this.getItemEditModalData(character, item);
                this.dialog.open(ItemEditModalComponent, { data, width: '80vw', maxWidth: '1000px' })
                .afterClosed().subscribe((data: EquipableItem | null | undefined) => {
                    if (data !== undefined) {
                        this.changed.emit(data);
                    }
                });
            }
        }
    }

    public take() {
        if (this.item !== null) {
            this.itemMoveService.hold(this.item, this.base, (success, item) => this.moveCallback(success, item));
        }
    }
    
    public copy() {
        if (this.item !== null) {
            const itemCopy = this.slormancerItemService.getEquipableItemClone(this.item);
            this.itemMoveService.hold(itemCopy, itemCopy.base);
        }
    }

    public remove() {
        this.dialog.open(RemoveConfirmModalComponent)
        .afterClosed().subscribe((choice) => {
            if (choice === true) {
                this.changed.emit(null);
            }
        });
    }

    public equip() {
        if (this.item !== null) {
            this.itemMoveService.equip(this.item, (success, item) => this.moveCallback(success, item));
        }
    }

    public unequip() {
        if (this.item !== null) {
            this.itemMoveService.moveToStash(this.item, (success, item) => this.moveCallback(success, item));
        }
    }

    public compareWithSlot(slot: GearSlot) {
        if (this.item !== null && this.character !== null) {
            const leftItem = this.character.gear[slot];
            const build = this.buildStorageService.getBuild();
            
            if (leftItem !== null && build !== null && build.configuration !== null) {
                const data: CompareItemModalData = {
                    character: this.character,
                    slot,
                    config: build.configuration,
                    left: leftItem,
                    right: this.item,
                }
                this.dialog.open(CompareItemModalComponent, { data })
            }
        }
    }
}
