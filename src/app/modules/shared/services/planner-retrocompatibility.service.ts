import { Injectable } from '@angular/core';

import { DEFAULT_CONFIG } from '../../slormancer/constants/content/data/default-configs';
import { compareVersions } from '../../slormancer/util/utils';
import { Planner } from '../model/planner';

@Injectable({ providedIn: 'root' })
export class PlannerRetrocompatibilityService {

    private readonly CHANGES: Array<{ version: string, update: (planner: Planner) => void }> = [
        {
            version: '0.0.2',
            update: planner => {
                planner.configuration['frostbolt_shot_recently'] = 0;
                planner.configuration['has_elemental_prowess_buff'] = false;
                planner.configuration['has_splash_splash_buff'] = false;
                planner.configuration['has_booster_max_buff'] = false;
                planner.version = '0.0.2';
            }
        },
        {
            version: '0.0.4',
            update: planner => {
                planner.configuration['use_enemy_state'] = false;
                planner.version = '0.0.4';
            }
        },
    ];

    constructor() { }

    public updateToLatestVersion(planner: Planner) {
        
        if (planner.version === undefined) {
            planner.version = '0.0.1';
            planner.configuration = DEFAULT_CONFIG;
        }

        for (let change of this.CHANGES) {
            if (compareVersions(planner.version, change.version)) {
                change.update(planner);
            }
        }
    }

}