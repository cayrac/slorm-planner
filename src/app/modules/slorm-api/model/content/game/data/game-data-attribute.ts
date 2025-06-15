import { Attribute } from '../../enum/attribute';

export interface GameDataAttribute {
    REF: number;
    TRAIT: Attribute;
    ADDITIVE: number | null;
    LEVEL: number;
    VALUE: string;
    TYPE: string;
    STAT: string;
    EN_TEXT: string;
    FR_TEXT: string;
    CH_TEXT: string;
    TW_TEXT: string;
    JP_TEXT: string;
    DE_TEXT: string;
    ES_TEXT: string;
    IT_TEXT: string;
    RU_TEXT: string;
    PT_TEXT: string;
    PO_TEXT: string;
    KR_TEXT: string;
    TUR_TEXT: string;
    LOCAL_TEXT: string;
}