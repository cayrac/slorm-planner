export interface GameDataStat {
    REF_NB: number,
    CATEGORY: string,
    PRIMARY_NAME_TYPE: string,
    REF: string,
    SCORE: number,
    MIN_LEVEL: number,
    PERCENT: '' | '%' | 'X',
    HELM: '' | 'P' | 'S' | 'E',
    ARMOR: '' | 'P' | 'S' | 'E',
    BELT: '' | 'P' | 'S' | 'E',
    BRACER: '' | 'P' | 'S' | 'E',
    GLOVE: '' | 'P' | 'S' | 'E',
    SHOULDER: '' | 'P' | 'S' | 'E',
    BOOT: '' | 'P' | 'S' | 'E',
    RING: '' | 'P' | 'S' | 'E',
    AMULET: '' | 'P' | 'S' | 'E',
    CAPE: '' | 'P' | 'S' | 'E',
    FIELD24: string,
    'LVL 80': string,
    'LVL 80 Avg': string,
    'LVL 80 Max': string,
    'NERF TEST': number | null,
    'NLVL 80': string,
    'NLVL 80 Max': string,
  }