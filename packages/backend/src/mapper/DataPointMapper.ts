import { DataPoint } from "../DataPoint.js";
import { AccessMode } from "../types/enums/AccessMode.js";
import { DataArea } from "../types/enums/DataArea.js";
import { DataPointProps } from "../types/DataPointProps.js";
import { DataType } from "../types/enums/DataType.js";
import { deserializeValue, getMaxValueForType, getMinValueForType, serializeValue } from "../util/modbusUtils.js";
import { ParseResult } from "../types/enums/ParseResult.js";

export function toJSON(dataPoint: DataPoint): DataPointProps {
    const json: DataPointProps = {
        id                  : dataPoint.getId(),
        areas               : dataPoint.getAreas(),
        type                : dataPoint.getType(),
        address             : dataPoint.getAddress(),
        accessMode          : dataPoint.getAccessMode(),
        defaultValue        : serializeValue(dataPoint.getDefaultValue()),
        name                : dataPoint.getName(),
        unit                : dataPoint.getUnit()
    }

    // Include length only for ASCII type.
    if (dataPoint.getType() === DataType.ASCII)
        json.length = dataPoint.getLength();

    // Include simulation only for non-ASCII types.
    if (dataPoint.getType() !== DataType.ASCII)
        json.simulation = dataPoint.getSimulation();

    // Include feedbackDataPoint if exists.
    if (dataPoint.hasFeedbackDataPoint())
        json.feedbackDataPoint = dataPoint.getFeedbackDataPoint() as string;

    return json;
}

export function fromJSON(json: any): ParseResult<DataPoint> {
    const errors: string[] = [];

    if (json === null || typeof json !== 'object') {
        errors.push('Invalid JSON object for DataPoint');
        return { success: false, errors: errors };
    }

    if (!json.id || typeof json.id !== 'string')                                                                    errors.push('DataPoint must have a valid id');
    if (!json.areas || !Array.isArray(json.areas))                                                                  errors.push('DataPoint must have valid areas');
    if (json.type === undefined || !Object.values(DataType).includes(json.type))                                    errors.push('DataPoint must have a valid type');
    if (json.address === undefined || typeof json.address !== 'number' || json.address < 0 || json.address > 65535) errors.push('DataPoint must have a valid address');
    if (json.accessMode === undefined || !Object.values(AccessMode).includes(json.accessMode))                      errors.push('DataPoint must have a valid accessMode');

    if (errors.length > 0)
        return { success: false, errors: errors };

    // Check for length if type is ASCII.
    if (json.type === DataType.ASCII) {
        if (typeof json.length !== "number" || json.length < 1)
            errors.push('DataPoint of type ASCII must have a valid length greater than 0');
        else if (json.defaultValue !== undefined && json.defaultValue.length/2 > json.length)
            errors.push('DataPoint defaultValue length exceeds defined length');
    }

    // Check areas.
    for (const area of json.areas) {
        if (!Object.values(DataArea).includes(area)) {
            errors.push(`Invalid DataArea '${area}' in DataPoint areas`);
            continue
        }

        if ((area === DataArea.DiscreteInput || area === DataArea.InputRegister) && json.areas.length === 1 && json.accessMode !== AccessMode.ReadOnly)
            errors.push('DataPoint in DiscreteInputs and InputRegisters can only have ReadOnly accessMode');
        else if (json.type !== DataType.Bool && (area === DataArea.Coil || area === DataArea.DiscreteInput))
            errors.push('DataPoint of type other than Bool cannot be in Coils or DiscreteInputs areas');
    }

    // Check simulation props.
    if (json.type !== DataType.ASCII && json.simulation) {
        if (typeof json.simulation !== 'object')
            errors.push('DataPoint simulation must be an object');
        else {
            if (json.simulation.minValue === undefined || json.simulation.maxValue === undefined) {
                errors.push('DataPoint simulation must have minValue and maxValue defined');
            } else if (json.simulation.minValue < getMinValueForType(json.type))
                errors.push(`DataPoint simulation minValue is out of range for type ${json.type} in data point '${json.id}'`);
            else if (json.simulation.maxValue > getMaxValueForType(json.type))
                errors.push(`DataPoint simulation maxValue is out of range for type ${json.type} in data point '${json.id}`);
        }
        
    }

    // Return errors if any.
    if (errors.length > 0) {
        return {
            success : false,
            errors  : errors
        };
    }

    const props: DataPointProps = {
        id                  : json.id,
        areas               : json.areas,
        type                : json.type,
        address             : json.address,
        accessMode          : json.accessMode,
        defaultValue        : deserializeValue(json.defaultValue),
        name                : json.name,
        unit                : json.unit,
        simulation          : json.simulation,
        feedbackDataPoint   : json.feedbackDataPoint,
        length              : json.length
    };

    return {
        success : true,
        value   : new DataPoint(props)
    }
}