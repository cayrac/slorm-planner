import { MinMax } from './minmax';
import { ReaperBuilder } from './reaper-builder';
import { ReaperEffect } from './reaper-effect';

export interface Reaper {
    type: string;
    primordial: boolean;
    icon: string;
    level: number;
    bonusLevel: number;
    kills: number;
    name: string;
    description: string;
    templates: {
        base: Array<ReaperEffect>;
        benediction: Array<ReaperEffect>;
        malediction: Array<ReaperEffect>;
    }
    builder: ReaperBuilder;
    damages: { [key: number]: MinMax };
    damageType: string;
    maxLevel: number;
}