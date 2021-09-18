import { JsonCharacter } from './json-character';

export interface JsonLayer {
    type: 'l';
    name: string;
    character: JsonCharacter;
}