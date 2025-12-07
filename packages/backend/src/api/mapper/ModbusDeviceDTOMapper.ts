import { deviceFromObject, deviceToDeviceProps } from "../../mapper/ModbusDeviceMapper.js";
import { ModbusDevice } from "../../ModbusDevice.js";
import { ParseResult } from "../../types/enums/ParseResult.js";
import { ModbusDeviceDTO } from "../dto/ModbusDeviceDTO.js";

/**
 * Converts a ModbusDevice to a ModbusDeviceDTO.
 * @param device The ModbusDevice to convert.
 * @param template Indicates if the device is a template.
 * @returns The corresponding ModbusDeviceDTO.
 * @throws Error if the device is invalid.
 */
export function deviceToDeviceDTO(device: ModbusDevice, template: boolean = false): ModbusDeviceDTO {
    // Check if device is valid.
    if (!device)
        throw new Error('Invalid ModbusDevice object');

    // Map properties.
    const props = deviceToDeviceProps(device);
    const dto : ModbusDeviceDTO = {
        ...props,
        template : template,
        running : device.isRunning()
    };

    return dto;
}

/**
 * Creates a ModbusDeviceDTO from a plain object.
 * @param obj Object to convert to ModbusDeviceDTO.
 * @param template Indicates if the device is a template.
 * @returns ParseResult containing the ModbusDeviceDTO or errors.
 * @throws Error if the object is invalid.
 */
export function deviceDTOFromObject(obj: any, template: boolean = false): ParseResult<ModbusDeviceDTO> {
    // Collect errors.
    const errors: string[] = [];

    // Check if obj is valid.
    if (obj === null || typeof obj !== 'object') {
        errors.push('Invalid object for ModbusDeviceDTO');
        return { success: false, errors: errors };
    }

    // Try to parse ModbusDevice.
    const deviceResult = deviceFromObject(obj);
    if (!deviceResult.success) {
        errors.push(...deviceResult.errors);
        return { success: false, errors: errors };
    }

    // Get props from device.
    const device      = deviceResult.value;
    const deviceProps = deviceToDeviceProps(device);

    // Create DTO.
    const dto: ModbusDeviceDTO = {
        ...deviceProps,
        template : template,
        running : device.isRunning()
    };

    return { success: true, value: dto };
}

/**
 * Creates a ModbusDevice from a ModbusDeviceDTO.
 * @param dto ModbusDeviceDTO to convert.
 * @returns ParseResult containing the ModbusDevice or errors.
 * @throws Error if the dto is invalid.
 */
export function deviceFromDTO(dto: ModbusDeviceDTO): ParseResult<ModbusDevice> {
    // Collect errors.
    const errors: string[] = [];

    // Check if dto is valid.
    if (dto === null || typeof dto !== 'object') {
        errors.push('Invalid object for ModbusDeviceDTO');
        return { success: false, errors: errors };
    }

    // Try to create ModbusDevice from DTO.
    const deviceResult = deviceFromObject(dto);
    if (!deviceResult.success) {
        errors.push(...deviceResult.errors);
        return { success: false, errors: errors };
    }

    // Ignore "running" property when creating device.
    return { success: true, value: deviceResult.value };
}