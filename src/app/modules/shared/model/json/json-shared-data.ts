import { JsonCharacter } from './json-character';
import { JsonLayer } from './json-layer';
import { JsonPlanner } from './json-planner';

export interface JsonSharedData {
    character: JsonCharacter | null;
    layer: JsonLayer | null;
    planner: JsonPlanner | null;
}