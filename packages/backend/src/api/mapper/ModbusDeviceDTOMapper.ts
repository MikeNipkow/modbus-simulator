import { error } from "console";
import { ModbusDevice } from "../../ModbusDevice.js";
import { ModbusUnit } from "../../ModbusUnit.js";
import { ParseResult } from "../../types/ParseResult.js";
import { ModbusDeviceDTO } from "../dto/ModbusDeviceDTO.js";
import { ModbusUnitDTO } from "../dto/ModbusUnitDTO.js";
import { fromModbusUnit, modbusUnitFromDTO } from "./ModbusUnitDTOMapper.js";
import { fromJSON as unitFromJSON } from "./ModbusUnitDTOMapper.js";

export function fromModbusDevice(device: ModbusDevice): ModbusDeviceDTO {
    return {
        fileName    : device.getId(),
        enabled     : device.isEnabled(),
        port        : device.getPort(),
        endian      : device.getEndian(),
        name        : device.getName(),
        vendor      : device.getVendor(),
        description : device.getDescription(),
        units       : device.getAllUnits().map(unit => fromModbusUnit(unit)),
        running     : device.isRunning()
    };
}

export function fromJSON(json: any): ParseResult<ModbusDeviceDTO> {
    const errors: string[] = [];
    
        if (json === null || typeof json !== 'object') {
            errors.push('Invalid JSON object for ModbusDevice');
            return { success: false, errors: errors };
        }
    
        if (json.id === undefined || typeof json.id !== 'string' || json.id.length === 0)   errors.push('ModbusDevice must have a valid id string');
        if (json.enabled === undefined || typeof json.enabled !== 'boolean')                errors.push('ModbusDevice must have a valid enabled boolean');
        if (json.port === undefined || typeof json.port !== 'number')                       errors.push('ModbusDevice must have a valid port number');
        if (json.endian === undefined || typeof json.endian !== 'string')                   errors.push('ModbusDevice must have a valid endian string');
        if (json.name === undefined || typeof json.name !== 'string')                       errors.push('ModbusDevice must have a valid name string');
        if (json.vendor === undefined || typeof json.vendor !== 'string')                   errors.push('ModbusDevice must have a valid vendor string');
        if (json.description === undefined || typeof json.description !== 'string')         errors.push('ModbusDevice must have a valid description string');
        if (json.running === undefined || typeof json.running !== 'boolean')                errors.push('ModbusDevice must have a valid running boolean');

        if (errors.length > 0)
            return { success: false, errors: errors };
    
        const id            = json.id;
        const enabled       = json.enabled;
        const port          = json.port;
        const endian        = json.endian;
        const name          = json.name;
        const vendor        = json.vendor;
        const description   = json.description;

        if (port < 1 || port > 65535) {
            errors.push('ModbusDevice port must be between 1 and 65535');
            return { success: false, errors: errors };
        }
    
        const deviceDTO = {
            fileName    : id,
            enabled     : enabled,
            port        : port,
            endian      : endian,
            name        : name,
            vendor      : vendor,
            description : description,
            units       : [] as ModbusUnitDTO[],
            running     : json.running
        };
    
        // Parse Units.
        if (json.units && Array.isArray(json.units)) {
            for (const unitJson of json.units) {
                const unitResult = unitFromJSON(unitJson);
                if (!unitResult.success) {
                    errors.push(...unitResult.errors.map(err => `ModbusUnit error: ${err}`));
                    continue;
                }
    
                const unitDTO = unitResult.value;
                deviceDTO.units.push(unitDTO);
            }
        }
    
        if (errors.length > 0)
            return { success: false, errors: errors };
    
        return { success: true, value: deviceDTO };
}

export function modbusDeviceFromDTO(dto: ModbusDeviceDTO): ParseResult<ModbusDevice> {
    const errors: string[] = [];

    if (dto === null || typeof dto !== 'object') {
        errors.push('Invalid object for ModbusDeviceDTO');
        return { success: false, errors: errors };
    }

    if (dto.fileName === undefined || typeof dto.fileName !== 'string' || dto.fileName.length === 0)   errors.push('ModbusDeviceDTO must have a valid fileName string');
    if (dto.enabled === undefined || typeof dto.enabled !== 'boolean')                                 errors.push('ModbusDeviceDTO must have a valid enabled boolean');
    if (dto.port === undefined || typeof dto.port !== 'number')                                        errors.push('ModbusDeviceDTO must have a valid port number');
    if (dto.endian === undefined || typeof dto.endian !== 'string')                                    errors.push('ModbusDeviceDTO must have a valid endian string');
    if (dto.name === undefined || typeof dto.name !== 'string')                                        errors.push('ModbusDeviceDTO must have a valid name string');
    if (dto.vendor === undefined || typeof dto.vendor !== 'string')                                    errors.push('ModbusDeviceDTO must have a valid vendor string');
    if (dto.description === undefined || typeof dto.description !== 'string')                          errors.push('ModbusDeviceDTO must have a valid description string');

    if (errors.length > 0)
        return { success: false, errors: errors };

    if (dto.port < 1 || dto.port > 65535) {
        errors.push('ModbusDeviceDTO port must be between 1 and 65535');
        return { success: false, errors: errors };
    }

    const units: ModbusUnit[] = [];

    if (dto.units && Array.isArray(dto.units)) {
        for (const unitDTO of dto.units) {
            const unitResult = modbusUnitFromDTO(unitDTO);
            if (!unitResult.success) {
                errors.push(...unitResult.errors);
                continue;
            }

            units.push(unitResult.value);
        }
    }

    if (errors.length > 0)
        return { success: false, errors: errors };

    const device = new ModbusDevice(
        dto.fileName,
        dto.enabled,
        dto.port,
        dto.endian,
        dto.name,
        dto.vendor,
        dto.description
    );

    // Try to add units to device.
    for (const unit of units) {
        if (!device.addUnit(unit)) {
            errors.push(`Failed to add unit with id ${unit.getId()} to device ${device.getId()}`);
            return { success: false, errors: errors };
        }
    }

    return { success: true, value: device };
}