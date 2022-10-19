import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Character, EquipableItem, EquipableItemBase, GearSlot, Ultimatum } from 'slormancer-api';


@Component({
  selector: 'app-character-equipment',
  templateUrl: './character-equipment.component.html',
  styleUrls: ['./character-equipment.component.scss']
})
export class CharacterEquipmentComponent {

    public readonly gearSlot = GearSlot;

    public bases = EquipableItemBase;

    @Input()
    public character: Character | null = null;

    @Input()
    public readonly: boolean = false;

    @Output()
    public changed = new EventEmitter<Character>();

    constructor() {
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
