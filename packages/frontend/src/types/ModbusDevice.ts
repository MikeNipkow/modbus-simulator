import type { Endian } from "./enums/Endian";
import type { ModbusUnit } from "./ModbusUnit";

/**
 * Properties for a Modbus Device.
 */
export type ModbusDeviceProps = {
    filename            : string;               // Filename of the Modbus Device.
    enabled             : boolean;              // Whether the Modbus Device is enabled.
    port                : number;               // Port number for the Modbus Device.
    endian              : Endian;               // Endianness of the Modbus Device.
    name?               : string;               // Name of the Modbus Device.
    vendor?             : string;               // Vendor of the Modbus Device.
    description?        : string;               // Description of the Modbus Device.
    modbusUnits?        : ModbusUnit[];         // Array of Modbus Units in this Modbus Device.
    running             : boolean;              // Indicates if the device is currently running.
};