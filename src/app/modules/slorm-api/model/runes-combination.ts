import { ActivationRune, EffectRune, EnhancementRune } from './content/rune';

export interface RunesCombination {
    activation: ActivationRune | null;
    effect: EffectRune | null;
    enhancement: EnhancementRune |null;
}