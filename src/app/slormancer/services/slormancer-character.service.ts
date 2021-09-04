import { Injectable } from '@angular/core';

import { HeroClass } from '..//model/content/enum/hero-class';
import { Character, CharacterSkillAndPassives } from '../model/character';
import { Attribute } from '../model/content/enum/attribute';
import { EquipableItem } from '../model/content/equipable-item';
import { Reaper } from '../model/content/reaper';
import { GameItem } from '../model/parser/game/game-item';
import { GameSave } from '../model/parser/game/game-save';
import { isNotNullOrUndefined, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerAttributeService } from './content/slormancer-attribute.service';
import { SlormancerDataService } from './content/slormancer-data.service';
import { SlormancerItemService } from './content/slormancer-item.service';
import { SlormancerReaperService } from './content/slormancer-reaper.service';
import { SlormancerSkillService } from './content/slormancer-skill.service';
import { SlormancerSaveParserService } from './parser/slormancer-save-parser.service';

@Injectable()
export class SlormancerCharacterService {

    constructor(private slormancerSaveParserService: SlormancerSaveParserService,
                private slormancerItemservice: SlormancerItemService,
                private slormancerReaperService: SlormancerReaperService,
                private slormancerDataService: SlormancerDataService,
                private slormancerSkillService: SlormancerSkillService,
                private slormancerAttributeService: SlormancerAttributeService
        ) { }

    private getSkills(save: GameSave, heroClass: HeroClass): Array<CharacterSkillAndPassives> {
        const skill_equip = save.skill_equip[heroClass];
        const skill_rank = save.skill_rank[heroClass];

        return this.slormancerDataService.getGameDataActiveSkillIds(heroClass).map(skillId => {
            const skill = this.slormancerSkillService.getHeroSkill(skillId, heroClass, valueOrDefault(skill_rank[skillId], 0));
            const passives = this.slormancerDataService.getGameDataUpgradeIdsForSkill(skillId, heroClass)
                .map(passiveId => this.slormancerSkillService.getUpgrade(passiveId, heroClass, valueOrDefault(skill_rank[skillId], 0)))
                .filter(isNotNullOrUndefined);

            return skill === null ? null : {
                skill,
                passives,
                selectedPassives: passives.map(passive => passive.id).filter(id => skill_equip[id] === 1)
            }
        }).filter(isNotNullOrUndefined);
    }

    private getItem(item: GameItem | null, heroClass: HeroClass): EquipableItem | null {
        let result: EquipableItem | null = null;

        if (this.slormancerItemservice.isEquipableItem(item)) {
            result = this.slormancerItemservice.getEquipableItem(item, heroClass);
        }

        return result;
    }

    private getEquipedReaper(save: GameSave, heroClass: HeroClass): Reaper | null {
        const reaperCount = this.slormancerDataService.getGameDataReaperCount();

        const weaponEquip = save.weapon_equip[heroClass];
        const primordial = weaponEquip > reaperCount;
        const reaperId = weaponEquip % reaperCount;
        const reaperData = valueOrNull(save.weapon_data[heroClass][reaperId]);

        return reaperData !== null ? this.slormancerReaperService.getReaperFromGameWeapon(reaperData, heroClass, primordial) : null;
    }

    public getCharacterFromSave(saveContent: string, heroClass: HeroClass): Character {
        const save = this.slormancerSaveParserService.parseSaveFile(saveContent);

        const inventory = save.inventory[heroClass];
        const skill_equip = save.skill_equip[heroClass];
        const traits = save.traits[heroClass];
        save.traits

        console.log('save : ', save);
        
        // TODO legacy nodes
        // leveling XP
        // legacies
        // activables

        return {
            heroClass,
            level: 40,
        
            reaper: this.getEquipedReaper(save, heroClass),
        
            ancestralLegacies: {
                nodes: [],
                selectedNodes: []
            },
            skills: this.getSkills(save, heroClass),
        
            gear: {
                helm: this.getItem(valueOrNull(inventory.helm), heroClass),
                body: this.getItem(valueOrNull(inventory.body), heroClass),
                shoulder: this.getItem(valueOrNull(inventory.shoulder), heroClass),
                bracer: this.getItem(valueOrNull(inventory.bracer), heroClass),
                glove: this.getItem(valueOrNull(inventory.glove), heroClass),
                boot: this.getItem(valueOrNull(inventory.boot), heroClass),
                ring_l: this.getItem(valueOrNull(inventory.ring_l), heroClass),
                ring_r: this.getItem(valueOrNull(inventory.ring_r), heroClass),
                amulet: this.getItem(valueOrNull(inventory.amulet), heroClass),
                belt: this.getItem(valueOrNull(inventory.belt), heroClass),
                cape: this.getItem(valueOrNull(inventory.cape), heroClass)
            },
            inventory: inventory.bag.map(item => this.getItem(item, heroClass)).filter(isNotNullOrUndefined),

            attributes: {
                [Attribute.Toughness]: this.slormancerAttributeService.getAttributeTraits(Attribute.Toughness, valueOrDefault(traits[Attribute.Toughness], 0)),
                [Attribute.Savagery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Savagery, valueOrDefault(traits[Attribute.Savagery], 0)),
                [Attribute.Fury]: this.slormancerAttributeService.getAttributeTraits(Attribute.Fury, valueOrDefault(traits[Attribute.Fury], 0)),
                [Attribute.Determination]: this.slormancerAttributeService.getAttributeTraits(Attribute.Determination, valueOrDefault(traits[Attribute.Determination], 0)),
                [Attribute.Zeal]: this.slormancerAttributeService.getAttributeTraits(Attribute.Zeal, valueOrDefault(traits[Attribute.Zeal], 0)),
                [Attribute.Willpower]: this.slormancerAttributeService.getAttributeTraits(Attribute.Willpower, valueOrDefault(traits[Attribute.Willpower], 0)),
                [Attribute.Dexterity]: this.slormancerAttributeService.getAttributeTraits(Attribute.Dexterity, valueOrDefault(traits[Attribute.Dexterity], 0)),
                [Attribute.Bravery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Bravery, valueOrDefault(traits[Attribute.Bravery], 0)),
            },
        
            primarySkill: skill_equip.indexOf(2) === -1 ? null : skill_equip.indexOf(2),
            secondarySkill: skill_equip.indexOf(3) === -1 ? null : skill_equip.indexOf(3),
            supportSkill: skill_equip.indexOf(4) === -1 ? null : skill_equip.indexOf(4),
            activable1: null,
            activable2: null,
            activable3: null,
            activable4: null
        }
    }

    public updateCharacter(character: Character) {
        
    }
}