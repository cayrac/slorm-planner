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
    experience: number;
    name: string;
    base: ReaperEffect | null;
    benediction: ReaperEffect | null;
    malediction: ReaperEffect | null;
    builder: ReaperBuilder;
    baseDamages: MinMax;
    damagePerLevel: MinMax;
    damages: MinMax;
    level100Damages: MinMax;
    damageType: string;
    multiplier: number;
    maxLevel: number;
}