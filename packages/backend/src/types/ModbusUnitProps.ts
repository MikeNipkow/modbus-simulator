import { DataPointProps } from "./DataPointProps.js";

/**
 * Properties for a Modbus Unit.
 */
export type ModbusUnitProps = {
    unitId          : number;           // Modbus Unit ID (1-254).
    dataPoints?     : DataPointProps[]; // Array of DataPoints in this Modbus Unit.
};