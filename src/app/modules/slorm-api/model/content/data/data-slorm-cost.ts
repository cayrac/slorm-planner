export interface DataSlormCost {
    passive: {
        // slorm tier
        [key: number]: {
            // line
            [key: number]: {
                // max rank
                [key: number]: number[]
            }
        }
    },
    ancestral: {
        // circle tier
        [key: number]: {
            // max rank
            [key: number]: number[]
        }
    }
}