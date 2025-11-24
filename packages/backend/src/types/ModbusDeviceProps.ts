import { Endian } from "./enums/Endian.js";
import { ModbusUnitProps } from "./ModbusUnitProps.js";

/**
 * Properties for a Modbus Device.
 */
export type ModbusDeviceProps = {
    fileName            : string;               // File name of the Modbus Device.
    enabled             : boolean;              // Whether the Modbus Device is enabled.
    port                : number;               // Port number for the Modbus Device.
    endian              : Endian;               // Endianness of the Modbus Device.
    name?               : string;               // Name of the Modbus Device.
    vendor?             : string;               // Vendor of the Modbus Device.
    description?        : string;               // Description of the Modbus Device.
    modbusUnits?        : ModbusUnitProps[];    // Array of Modbus Units in this Modbus Device.
};