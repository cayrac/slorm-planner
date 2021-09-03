import { Injectable } from '@angular/core';

import { HeroClass } from '..//model/content/enum/hero-class';
import { Character } from '../model/character';
import { EquipableItem } from '../model/content/equipable-item';
import { SlormancerItemParserService } from './parser/slormancer-item-parser.service';
import { SlormancerSaveParserService } from './parser/slormancer-save-parser.service';

@Injectable()
export class SlormancerCharacterService {

    constructor(private slormancerSaveParserService: SlormancerSaveParserService,
                private slormancerItemParserService: SlormancerItemParserService
        ) { }

    private getItem(data: string): EquipableItem | null {
        
    }

    public getCharacterFromSave(saveContent: string, heroClass: HeroClass): Character {
        const save = this.slormancerSaveParserService.parseSaveFile(saveContent);

        const equipment = save.equipment_list[heroClass];

        console.log('equipment : ', equipment);

        return {
            heroClass,
            level: 0,
        
            reaper: null,
        
            ancestralLegacies: {
                nodes: [],
                selectedNodes: []
            },
            skills: [],
        
            gear: {
                helm: null,
                body: null,
                shoulder: null,
                bracer: null,
                glove: null,
                boot: null,
                ring: null,
                amulet: null,
                belt: null,
                cape: null
            },
            inventory: [],
        
            attributes: {
                0: 0,
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0
            },
        
            primarySkill: null,
            secondarySkill: null,
            supportSkill: null,
            activable1: null,
            activable2: null,
            activable3: null,
            activable4: null
        }
    }
}