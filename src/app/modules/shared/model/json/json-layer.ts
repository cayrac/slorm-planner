import { JsonCharacter } from './json-character';

export interface JsonLayer {
    type: 'l';
    na: string;
    ch: JsonCharacter;
}