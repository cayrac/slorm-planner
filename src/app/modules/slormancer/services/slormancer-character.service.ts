import { Injectable } from '@angular/core';

import { HeroClass } from '..//model/content/enum/hero-class';
import { INVENTORY_SIZE, MAX_HERO_LEVEL, STASH_SIZE } from '../constants/common';
import { Character, CharacterSkillAndUpgrades } from '../model/character';
import { Activable } from '../model/content/activable';
import { AncestralLegacy } from '../model/content/ancestral-legacy';
import { ALL_ATTRIBUTES, Attribute } from '../model/content/enum/attribute';
import { EquipableItem } from '../model/content/equipable-item';
import { Reaper } from '../model/content/reaper';
import { Skill } from '../model/content/skill';
import { SkillUpgrade } from '../model/content/skill-upgrade';
import { GameItem } from '../model/parser/game/game-item';
import { GameSave, GameSharedInventory } from '../model/parser/game/game-save';
import { list } from '../util/math.util';
import { isNotNullOrUndefined, valueOrDefault, valueOrNull } from '../util/utils';
import { SlormancerAncestralLegacyService } from './content/slormancer-ancestral-legacy.service';
import { SlormancerAttributeService } from './content/slormancer-attribute.service';
import { SlormancerDataService } from './content/slormancer-data.service';
import { SlormancerItemService } from './content/slormancer-item.service';
import { SlormancerReaperService } from './content/slormancer-reaper.service';
import { SlormancerSkillService } from './content/slormancer-skill.service';
import { SlormancerTranslateService } from './content/slormancer-translate.service';

@Injectable()
export class SlormancerCharacterService {

    private readonly LEVEL_LABEL = this.slormancerTranslateService.translate('level').toLowerCase();

    constructor(private slormancerItemservice: SlormancerItemService,
                private slormancerReaperService: SlormancerReaperService,
                private slormancerDataService: SlormancerDataService,
                private slormancerSkillService: SlormancerSkillService,
                private slormancerAttributeService: SlormancerAttributeService,
                private slormancerAncestralLegacyService: SlormancerAncestralLegacyService,
                private slormancerTranslateService: SlormancerTranslateService
        ) { }

    private getSkills(heroClass: HeroClass, equipped: Array<number> = [], ranks: Array<number> = []): Array<CharacterSkillAndUpgrades> {
        return this.slormancerDataService.getGameDataActiveSkills(heroClass).map(gameData => {
            const skill = this.slormancerSkillService.getHeroSkill(gameData.REF, heroClass, valueOrDefault(equipped[gameData.REF], 0));
            const upgrades = this.slormancerDataService.getGameDataUpgradeIdsForSkill(gameData.REF, heroClass)
                .map(upgradeId => this.slormancerSkillService.getUpgrade(upgradeId, heroClass, valueOrDefault(ranks[upgradeId], 0)))
                .filter(isNotNullOrUndefined);
            return skill === null ? null : {
                skill,
                upgrades,
                selectedUpgrades: upgrades.map(passive => passive.id).filter(id => equipped[id] === 1)
            }
        }).filter(isNotNullOrUndefined);
    }

    private getSkillsClone(skillAndUpgrades: CharacterSkillAndUpgrades): CharacterSkillAndUpgrades {
        return {
            skill: this.slormancerSkillService.getHeroSkillClone(skillAndUpgrades.skill),
            selectedUpgrades: [...skillAndUpgrades.selectedUpgrades],
            upgrades: skillAndUpgrades.upgrades.map(upgrade => this.slormancerSkillService.getUpgradeClone(upgrade))
        };
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

    private getAncestralLegacies(ranks: Array<number> = []): Array<AncestralLegacy> {
        return this.slormancerDataService.getGameDataAncestralLegacyIds()
            .map(id => this.slormancerAncestralLegacyService.getAncestralLegacy(id, valueOrDefault(ranks[id], 0)))
            .filter(isNotNullOrUndefined);
    }

    private getActiveNodes(equipped: Array<number> = []): Array<number> {
        return Object.entries(equipped)
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
            const skill = character.skills.map(skill => skill.skill).find(skill => skill.id === skillId);
            if (skill) {
                result = skill;
            }
        }

        return result;
    }

