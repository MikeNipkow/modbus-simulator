import { ModbusDeviceProps } from "../../types/ModbusDeviceProps.js";

/**
 * Data Transfer Object for a Modbus Device, including its running status.
 */
export type ModbusDeviceDTO = ModbusDeviceProps & {
    template    : boolean;  // Indicates if the device is a template.
    running     : boolean;  // Indicates if the device is currently running.
}