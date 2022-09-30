import { Component, OnInit } from '@angular/core';
import { AbstractUnsubscribeComponent } from '@shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { ItemMoveService as ItemMoveService } from '@shared/services/item-move.service';
import { Character } from '@slormancer/model/character';
import { EquipableItem } from '@slormancer/model/content/equipable-item';
import { Reaper } from '@slormancer/model/content/reaper';
import { RunesCombination } from '@slormancer/model/runes-combination';
import { SlormancerRuneService } from '@slormancer/services/content/slormancer-rune.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent extends AbstractUnsubscribeComponent implements OnInit {

    public character: Character | null = null;

    public isDragging: boolean = false;

    public itemGroupBeingDraggedOn: Array<EquipableItem | null> | null = null;

    public itemGroupDragDropPossible: boolean = false;

    constructor(private buildStorageService: BuildStorageService,
                private slormancerRuneService: SlormancerRuneService,
                private itemMoveService: ItemMoveService) {
        super();
        this.itemMoveService.draggingItem
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(dragging => this.isDragging = dragging);
    }

    public ngOnInit() {
        this.buildStorageService.layerChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => this.character = layer === null ? null : layer.character);
    }
    
    public dragInItemsGroup(itemGroup: Array<EquipableItem | null>) {
        if (this.isDragging) {
            this.itemGroupDragDropPossible = itemGroup.find(item => item === null) !== undefined;
            this.itemGroupBeingDraggedOn = itemGroup;
        }
    }

    public dragOutItemsGroup() {
        this.itemGroupBeingDraggedOn = null;
    }

    public dragDrop(itemGroups: Array<EquipableItem | null>) {
        this.itemMoveService.moveDraggedItemToItemGroup(itemGroups);
    }

    public gearChanged() {
        this.buildStorageService.saveLayer();
    }

    public updateReaper(reaper: Reaper) {
        if (this.character !== null) {
            this.character.reaper = reaper;
            if (this.character.runes.effect !== null) {
                this.slormancerRuneService.updateRuneModel(this.character.runes.effect, reaper.id);
                this.slormancerRuneService.updateRuneView(this.character.runes.effect);
            }
            this.buildStorageService.saveLayer();
        }
    }

    public updateRunes(runes: RunesCombination) {
        if (this.character !== null) {
            this.character.runes = runes;
            this.buildStorageService.saveLayer();
        }
    }

    public updateIventoryItem(index: number, item: EquipableItem | null) {
        if (this.character !== null) {
            this.character.inventory[index] = item;
            this.buildStorageService.saveLayer();
        }
    }

    public updateSharedInventoryItem(stashIndex: number, index: number, item: EquipableItem | null) {
        if (this.character !== null) {
            const stash = this.character.sharedInventory[stashIndex];
            if (stash) {
                stash[index] = item;
                this.buildStorageService.saveBuild();
            }
        }
    }
}
