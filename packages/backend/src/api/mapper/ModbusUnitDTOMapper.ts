import { ModbusUnit } from "../../ModbusUnit.js";
import { ParseResult } from "../../types/ParseResult.js";
import { DataPointDTO } from "../dto/DataPointDTO.js";
import { ModbusUnitDTO } from "../dto/ModbusUnitDTO.js";
import { fromDataPoint } from "./DataPointDTOMapper.js";
import { fromJSON as dataPointFromJSON } from "./DataPointDTOMapper.js";

export function fromModbusUnit(unit: ModbusUnit): ModbusUnitDTO {
    return {
        id          : unit.getId(),
        dataPoints  : unit.getAllDataPoints().map(dp => fromDataPoint(dp))
    };
}

export function fromJSON(json: any): ParseResult<ModbusUnitDTO> {
    const errors: string[] = [];
    
    if (json === null || typeof json !== 'object') {
        errors.push('Invalid JSON object for ModbusUnit');
        return { success: false, errors: errors };
    }

    if (json.unitId === undefined || typeof json.unitId !== 'number')   errors.push('ModbusUnit must have a valid unitId');

    if (errors.length > 0)
        return { success: false, errors: errors };

    // Check Unit ID.
    const unitId: number = json.unitId;
    if (unitId < 1 || unitId > 254) {
        errors.push('ModbusUnit unitId must be between 1 and 254');
        return { success: false, errors: errors };
    }

    const dataPoints: DataPointDTO[] = [];

    // Parse DataPoints.
    if (json.dataPoints && Array.isArray(json.dataPoints)) {
        for (const dpJson of json.dataPoints) {
            const dpResult = dataPointFromJSON(dpJson);
            if (!dpResult.success) {
                errors.push(...dpResult.errors.map(err => `DataPoint error: ${err}`));
                continue;
            }

            const dp = dpResult.value;
            dataPoints.push(dp);
        }
    }
    
    if (errors.length > 0)
        return { success: false, errors: errors };

    const unitDTO = {
        id: unitId,
        dataPoints: dataPoints
    };
    
    return { success: true, value: unitDTO };
}