import { ModbusDevice } from "../ModbusDevice.js";
import { Endian } from "../types/enums/Endian.js";
import { ParseResult } from "../types/enums/ParseResult.js";
import { ModbusDeviceProps } from "../types/ModbusDeviceProps.js";
import { isValidFilename } from "../util/fileUtils.js";
import { unitFromObject, unitToUnitProps } from "./ModbusUnitMapper.js";

/**
 * Maps a ModbusDevice to its ModbusDeviceProps representation.
 * @param device ModbusDevice to map.
 * @returns ModbusDeviceProps representation of the ModbusDevice.
 */
export function deviceToDeviceProps(device: ModbusDevice): ModbusDeviceProps {
    // Check if device is valid.
    if (!device)
        throw new Error("Invalid ModbusDevice");

    return {
        filename    : device.getFilename(),
        enabled     : device.isEnabled(),
        port        : device.getPort(),
        endian      : device.getEndian(),
        name        : device.getName(),
        vendor      : device.getVendor(),
        description : device.getDescription(),
        modbusUnits : device.getAllUnits().map(unit => unitToUnitProps(unit))
    };
}

/**
 * Creates a ModbusDevice from a plain object, validating its properties.
 * @param obj Object to convert to ModbusDevice.
 * @returns ParseResult containing the ModbusDevice or errors.
 */
export function deviceFromObject(obj: any): ParseResult<ModbusDevice> {
    // Collect errors.
    const errors: string[] = [];

    // Check if object is valid.
    if (obj === null || typeof obj !== 'object') {
        errors.push('Invalid object for ModbusDevice');
        return { success: false, errors: errors };
    }

    // Check filename.
    const filename = obj.filename;
    if (filename === undefined || typeof filename !== 'string' || filename.length === 0)
        errors.push('ModbusDevice must have a valid filename string');
    else if (!isValidFilename(filename))
        errors.push(`ModbusDevice filename '${filename}' is not valid`);
    else if (!filename.endsWith('.json'))
        errors.push(`ModbusDevice filename '${filename}' must end with .json`);

    // Check enabled.
    const enabled = obj.enabled;
    if (enabled !== undefined && typeof enabled !== 'boolean')
        errors.push('ModbusDevice must have a valid enabled boolean');

    // Check port.
    const port = obj.port;
    if (port === undefined || typeof port !== 'number')
        errors.push('ModbusDevice must have a valid port number');
    else if (port < 1 || port > 65535)
        errors.push('ModbusDevice port must be between 1 and 65535');

    // Check endian.
    const endian = obj.endian;
    if (endian === undefined || typeof endian !== 'string')
        errors.push('ModbusDevice must have a valid endian string');
    else if (endian !== Endian.BigEndian && endian !== Endian.LittleEndian)
        errors.push(`ModbusDevice endian must be either '${Endian.BigEndian}' or '${Endian.LittleEndian}'`);

    // Check name.
    const name = obj.name;
    if (name !== undefined && typeof name !== 'string')
        errors.push('ModbusDevice must have a valid name string');

    // Check vendor.
    const vendor = obj.vendor;
    if (vendor !== undefined && typeof vendor !== 'string')
        errors.push('ModbusDevice must have a valid vendor string');

    // Check description.
    const description = obj.description;
    if (description !== undefined && typeof description !== 'string')
        errors.push('ModbusDevice must have a valid description string');

    // Check if any errors occurred.
    if (errors.length > 0)
        return { success: false, errors: errors };

    // Create ModbusDevice instance.
    const device = new ModbusDevice({ filename, enabled, port, endian, name, vendor, description });
    
    // Check if units are defined.
    if (obj.modbusUnits && Array.isArray(obj.modbusUnits)) {

        // Iterate over units.
        for (const unitObj of obj.modbusUnits) {

            // Try to parse unit.
            const unitResult = unitFromObject(unitObj);
            if (!unitResult.success) {
                errors.push(...unitResult.errors.map(err => `ModbusUnit error: ${err}`));
                continue;
            }

            // Check if unit can be added to the device.
            const unit = unitResult.value;
            if (device.hasUnit(unit.getId())) {
                errors.push(`ModbusUnit with id '${unit.getId()}' already exists in ModbusDevice`);
                continue;
            }

            // Add unit to device.
            device.addUnit(unit);
        }
    }

    // Check if any errors occurred while parsing units.
    if (errors.length > 0)
        return { success: false, errors: errors };

    return { success: true, value: device };
}