    private getActivableFromActivable(activable: Activable | AncestralLegacy | null , character: Character): Activable | AncestralLegacy | null {
        let result: Activable | AncestralLegacy | null = null;

        if (activable  !== null) {
            const id = (<any>activable)['isActivable'] !== undefined ? activable.id : activable.id + 200;
            result = this.getActivable(id, character);
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

    private getSharedInventory(sharedInventory: GameSharedInventory, heroClass: HeroClass): Array<Array<EquipableItem | null>> {
        const result: Array<Array<EquipableItem | null>> = [];
        const items = sharedInventory.map(item => this.getItem(item, heroClass))

        for (let i = 0, length = items.length; i < length; i += STASH_SIZE) {
            const stash = items.slice(i, i + STASH_SIZE);
            if (stash.length === STASH_SIZE) {
                result.push(stash);
            }
        }
        
        return result;
    }

    public getEmptyCharacter(heroClass: HeroClass): Character {
        const character: Character = {
            heroClass,
            level: MAX_HERO_LEVEL,
            name: '',
            fullName: '',
        
            reaper: this.slormancerReaperService.getReaper(0, heroClass, false, 100, 100, 0, 0),
        
            ancestralLegacies: {
                ancestralLegacies: this.getAncestralLegacies(),
                activeNodes: [],
                activeAncestralLegacies: [],
                maxAncestralLegacy: 2 // TODO parser ça plus tard
            },
            skills: this.getSkills(heroClass),
        
            gear: {
                helm: null,
                body: null,
                shoulder: null,
                bracer: null,
                glove: null,
                boot: null,
                ring_l: null,
                ring_r: null,
                amulet: null,
                belt: null,
                cape: null
            },
            inventory: list(INVENTORY_SIZE).map(() => null),
            sharedInventory: list(4).map(() => list(STASH_SIZE).map(() => null)),

            attributes: {
                remainingPoints: 0,
                maxPoints: 0,
                allocated: {
                    [Attribute.Toughness]: this.slormancerAttributeService.getAttributeTraits(Attribute.Toughness, 0),
                    [Attribute.Savagery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Savagery, 0),
                    [Attribute.Fury]: this.slormancerAttributeService.getAttributeTraits(Attribute.Fury, 0),
                    [Attribute.Determination]: this.slormancerAttributeService.getAttributeTraits(Attribute.Determination, 0),
                    [Attribute.Zeal]: this.slormancerAttributeService.getAttributeTraits(Attribute.Zeal, 0),
                    [Attribute.Willpower]: this.slormancerAttributeService.getAttributeTraits(Attribute.Willpower, 0),
                    [Attribute.Dexterity]: this.slormancerAttributeService.getAttributeTraits(Attribute.Dexterity, 0),
                    [Attribute.Bravery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Bravery, 0),
                }},
        
            primarySkill: null,
            secondarySkill: null,
            supportSkill: null,
            activable1: null,
            activable2: null,
            activable3: null,
            activable4: null
        }

        character.primarySkill = null;
        character.secondarySkill = null;
        character.supportSkill = null;
        character.activable1 = null;
        character.activable2 = null;
        character.activable3 = null;
        character.activable4 = null;

        this.updateCharacter(character);

        return character;
    }

    public getCharacterClone(character: Character): Character {
        const result: Character = {
            ...character,
            reaper: character.reaper === null ? null : this.slormancerReaperService.getReaperClone(character.reaper),
        
            ancestralLegacies: {
                ancestralLegacies: character.ancestralLegacies.ancestralLegacies.map(ancestralLegacy => this.slormancerAncestralLegacyService.getAncestralLegacyClone(ancestralLegacy)),
                activeNodes: [...character.ancestralLegacies.activeNodes],
                activeAncestralLegacies: [...character.ancestralLegacies.activeAncestralLegacies],
                maxAncestralLegacy: character.ancestralLegacies.maxAncestralLegacy
            },
            skills: character.skills.map(skill => this.getSkillsClone(skill)),
        
            gear: {
                helm: character.gear.helm === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.helm),
                body: character.gear.body === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.body),
                shoulder: character.gear.shoulder === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.shoulder),
                bracer: character.gear.bracer === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.bracer),
                glove: character.gear.glove === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.glove),
                boot: character.gear.boot === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.boot),
                ring_l: character.gear.ring_l === null ? null :  this.slormancerItemservice.getEquipableItemClone(character.gear.ring_l),
                ring_r: character.gear.ring_r === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.ring_r),
                amulet: character.gear.amulet === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.amulet),
                belt: character.gear.belt === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.belt),
                cape: character.gear.cape === null ? null : this.slormancerItemservice.getEquipableItemClone(character.gear.cape),
            },
            inventory: character.inventory.map(item => item === null ? null : this.slormancerItemservice.getEquipableItemClone(item)),
            sharedInventory: character.sharedInventory.map(items => items.map(item => item === null ? null : this.slormancerItemservice.getEquipableItemClone(item))),

            attributes: {
                remainingPoints: 0,
                maxPoints: 0,
                allocated: {
                    [Attribute.Toughness]: this.slormancerAttributeService.getAttributeTraits(Attribute.Toughness, character.attributes.allocated[Attribute.Toughness].rank),
                    [Attribute.Savagery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Savagery, character.attributes.allocated[Attribute.Savagery].rank),
                    [Attribute.Fury]: this.slormancerAttributeService.getAttributeTraits(Attribute.Fury, character.attributes.allocated[Attribute.Fury].rank),
                    [Attribute.Determination]: this.slormancerAttributeService.getAttributeTraits(Attribute.Determination, character.attributes.allocated[Attribute.Determination].rank),
                    [Attribute.Zeal]: this.slormancerAttributeService.getAttributeTraits(Attribute.Zeal, character.attributes.allocated[Attribute.Zeal].rank),
                    [Attribute.Willpower]: this.slormancerAttributeService.getAttributeTraits(Attribute.Willpower, character.attributes.allocated[Attribute.Willpower].rank),
                    [Attribute.Dexterity]: this.slormancerAttributeService.getAttributeTraits(Attribute.Dexterity, character.attributes.allocated[Attribute.Dexterity].rank),
                    [Attribute.Bravery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Bravery, character.attributes.allocated[Attribute.Bravery].rank),
                }},
        
            primarySkill: null,
            secondarySkill: null,
            supportSkill: null,
            activable1: null,
            activable2: null,
            activable3: null,
            activable4: null
        }

        result.primarySkill = valueOrNull(result.skills.map(skill => skill.skill).find(skill => character.primarySkill !== null && skill.id === character.primarySkill.id));
        result.secondarySkill = valueOrNull(result.skills.map(skill => skill.skill).find(skill => character.secondarySkill !== null && skill.id === character.secondarySkill.id));
        result.supportSkill = valueOrNull(result.skills.map(skill => skill.skill).find(skill => character.supportSkill !== null && skill.id === character.supportSkill.id));
        result.activable1 = this.getActivableFromActivable(character.activable1, result);
        result.activable2 = this.getActivableFromActivable(character.activable2, result);
        result.activable3 = this.getActivableFromActivable(character.activable3, result);
        result.activable4 = this.getActivableFromActivable(character.activable4, result);

        this.updateCharacter(result);

        return result;
    }
    
    public getCharacterFromSave(save: GameSave, heroClass: HeroClass): Character {
        const start = new Date().getTime();

        const inventory = save.inventory[heroClass];
        const skill_equip = save.skill_equip[heroClass];
        const traits = save.traits[heroClass];
        const auras = save.auras[heroClass];
        const xp = save.xp[heroClass];
        
        const character: Character = {
            heroClass,
            level: this.getHeroLevel(xp),
            name: '',
            fullName: '',
        
            reaper: this.getEquipedReaper(save, heroClass),
        
            ancestralLegacies: {
                ancestralLegacies: this.getAncestralLegacies(save.element_rank[heroClass]),
                activeNodes: this.getActiveNodes(save.element_equip[heroClass]),
                activeAncestralLegacies: [],
                maxAncestralLegacy: 2
            },
            skills: this.getSkills(heroClass, save.skill_equip[heroClass], save.skill_rank[heroClass]),
        
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
            inventory: inventory.bag.map(item => this.getItem(item, heroClass)),
            sharedInventory: this.getSharedInventory(save.shared_inventory, heroClass),

            attributes: {
                remainingPoints: 0,
                maxPoints: 0,
                allocated: {
                    [Attribute.Toughness]: this.slormancerAttributeService.getAttributeTraits(Attribute.Toughness, valueOrDefault(traits[Attribute.Toughness], 0)),
                    [Attribute.Savagery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Savagery, valueOrDefault(traits[Attribute.Savagery], 0)),
                    [Attribute.Fury]: this.slormancerAttributeService.getAttributeTraits(Attribute.Fury, valueOrDefault(traits[Attribute.Fury], 0)),
                    [Attribute.Determination]: this.slormancerAttributeService.getAttributeTraits(Attribute.Determination, valueOrDefault(traits[Attribute.Determination], 0)),
                    [Attribute.Zeal]: this.slormancerAttributeService.getAttributeTraits(Attribute.Zeal, valueOrDefault(traits[Attribute.Zeal], 0)),
                    [Attribute.Willpower]: this.slormancerAttributeService.getAttributeTraits(Attribute.Willpower, valueOrDefault(traits[Attribute.Willpower], 0)),
                    [Attribute.Dexterity]: this.slormancerAttributeService.getAttributeTraits(Attribute.Dexterity, valueOrDefault(traits[Attribute.Dexterity], 0)),
                    [Attribute.Bravery]: this.slormancerAttributeService.getAttributeTraits(Attribute.Bravery, valueOrDefault(traits[Attribute.Bravery], 0)),
                }},
        
            primarySkill: null,
            secondarySkill: null,
            supportSkill: null,
            activable1: null,
            activable2: null,
            activable3: null,
            activable4: null
        }

        character.primarySkill = this.getSkill(skill_equip.indexOf(2), character);
        character.secondarySkill = this.getSkill(skill_equip.indexOf(3), character);
        character.supportSkill = this.getSkill(skill_equip.indexOf(4), character);
        character.activable1 = this.getActivable(valueOrDefault(auras[0], -1), character);
        character.activable2 = this.getActivable(valueOrDefault(auras[1], -1), character);
        character.activable3 = this.getActivable(valueOrDefault(auras[2], -1), character);
        character.activable4 = this.getActivable(valueOrDefault(auras[3], -1), character);

        this.updateCharacter(character);

        const time = new Date().getTime() - start;
        console.log('Character built from save in ' + time + ' milliseconds');
        return character;
    }

    private resetAttributes(character: Character) {
        for (const attribute of ALL_ATTRIBUTES) {
            character.attributes.allocated[attribute].rank = 0;
            this.slormancerAttributeService.updateAttributeTraits(character.attributes.allocated[attribute]);
        }
    }

    public updateCharacter(character: Character) {
        character.ancestralLegacies.activeAncestralLegacies = this.slormancerDataService.getAncestralSkillIdFromNodes(character.ancestralLegacies.activeNodes);

        character.name = this.slormancerTranslateService.translate('hero_' + character.heroClass);
        const specialization = character.supportSkill !== null ? character.supportSkill.specializationName : null;
        let fullName = [character.name, specialization].filter(isNotNullOrUndefined).join(', ');
        character.fullName = fullName + ' ' + this.LEVEL_LABEL + ' ' + character.level;

        character.attributes.maxPoints = character.level;
        let allocatedPoints = ALL_ATTRIBUTES.map(attribute => character.attributes.allocated[attribute].rank).reduce((p, c) => p + c, 0);

        if (allocatedPoints > character.attributes.maxPoints) {
            this.resetAttributes(character);
            allocatedPoints = 0;
        }
        character.attributes.remainingPoints = character.attributes.maxPoints - allocatedPoints;
    }

    public setPrimarySkill(character: Character, skill: Skill): boolean {
        let result = false;

        if (character.primarySkill !== skill) {
            if (character.secondarySkill === skill) {
                character.secondarySkill = character.primarySkill;
            }
            character.primarySkill = skill;

            this.updateCharacter(character);

            result = true;
        }

        return result;
    }

    public setSecondarySkill(character: Character, skill: Skill): boolean {
        let result = false;

        if (character.secondarySkill !== skill) {
            if (character.primarySkill === skill) {
                character.primarySkill = character.secondarySkill;
            }
            character.secondarySkill = skill;
            this.updateCharacter(character);

            result = true;
        }

        return result;
    }

    public setSupportSkill(character: Character, skill: Skill): boolean {
        let result = false;

        if (character.supportSkill !== skill) {
            character.supportSkill = skill;
            this.updateCharacter(character);

            result = true;
        }

        return result;
    }
    
    public selectUpgrade(skill: CharacterSkillAndUpgrades, newUpgrade: SkillUpgrade): boolean {
        let changed = false;
        
        if (newUpgrade.skillId == skill.skill.id) {
            const sameLineId = skill.selectedUpgrades
                .map(id => skill.upgrades.find(upgrade => upgrade.id === id))
                .filter(isNotNullOrUndefined)
                .filter(upgrade => upgrade.line === newUpgrade.line)
                .map(upgrade => upgrade.id)
                .splice(0, 1)[0];
    
            if (sameLineId !== undefined && sameLineId !== newUpgrade.id) {
                const sameLineIndex = skill.selectedUpgrades.indexOf(sameLineId);
                skill.selectedUpgrades.splice(sameLineIndex, 1);    
            }

            skill.selectedUpgrades.push(newUpgrade.id);
            changed = true;    
        }


        return changed;
    }

    public activateAncestralLegacyNode(character: Character, nodeId: number): boolean {
        let changed = false;

        if (character.ancestralLegacies.activeNodes.indexOf(nodeId) === -1
            && character.ancestralLegacies.activeNodes.length < character.ancestralLegacies.maxAncestralLegacy
            && this.slormancerAncestralLegacyService.isNodeConnectedTo(nodeId, character.ancestralLegacies.activeNodes)) {
            character.ancestralLegacies.activeNodes.push(nodeId);
            this.updateCharacter(character);
            changed = true;
        }

        return changed;
    }
    
    public disableAncestralLegacyNode(character: Character, nodeId: number): boolean {
        let changed = false;

        if (character.ancestralLegacies.activeNodes.indexOf(nodeId) !== -1) {
            character.ancestralLegacies.activeNodes = this.slormancerAncestralLegacyService.getValidNodes(character.ancestralLegacies.activeNodes.filter(id => id !== nodeId));
            this.updateCharacter(character);
            changed = true;
        }

        return changed;
    }
}