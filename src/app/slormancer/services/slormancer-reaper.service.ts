import { Injectable } from '@angular/core';

import { DATA_REAPER_LEVEL } from '../constants/data/data-reaper-level';
import { HeroClass } from '../model/enum/hero-class';
import { GameWeapon } from '../model/game/game-save';
import { MinMax } from '../model/minmax';
import { Reaper } from '../model/reaper';
import { ReaperBuilder } from '../model/reaper-builder';
import { valueOrNull } from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerReaperService {

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    private getReaperLevel(xp: number): number {
        let level = 1;

        for (let data of DATA_REAPER_LEVEL) {
            level = data.level;

            if (data.next !== null) {
                xp -= data.next;
            }
            
            if (data.next === null || xp < 0) {
                break;
            }
        }

        return level;
    }

    private getReaperBuilder(id: number): ReaperBuilder {
        return {
            id,
            name: this.slormancerTemplateService.getReaperBuilderName(id)
        }
    }

    public getReaperDamages(reaper: Reaper, level: number): MinMax {
        let result: MinMax | null = valueOrNull(reaper.damages[level]);


        if (result === null) {
            const keys = Array.from(Object.keys(reaper.damages)).map(parseInt);
            
            let closest = <number>keys[0];

            for (const key of keys) {
                if (key > closest && key <= level) {
                    closest = key;
                }
            }

            result = <MinMax>reaper.damages[closest];
        }

        return result;
    }

    public getReaper(reaper: GameWeapon, weaponClass: HeroClass, primordial: boolean, bonusLevel: number = 0): Reaper | null {
        const data = primordial ? reaper.primordial : reaper.basic;
        const level = this.getReaperLevel(data.experience);
        return this.getReaperById(reaper.id, weaponClass, primordial, level, data.kills, bonusLevel);
    }

    public getReaperById(id: number, weaponClass: HeroClass, primordial: boolean, level: number, kills: number, bonusLevel: number = 0): Reaper | null {
        const gameData = this.slormancerDataService.getGameDataReaper(id);
        const damages = this.slormancerDataService.getDataReaperDamages(id);
        let result: Reaper | null = null;

        console.log(id, gameData, damages);

        if (gameData !== null && damages !== null) {
            const templates = this.slormancerTemplateService.getReaperDescription(gameData);
            result = {
                type: this.slormancerTemplateService.getReaperType(weaponClass),
                icon: 'reaper_' + weaponClass + '_' + id + (primordial ? '_p' : ''),
                primordial,
                level: Math.min(level, gameData.MAX_LVL),
                bonusLevel,
                kills: kills,
                name: this.slormancerTemplateService.getReaperName(gameData.EN_NAME, weaponClass, primordial),
                base: templates.base === null ? null : {
                    template: templates.base,
                    effects: []
                },
                benediction: templates.benediction === null ? null : {
                    template: templates.benediction,
                    effects: []
                },
                malediction: templates.malediction === null ? null : {
                    template: templates.malediction,
                    effects: []
                },
                builder: this.getReaperBuilder(gameData.BLACKSMITH),
                damages,
                damageType: 'weapon_damage',
                maxLevel: gameData.MAX_LVL,
            }
        }

        return result
    }

}