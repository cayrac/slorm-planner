import { Character, CharacterConfig } from '@slorm-api';

import { Build } from './build';
import { Layer } from './layer';

export interface SharedData {
    character: Character | null;
    configuration: Partial<CharacterConfig> | null;
    layer: Layer | null;
    planner: Build | null;
}