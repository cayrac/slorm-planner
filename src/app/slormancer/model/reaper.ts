import { HeroClass } from './enum/hero-class';
import { MinMax } from './minmax';
import { ReaperBuilder } from './reaper-builder';
import { ReaperEffect } from './reaper-effect';
import { Skill } from './skill';

export interface ReaperInfo {
    kills: number;
    level: number;
}
export interface ReaperTemplates {
    name: string;
    base: Array<ReaperEffect>;
    benediction: Array<ReaperEffect>;
    malediction: Array<ReaperEffect>;
    skills: Array<Skill>;
    primordialSkills: Array<Skill>;
}

export interface Reaper {
    id: number;
    weaponClass: HeroClass;
    type: string;
    primordial: boolean;
    icon: string;
    level: number;
    bonusLevel: number;
    kills: number;
    name: string;
    description: string;
    benediction: string | null;
    malediction: string | null;
    skills: Array<Skill>,
    lore: string;
    damages: MinMax;
    maxDamagesWithBonuses: MinMax;
    maxLevelWithBonuses: number;
    maxLevel: number;
    templates: ReaperTemplates;
    baseInfo: ReaperInfo;
    primordialInfo: ReaperInfo;
    builder: ReaperBuilder;
    damagesRange: { [key: number]: MinMax };
    damageType: string;
}