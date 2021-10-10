import { Injectable } from '@angular/core';

import { DEFAULT_CONFIG } from '../../slormancer/constants/content/data/default-configs';
import { Planner } from '../model/planner';

@Injectable({ providedIn: 'root' })
export class PlannerRetrocompatibilityService {

    /*private readonly CHANGES: Array<{ version: string, update: (planner: Planner) => void }> = [
    ]}*/

    constructor() { }

    public updateToLatestVersion(planner: Planner) {
        
        if (planner.version === undefined) {
            planner.version = '0.0.1';
            planner.configuration = DEFAULT_CONFIG;
        }
    }

}