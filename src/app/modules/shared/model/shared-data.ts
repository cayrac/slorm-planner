import { Character } from '../../slormancer/model/character';
import { Build } from './build';
import { Layer } from './layer';

export interface SharedData {
    character: Character | null;
    layer: Layer | null;
    planner: Build | null;
}