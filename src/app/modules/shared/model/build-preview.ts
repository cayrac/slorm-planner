import { HeroClass } from '@slormancer/model/content/enum/hero-class';

export interface BuildPreview {
    name: string;
    version: string;
    heroClass: HeroClass;
    storageKey: string;
}