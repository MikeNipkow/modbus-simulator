import { AccessMode } from "./AccessMode.js";
import { DataArea } from "./DataArea.js";
import { DataType } from "./DataType.js";
import { SimulationProps } from "./SimulationProps.js";

export interface DataPointProps {
    id                  : string;
    areas               : DataArea[];
    type                : DataType;
    address             : number;
    accessMode          : AccessMode;

    length?             : number;
    defaultValue?       : boolean | number | bigint | string;
    name?               : string;
    unit?               : string;
    simulation?         : SimulationProps;
    feedbackDataPoint?  : string | undefined;
}