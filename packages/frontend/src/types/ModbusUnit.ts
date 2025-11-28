import type { DataPoint } from "./DataPoint";

/**
 * Properties for a Modbus Unit.
 */
export type ModbusUnit = {
    unitId          : number;       // Modbus Unit ID (1-254).
    dataPoints?     : DataPoint[];  // Array of DataPoints in this Modbus Unit.
};