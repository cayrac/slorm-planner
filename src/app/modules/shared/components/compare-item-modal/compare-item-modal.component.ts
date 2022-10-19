import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    Character,
    CharacterConfig,
    CharacterStatDifference,
    EquipableItem,
    GearSlot,
    SlormancerCharacterBuilderService,
    SlormancerCharacterComparatorService,
    SlormancerCharacterUpdaterService,
    SlormancerItemService,
} from 'slormancer-api';

export interface CompareItemModalData {
    character: Character;
    config: CharacterConfig;
    slot: GearSlot;   
    left: EquipableItem;   
    right: EquipableItem;   
}

@Component({
    selector: 'app-compare-item-modal',
    templateUrl: './compare-item-modal.component.html',
    styleUrls: ['./compare-item-modal.component.scss']
})
export class CompareItemModalComponent {

    public readonly left: EquipableItem;

    public readonly right: EquipableItem;

    public readonly differences: Array<CharacterStatDifference>;

    constructor(@Inject(MAT_DIALOG_DATA) data: CompareItemModalData,
                private slormancerItemService: SlormancerItemService,
                private slormancerCharacterBuilderService: SlormancerCharacterBuilderService,
                private slormancerCharacterUpdaterService: SlormancerCharacterUpdaterService,
                private slormancerCharacterComparatorService: SlormancerCharacterComparatorService,
                ) {
        const leftCharacter = this.slormancerCharacterBuilderService.getCharacterClone(data.character);
        const rightCharacter = this.slormancerCharacterBuilderService.getCharacterClone(data.character);

        leftCharacter.gear[data.slot] = this.slormancerItemService.getEquipableItemClone(data.left);
        rightCharacter.gear[data.slot] = this.slormancerItemService.getEquipableItemClone(data.right);

        this.slormancerCharacterUpdaterService.updateCharacter(leftCharacter, data.config);
        this.slormancerCharacterUpdaterService.updateCharacter(rightCharacter, data.config);
        
        this.left = data.left;
        this.right = data.right;
        this.differences = this.slormancerCharacterComparatorService.compareCharacters(leftCharacter, rightCharacter);
    }
}