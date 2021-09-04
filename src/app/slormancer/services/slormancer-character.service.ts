import { Injectable } from '@angular/core';

import { HeroClass } from '..//model/content/enum/hero-class';
import { Character, CharacterSkillAndPassives } from '../model/character';
import { Activable } from '../model/content/activable';
import { AncestralLegacy } from '../model/content/ancestral-legacy';
import { Attribute } from '../model/content/enum/attribute';
import { EquipableItem } from '../model/content/equipable-item';
import { Reaper } from '../model/content/reaper';
import { Skill } from '../model/content/skill';
import { GameItem } from '../model/parser/game/game-item';
import { GameSave } from '../model/parser/game/game-save';
import { isNotNullOrUndefined, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerAncestralLegacyService } from './content/slormancer-ancestral-legacy.service';
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
                private slormancerAttributeService: SlormancerAttributeService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService
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

    private getAncestralLegacies(save: GameSave, heroClass: HeroClass): Array<AncestralLegacy> {
        const elementRank = save.element_rank[heroClass];

        return Object.entries(elementRank)
            .map(([key, rank]) => this.slormancerAncestralLegacyService.getAncestralLegacy(parseInt(key), rank))
            .filter(isNotNullOrUndefined);
    }

    private getActiveNodes(save: GameSave, heroClass: HeroClass): Array<number> {
        const elementEquip = save.element_equip[heroClass];

        return Object.entries(elementEquip)
            .filter(([key, equiped]) => equiped === 1)
            .map(([key, equiped]) => parseInt(key));
            
    }

    private getCharacterGear(character: Character): Array<EquipableItem> {
        return [
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
        ].filter(isNotNullOrUndefined);
    }

    private getSkill(skillId: number, character: Character): Skill | null {
        let result: Skill | null = null;

        if (skillId !== -1) {
            const skill = character.skills.map(skill => skill.skill).find(skill => skill.id = skillId);
            if (skill) {
                result = skill;
            }
        }

        return result;
    }

    private getActivable(activableId: number, character: Character): Activable | AncestralLegacy | null {
        let result: Activable | AncestralLegacy | null = null;

        if (activableId !== -1) {
            if (activableId >= 200) {
                const realId = activableId - 200;
                let activable = this.getCharacterGear(character)
                    .map(item => item.legendaryEffect !== null ? item.legendaryEffect.activable : null)
                    .find(activable => activable !== null && activable.id === realId);
                if (activable) {
                    result = activable;
                } else if (character.reaper !== null) {
                    activable = character.reaper.activables
                        .find(activable => activable !== null && activable.id === realId);
                    if (activable) {
                        result = activable;
                    }
                }
            } else if (character.ancestralLegacies.activeAncestralLegacies.indexOf(activableId) !== -1) {
                const activable = character.ancestralLegacies.ancestralLegacies
                    .find(ancestralLegacy => ancestralLegacy.id === activableId);
                if (activable) {
                    result = activable;
                }
            }
        }

        return result;
    }

    private getHeroLevel(experience: number): number {
        const xpPerLevel = this.slormancerDataService.getDataHeroNextLevelExperience();
        let level = 1;

        for (const nextLevel of xpPerLevel) {
            if (experience >= nextLevel) {
                level++;
                experience = experience - nextLevel;
            }
        }
        
        return level;
    }
    
    public getCharacterFromSave(saveContent: string, heroClass: HeroClass): Character {
        const start = new Date().getTime();
        const save = this.slormancerSaveParserService.parseSaveFile(saveContent);

        const inventory = save.inventory[heroClass];
        const skill_equip = save.skill_equip[heroClass];
        const traits = save.traits[heroClass];
        const auras = save.auras[heroClass];
        const xp = save.xp[heroClass];

        console.log('save : ', save);
        
        const character: Character = {
            heroClass,
            level: this.getHeroLevel(xp),
        
            reaper: this.getEquipedReaper(save, heroClass),
        
            ancestralLegacies: {
                ancestralLegacies: this.getAncestralLegacies(save, heroClass),
                activeNodes: this.getActiveNodes(save, heroClass),
                activeAncestralLegacies: []
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
        
            primarySkill: null,
            secondarySkill: null,
            supportSkill: null,
            activable1: null,
            activable2: null,
            activable3: null,
            activable4: null
        }

        this.updateCharacter(character);

        character.primarySkill = this.getSkill(skill_equip.indexOf(2), character);
        character.secondarySkill = this.getSkill(skill_equip.indexOf(3), character);
        character.supportSkill = this.getSkill(skill_equip.indexOf(4), character);
        character.activable1 = this.getActivable(valueOrDefault(auras[0], -1), character);
        character.activable2 = this.getActivable(valueOrDefault(auras[1], -1), character);
        character.activable3 = this.getActivable(valueOrDefault(auras[2], -1), character);
        character.activable4 = this.getActivable(valueOrDefault(auras[3], -1), character);

        const time = new Date().getTime() - start;
        console.log('Character built from save in ' + time + ' milliseconds');
        return character;
    }

    public updateCharacter(character: Character) {
        character.ancestralLegacies.activeAncestralLegacies = this.slormancerDataService.getAncestralSkillIdFromNodes(character.ancestralLegacies.activeNodes);
    }
}