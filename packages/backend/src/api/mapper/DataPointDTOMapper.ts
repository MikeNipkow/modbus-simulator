import { DataPoint } from "../../DataPoint.js";
import { AccessMode } from "../../types/AccessMode.js";
import { DataArea } from "../../types/DataArea.js";
import { DataType } from "../../types/DataType.js";
import { ParseResult } from "../../types/ParseResult.js";
import { getMinValueForType, getMaxValueForType, serializeValue, deserializeValue } from "../../util/modbusUtils.js";
import { DataPointDTO } from "../dto/DataPointDTO.js";

export function fromDataPoint(dp: DataPoint): DataPointDTO {
    const dto: DataPointDTO = {
        id                  : dp.getId(),
        areas               : dp.getAreas(),
        type                : dp.getType(),
        address             : dp.getAddress(),
        accessMode          : dp.getAccessMode(),
        length              : dp.getLength(),
        defaultValue        : serializeValue(dp.getDefaultValue()),
        value               : serializeValue(dp.getValue()),
        name                : dp.getName(),
        unit                : dp.getUnit(),
        simulation          : dp.getSimulation()
    };

    if (dp.hasFeedbackDataPoint())
        dto.feedbackDataPoint = dp.getFeedbackDataPoint() as string;

    return dto;
}

export function fromJSON(json: any): ParseResult<DataPointDTO> {
    const errors: string[] = [];

    if (json === null || typeof json !== 'object') {
        errors.push('Invalid object for DataPointDTO');
        return { success: false, errors: errors };
    }

    if (!json.id || typeof json.id !== 'string')                                                                    errors.push('DataPointDTO must have a valid id');
    if (!json.areas || !Array.isArray(json.areas))                                                                  errors.push('DataPointDTO must have valid areas');
    if (json.type === undefined || !Object.values(DataType).includes(json.type))                                    errors.push('DataPointDTO must have a valid type');
    if (json.address === undefined || typeof json.address !== 'number' || json.address < 0 || json.address > 65535) errors.push('DataPointDTO must have a valid address');
    if (json.accessMode === undefined || !Object.values(AccessMode).includes(json.accessMode))                      errors.push('DataPointDTO must have a valid accessMode');

    if (errors.length > 0)
        return { success: false, errors: errors };

    if (json.type === DataType.ASCII) {
        if (typeof json.length !== "number" || json.length < 1)
            errors.push('DataPointDTO of type ASCII must have a valid length greater than 0');
        else if (json.defaultValue !== undefined && json.defaultValue.length/2 > json.length)
            errors.push('DataPointDTO defaultValue length exceeds defined length');
        else if (json.value !== undefined && json.value.length/2 > json.length)
            errors.push('DataPointDTO value length exceeds defined length');
    }
    
    for (const area of json.areas) {
        if (!Object.values(DataArea).includes(area)) {
            errors.push(`Invalid DataArea '${area}' in DataPointDTO areas`);
            continue
        }

        if ((area === DataArea.DiscreteInput || area === DataArea.InputRegister) && json.areas.length === 1 && json.accessMode !== AccessMode.ReadOnly) {
            errors.push(`DataPointDTO address must be even for ASCII area`);
        } else if (json.type !== DataType.Bool && (area === DataArea.Coil || area === DataArea.DiscreteInput)) {
            errors.push('DataPoint of type other than Bool cannot be in Coils or DiscreteInputs areas');
        }
    }

    if (json.type !== DataType.ASCII && json.simulation) {
        if (typeof json.simulation !== 'object') {
            errors.push('DataPointDTO simulation must be an object');
        } else {
            if (json.simulation.minValue === undefined || json.simulation.maxValue === undefined) {
                errors.push('DataPointDTO simulation must have minValue and maxValue defined');
            } else if (json.simulation.minValue < getMinValueForType(json.type))
                errors.push(`DataPointDTO simulation minValue is out of range for type ${json.type} in data point '${json.id}'`);
            else if (json.simulation.maxValue > getMaxValueForType(json.type))
                errors.push(`DataPointDTO simulation maxValue is out of range for type ${json.type} in data point '${json.id}'`);
        }
    }

    if (errors.length > 0)
        return { success: false, errors: errors };

    const dto: DataPointDTO = {
        id                  : json.id,
        areas               : json.areas,
        type                : json.type,
        address             : json.address,
        accessMode          : json.accessMode,
        length              : json.length,
        defaultValue        : deserializeValue(json.defaultValue),
        value               : deserializeValue(json.value),
        name                : json.name,
        unit                : json.unit,
        simulation          : json.simulation
    };

    if (json.feedbackDataPoint && typeof json.feedbackDataPoint === 'string')
        dto.feedbackDataPoint = json.feedbackDataPoint;

    return { success: true, value: dto };
}