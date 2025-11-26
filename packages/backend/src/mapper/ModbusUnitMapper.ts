import { ModbusUnit } from "../ModbusUnit.js";
import { ParseResult } from "../types/enums/ParseResult.js";
import { ModbusUnitProps } from "../types/ModbusUnitProps.js";
import { dataPointFromObject, dataPointToDataPointProps } from "./DataPointMapper.js";

/**
 * Maps a ModbusUnit to its ModbusUnitProps representation.
 * @param unit ModbusUnit to map.
 * @returns ModbusUnitProps representation of the ModbusUnit.
 * @throws Error if the ModbusUnit is invalid.
 */
export function unitToUnitProps(unit: ModbusUnit): ModbusUnitProps {
    // Check if unit is valid.
    if (!unit)
        throw new Error("Invalid ModbusUnit");

    return {
        unitId      : unit.getId(),
        dataPoints  : unit.getAllDataPoints().map(dp => dataPointToDataPointProps(dp))
    };
}

/**
 * Creates a ModbusUnit from a plain object, validating its properties.
 * @param obj Object to convert to ModbusUnit.
 * @returns ParseResult containing the ModbusUnit or errors.
 */
export function unitFromObject(obj: any): ParseResult<ModbusUnit> {
    // Collect errors.
    const errors: string[] = [];

    // Check if unit is valid.
    if (obj === null || typeof obj !== 'object') {
        errors.push('Invalid object for ModbusUnit');
        return { success: false, errors: errors };
    }

    // Check Unit ID.
    const unitId: number = obj.unitId;
    if (unitId === undefined || unitId < 1 || unitId > 254) {
        errors.push('ModbusUnit unitId must be between 1 and 254');
        return { success: false, errors: errors };
    }

    // Create ModbusUnit instance.
    const unit = new ModbusUnit({ unitId });

    // Check if DataPoints are defined.
    if (obj.dataPoints && Array.isArray(obj.dataPoints)) {

        // Iterate over DataPoints.
        for (const dpObj of obj.dataPoints) {

            // Try to parse DataPoint.
            const dpResult = dataPointFromObject(dpObj);
            if (!dpResult.success) {
                errors.push(...dpResult.errors.map(err => `DataPoint error: ${err}`));
                continue;
            }
            
            // Check if DataPoint can be added to the unit.
            const dp        = dpResult.value;
            const addResult = unit.addDataPoint(dp);
            if (!addResult.success) {
                errors.push(...addResult.errors);
                continue;
            }
        }
    }

    // Check if any errors occurred while parsing DataPoints.
    if (errors.length > 0)
        return { success: false, errors: errors };

    return { success: true, value: unit };
}