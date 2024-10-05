import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ItemMoveService } from '@shared/services/item-move.service';
import { Character, EquipableItem, EquipableItemBase, GearSlot, Ultimatum } from '@slorm-api';


@Component({
  selector: 'app-character-equipment',
  templateUrl: './character-equipment.component.html',
  styleUrls: ['./character-equipment.component.scss']
})
export class CharacterEquipmentComponent implements OnInit, OnDestroy {

    public readonly gearSlot = GearSlot;

    public bases = EquipableItemBase;

    @Input()
    public character: Character | null = null;

    @Input()
    public readonly: boolean = false;

    @Output()
    public changed = new EventEmitter<Character>();

    constructor(private itemMoveService: ItemMoveService) { 
    }

    public ngOnInit() {
        const equipCallback = (itemReplaced: boolean, item: EquipableItem | null, gearSlot: GearSlot) => this.updateItemCallback(itemReplaced, item, gearSlot);
        this.itemMoveService.setEquipCallback(equipCallback);
    }

    public ngOnDestroy() {
        this.itemMoveService.setEquipCallback(null);
    }

    private updateItemCallback(itemReplaced: boolean, item: EquipableItem | null, gearSlot: GearSlot | null) {
        if (item !== null && this.character !== null) {
            if (gearSlot !== null) {
                this.updateItem(gearSlot, item);
            }
        }
    }
        
    public updateItem(slot: GearSlot, item: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear[slot] = item;
            this.changed.emit(this.character);
        }
    }

    public updateUltimatum(ultimatum: Ultimatum | null) {
        if (this.character !== null) {
            this.character.ultimatum = ultimatum;
            this.changed.emit(this.character);
        }
    }
}
