import { HeroClass } from '@slorm-api';

export interface BuildPreview {
    name: string;
    version: string;
    heroClass: HeroClass;
    storageKey: string;
}