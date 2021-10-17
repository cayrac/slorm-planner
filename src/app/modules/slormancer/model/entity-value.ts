import { Entity } from './entity';
import { MinMax } from './minmax';

export interface EntityValue<T = number | MinMax> {
    value: T;
    source: Entity;
}