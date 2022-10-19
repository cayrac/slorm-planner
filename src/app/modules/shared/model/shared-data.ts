import { Character } from 'slormancer-api';

import { Build } from './build';
import { Layer } from './layer';

export interface SharedData {
    character: Character | null;
    layer: Layer | null;
    planner: Build | null;
}