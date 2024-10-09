import { ActivationRune, EffectRune, EnhancementRune, Rune } from "./rune";

export enum RuneType {
    Activation = 0,
    Effect = 1,
    Enhancement = 2
}

export function isEffectRune(rune: Rune): rune is EffectRune {
    return rune.type === RuneType.Effect;
}

export function isActivationRune(rune: Rune): rune is ActivationRune {
    return rune.type === RuneType.Activation;
}

export function isEnhancementRune(rune: Rune): rune is EnhancementRune {
    return rune.type === RuneType.Enhancement;
}