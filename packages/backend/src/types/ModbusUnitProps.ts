import { DataPoint } from "../DataPoint.js";
import { DataPointProps } from "./DataPointProps.js";

export type ModbusUnitProps = {
    id              : number;           // Modbus Unit ID (1-254).
    dataPoints?     : DataPointProps[]; // Array of DataPoints in this Modbus Unit.
};