import { DataPointProps } from "../../types/DataPointProps.js";

/**
 * Data Transfer Object for a DataPoint, including its current value.
 */
export type DataPointDTO = DataPointProps & {
    value?  : boolean | number | bigint | string;   // Current value of the DataPoint.
}