import { HeroClass } from 'slormancer-api';

export interface BuildPreview {
    name: string;
    version: string;
    heroClass: HeroClass;
    storageKey: string;
}