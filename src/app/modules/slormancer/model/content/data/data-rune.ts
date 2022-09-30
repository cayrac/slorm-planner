import { Rune } from '../rune';

export interface DataRune {
    override: (rune: Rune) => void;
}

