import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import {
    ALL_ATTRIBUTES,
    ALL_GEAR_SLOT_VALUES,
    AttributeTraits,
    Character,
    EquipableItem,
    getAllLegendaryEffects,
    isNotNullOrUndefined,
    ReaperSmith,
    Skill,
    SlormancerItemService,
} from '@slorm-api';
import { takeUntil } from 'rxjs/operators';

import { BuildStorageService } from '../../services/build-storage.service';
import { MessageService } from '../../services/message.service';
import { AbstractUnsubscribeComponent } from '../abstract-unsubscribe/abstract-unsubscribe.component';
import { CharacterLevelEditModalComponent } from '../character-level-edit-modal/character-level-edit-modal.component';
import { ItemReinforcementEditModalComponent } from '../item-reinforcement-edit-modal/item-reinforcement-edit-modal.component';
import {
    OptimizeItemsAffixesModalComponent,
    OptimizeItemsAffixesModalData,
} from '../optimize-items-affixes-modal/optimize-items-affixes-modal.component';

@Component({
  selector: 'app-character-settings-menu',
  templateUrl: './character-settings-menu.component.html',
  styleUrls: ['./character-settings-menu.component.scss']
})
export class CharacterSettingsMenuComponent extends AbstractUnsubscribeComponent implements OnInit {

    public character: Character | null = null;

    @ViewChild(MatMenuTrigger, { static: true })
    private menu: MatMenuTrigger | null = null;

    constructor(private buildStorageService: BuildStorageService,
                private dialog: MatDialog,
                private messageService: MessageService,
                private slormancerItemService: SlormancerItemService
                ) {
        super();
    }

    public ngOnInit() {
        this.buildStorageService.layerChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(layer => this.character = layer === null ? null : layer.character);
    }

    public openCharacterSettings(): boolean {
        if (this.menu !== null) {
            this.menu.openMenu();
        }
        return false;
    }

    public editCharacterLevel() {
        if (this.character !== null) {
            this.dialog.open(CharacterLevelEditModalComponent, { data: { level: this.character.level } })
            .afterClosed().subscribe(level => {
                if (level && this.character !== null) {
                    this.character.level = level;
                    this.buildStorageService.saveLayer();
                }
            });
        }
    }

    public getGearItems(): Array<EquipableItem> {
        let result: Array<EquipableItem> = [];

        const character = this.character
        if (character !== null) {   
            result = ALL_GEAR_SLOT_VALUES.map(slot => character.gear[slot]).filter(isNotNullOrUndefined);
        }

        return result;
    }

    public hasItems(): boolean {
        return this.getGearItems().length > 0;
    }

    public canOptimizeReaperEnchantements(character: Character): boolean {
        return character.reaper !== null && character.reaper.smith.id !== ReaperSmith.ReapersmithBrotherhood;
    }
    
    public optimizeReaperEnchantments() {
        if (this.character !== null) {
            const reaperEnchantment = this.slormancerItemService.getReaperEnchantment(this.character.reaper.smith.id, 5);

            this.getGearItems().forEach(item => {
                item.reaperEnchantment = this.slormancerItemService.getReaperEnchantmentClone(reaperEnchantment);
                const defensiveStatMultiplier = this.getDefensiveStatMultiplier();
                this.slormancerItemService.updateEquipableItemModel(item, defensiveStatMultiplier);
                this.slormancerItemService.updateEquipableItemView(item, defensiveStatMultiplier);
            });

            this.buildStorageService.saveLayer();
            
        }
    }

    public getTraits(): Array<AttributeTraits> {
        let result: Array<AttributeTraits> = [];

        const character = this.character;
        if (character !== null) {
            result = ALL_ATTRIBUTES.map(attribute => character.attributes.allocated[attribute]);
        }

        return result;
    }
    
    public optimizeAttributeEnchantments(traits: AttributeTraits) {
        if (this.character !== null && this.character.reaper !== null) {
            const attributeEnchantment = this.slormancerItemService.getAttributeEnchantment(traits.attribute, 3);

            this.getGearItems().forEach(item => {
                item.attributeEnchantment = this.slormancerItemService.getAttributeEnchantmentClone(attributeEnchantment);
                const defensiveStatMultiplier = this.getDefensiveStatMultiplier();
                this.slormancerItemService.updateEquipableItemModel(item, defensiveStatMultiplier);
                this.slormancerItemService.updateEquipableItemView(item, defensiveStatMultiplier);
            });

            this.buildStorageService.saveLayer();
            
        }
    }

    public getSkills(): Array<Skill> {
        let result: Array<Skill> = [];

        const character = this.character;
        if (character !== null) {
            result = character.skills.map(skillsAndPassives => skillsAndPassives.skill);
        }

        return result;
    }
    
    public optimizeSkillEnchantments(skill: Skill) {
        if (this.character !== null) {
            const skillEnchantment = this.slormancerItemService.getSkillEnchantment(skill.id, 2);

            this.getGearItems().forEach(item => {
                item.skillEnchantment = this.slormancerItemService.getSkillEnchantmentClone(skillEnchantment);
                const defensiveStatMultiplier = this.getDefensiveStatMultiplier();
                this.slormancerItemService.updateEquipableItemModel(item, defensiveStatMultiplier);
                this.slormancerItemService.updateEquipableItemView(item, defensiveStatMultiplier);
            });
            
            this.buildStorageService.saveLayer();
            
        }
    }

    public maximizeItemsLevel() {
        if (this.character !== null) {

            const level = this.character.level;
            this.getGearItems().forEach(item => {
                item.level = level;
                const defensiveStatMultiplier = this.getDefensiveStatMultiplier();
                this.slormancerItemService.updateEquipableItemModel(item, defensiveStatMultiplier);
                this.slormancerItemService.updateEquipableItemView(item, defensiveStatMultiplier);
            });
            
            this.buildStorageService.saveLayer();
        }
    }

    public changeReinforcementLevel() {
        if (this.character !== null) {

            const maxReinforcement = Math.max(...this.getGearItems().map(item => item.reinforcement));
            this.dialog.open(ItemReinforcementEditModalComponent, { data: { reinforcement: maxReinforcement } })
            .afterClosed().subscribe(reinforcement => {
                if (typeof reinforcement === 'number') {
                    this.getGearItems().forEach(item => {
                        item.reinforcement = reinforcement;
                        const defensiveStatMultiplier = this.getDefensiveStatMultiplier();
                        this.slormancerItemService.updateEquipableItemModel(item, defensiveStatMultiplier);
                        this.slormancerItemService.updateEquipableItemView(item, defensiveStatMultiplier);
                    });
            
                    this.buildStorageService.saveLayer();
                }
            });
        }
    }

    public optimizeItemsAffixes() {
        if (this.character !== null) {
            const data: OptimizeItemsAffixesModalData = { items: this.getGearItems() };
            this.dialog.open(OptimizeItemsAffixesModalComponent, { data })
            .afterClosed().subscribe(changed => {
                if (changed) {
                    this.buildStorageService.saveLayer();
                    this.messageService.message('All equipped items have been updated');
                }
            });
        }
    }

    private getDefensiveStatMultiplier(): number {
        return this.character === null
            ? 0
            : this.slormancerItemService.getDefensiveStatMultiplier(getAllLegendaryEffects(this.character.gear))
    }
}
    
