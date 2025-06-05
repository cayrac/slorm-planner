export interface CrashReport {
    message: string;
    stack: string | null;
    builds: string | null;
    buildKey: string | null;
    build: string | null;
    layerIndex: number | null;
}