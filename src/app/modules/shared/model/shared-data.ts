import { Character } from '../../slormancer/model/character';
import { Layer } from './layer';
import { Planner } from './planner';

export interface SharedData {
    character: Character | null;
    layer: Layer | null;
    planner: Planner | null;
}