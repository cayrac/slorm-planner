import { Attribute } from './enum/attribute';

export interface AttributeEnchantment {
    type: Attribute;
    values: { [key: number] : number },
    value: number;
    name: string;
    icon: string;
}