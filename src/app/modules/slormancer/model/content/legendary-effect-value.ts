export interface LegendaryEffectValue {
    values: { [key: number]: number } | null;
    type: string | null;
    stat: string | null;
    constant: number | null;
    synergyValue: number | null;
}