import { ModbusUnit } from "../ModbusUnit.js";
import { toJSON as dpToJSON, fromJSON as dpFromJSON } from "./DataPointMapper.js";
import { ParseResult } from "../types/ParseResult.js";

export function toJSON(unit: ModbusUnit): object {

    return {
        unitId: unit.getId(),
        dataPoints: unit.getAllDataPoints().map(dp => dpToJSON(dp))
    };

}

export function fromJSON(json: any): ParseResult<ModbusUnit> {
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

    const unit = new ModbusUnit(unitId);

    // Parse DataPoints.
    if (json.dataPoints && Array.isArray(json.dataPoints)) {
        for (const dpJson of json.dataPoints) {
            const dpResult = dpFromJSON(dpJson);
            if (!dpResult.success) {
                errors.push(...dpResult.errors.map(err => `DataPoint error: ${err}`));
                continue;
            }

            const dp = dpResult.value;

            // Check if DataPoint can be added to the unit.
            const addResult = unit.addDataPoint(dp);
            if (!addResult.success) {
                errors.push(...addResult.errors);
                continue;
            }
        }
    }
    
    if (errors.length > 0)
        return { success: false, errors: errors };
    
    return { success: true, value: unit };
}