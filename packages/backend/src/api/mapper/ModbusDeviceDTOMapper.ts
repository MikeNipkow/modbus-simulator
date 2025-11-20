import { ModbusDevice } from "../../ModbusDevice.js";
import { ParseResult } from "../../types/ParseResult.js";
import { ModbusDeviceDTO } from "../dto/ModbusDeviceDTO.js";
import { ModbusUnitDTO } from "../dto/ModbusUnitDTO.js";
import { fromModbusUnit } from "./ModbusUnitDTOMapper.js";
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