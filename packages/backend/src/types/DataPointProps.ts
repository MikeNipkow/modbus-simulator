import { AccessMode } from "./enums/AccessMode.js";
import { DataArea } from "./enums/DataArea.js";
import { DataType } from "./enums/DataType.js";
import { SimulationProps } from "./SimulationProps.js";

/**
 * Properties for a DataPoint.
 */
export interface DataPointProps {
    id                  : string;               // Unique identifier for the DataPoint.
    areas               : DataArea[];           // DataAreas where this DataPoint is located.
    type                : DataType;             // Data type of the DataPoint.
    address             : number;               // Address of the DataPoint within the DataArea.
    accessMode          : AccessMode;           // Access mode of the DataPoint.

    defaultValue        : boolean | number | bigint | string;  // Default value of the DataPoint.
    length?             : number;               // Length of the DataPoint (required for ASCII data points)

    name                : string;               // Human-readable name of the DataPoint.
    unit                : string;               // Unit of measurement for the DataPoint.

    simulation?         : SimulationProps;      // Simulation properties for the DataPoint.
    feedbackDataPoint?  : string                // Feedback DataPoint identifier.
}