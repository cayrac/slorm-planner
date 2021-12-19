import { EquipableItemBase } from './equipable-item-base';

export enum GearSlot {
    Helm = 'helm',
    Body = 'body',
    Shoulder = 'shoulder',
    Bracer = 'bracer',
    Glove = 'glove',
    Boot = 'boot',
    LeftRing = 'ring_l',
    RightRing = 'ring_r',
    Amulet = 'amulet',
    Belt = 'belt',
    Cape = 'cape',
}

export const ALL_GEAR_SLOT_VALUES: Array<GearSlot> = [
    GearSlot.Helm,
    GearSlot.Body,
    GearSlot.Shoulder,
    GearSlot.Bracer,
    GearSlot.Glove,
    GearSlot.Boot,
    GearSlot.LeftRing,
    GearSlot.RightRing,
    GearSlot.Amulet,
    GearSlot.Belt,
    GearSlot.Cape
];

export function gearSlotToBase(slot: GearSlot): EquipableItemBase {
    let result: EquipableItemBase;

    if (slot === GearSlot.Helm) {
        result = EquipableItemBase.Helm;
    } else if (slot === GearSlot.Body) {
        result = EquipableItemBase.Body;
    } else if (slot === GearSlot.Shoulder) {
        result = EquipableItemBase.Shoulder;
    } else if (slot === GearSlot.Bracer) {
        result = EquipableItemBase.Bracer;
    } else if (slot === GearSlot.Glove) {
        result = EquipableItemBase.Glove;
    } else if (slot === GearSlot.Boot) {
        result = EquipableItemBase.Boot;
    } else if (slot === GearSlot.LeftRing || slot === GearSlot.RightRing) {
        result = EquipableItemBase.Ring;
    } else if (slot === GearSlot.Amulet) {
        result = EquipableItemBase.Amulet;
    } else if (slot === GearSlot.Belt) {
        result = EquipableItemBase.Belt;
    } else {
        result = EquipableItemBase.Cape;
    }

    return result;
}