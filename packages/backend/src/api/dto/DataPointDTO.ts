import { AccessMode } from "../../types/enums/AccessMode.js";
import { DataArea } from "../../types/enums/DataArea.js";
import { DataType } from "../../types/enums/DataType.js";
import { SimulationProps } from "../../types/SimulationProps.js";

export type DataPointDTO = {
    id                  : string;
    areas               : DataArea[];
    type                : DataType;
    address             : number;
    accessMode          : AccessMode;

    length              : number;
    defaultValue        : boolean | number | bigint | string;
    value               : boolean | number | bigint | string;
    name                : string;
    unit                : string;
    simulation          : SimulationProps;
    feedbackDataPoint?  : string;
};