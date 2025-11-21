import { json } from "stream/consumers";
import { DataPoint } from "../../DataPoint.js";
import { AccessMode } from "../../types/AccessMode.js";
import { DataArea } from "../../types/DataArea.js";
import { DataType } from "../../types/DataType.js";
import { ParseResult } from "../../types/ParseResult.js";
import { getMinValueForType, getMaxValueForType, serializeValue, deserializeValue, getJSTypeFromDataType } from "../../util/modbusUtils.js";
import { DataPointDTO } from "../dto/DataPointDTO.js";
import { DataPointProps } from "../../types/DataPointProps.js";

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
    if (!json.areas || !Array.isArray(json.areas))                                                                  errors.push(`DataPointDTO for id ${json.id} must have valid areas`);
    if (json.type === undefined || !Object.values(DataType).includes(json.type))                                    errors.push(`DataPointDTO for id ${json.id} must have a valid type`);
    if (json.address === undefined || typeof json.address !== 'number' || json.address < 0 || json.address > 65535) errors.push(`DataPointDTO for id ${json.id} must have a valid address`);
    if (json.accessMode === undefined || !Object.values(AccessMode).includes(json.accessMode))                      errors.push(`DataPointDTO for id ${json.id} must have a valid accessMode`);
    if (json.defaultValue === undefined)                                                                            errors.push(`DataPointDTO for id ${json.id} must have a valid defaultValue`);
    if (json.value === undefined)                                                                                   errors.push(`DataPointDTO for id ${json.id} must have a valid value`);

    if (errors.length > 0)
        return { success: false, errors: errors };

    const defaultValue = deserializeValue(json.defaultValue);
    const value = deserializeValue(json.value);

    if (typeof defaultValue !== getJSTypeFromDataType(json.type))
        errors.push(`DataPointDTO defaultValue type ${typeof defaultValue} does not match DataType for data point '${json.id}'`);
    if (typeof value !== getJSTypeFromDataType(json.type))
        errors.push(`DataPointDTO value type ${typeof defaultValue} does not match DataType for data point '${json.id}'`);

    if (errors.length > 0)
        return { success: false, errors: errors };

    if (json.type === DataType.ASCII) {
        if (typeof json.length !== "number" || json.length < 1)
            errors.push('DataPointDTO of type ASCII must have a valid length greater than 0');
        else if (json.defaultValue.length/2 > json.length)
            errors.push('DataPointDTO defaultValue length exceeds defined length');
        else if (json.value.length/2 > json.length)
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

export function dataPointFromDTO(dto: DataPointDTO): ParseResult<DataPoint> {
    const errors: string[] = [];

    if (dto === null || typeof dto !== 'object') {
        errors.push('Invalid object for DataPointProps');
        return { success: false, errors: errors };
    }

if (!dto.id || typeof dto.id !== 'string')                                                                      errors.push('DataPointProps must have a valid id');
    if (!dto.areas || !Array.isArray(dto.areas))                                                                errors.push('DataPointProps must have valid areas');
    if (dto.type === undefined || !Object.values(DataType).includes(dto.type))                                  errors.push('DataPointProps must have a valid type');
    if (dto.address === undefined || typeof dto.address !== 'number' || dto.address < 0 || dto.address > 65535) errors.push('DataPointProps must have a valid address');
    if (dto.accessMode === undefined || !Object.values(AccessMode).includes(dto.accessMode))                    errors.push('DataPointProps must have a valid accessMode');
    if (errors.length > 0)
        return { success: false, errors: errors };

    if (dto.type === DataType.ASCII) {
        if (typeof dto.length !== "number" || dto.length < 1)
            errors.push('DataPointProps of type ASCII must have a valid length greater than 0');
        else if (dto.defaultValue !== undefined && typeof dto.defaultValue === "string" && dto.defaultValue.length/2 > dto.length)
            errors.push('DataPointProps defaultValue length exceeds defined length');
        else if (dto.value !== undefined && typeof dto.value === "string" && dto.value.length/2 > dto.length)
            errors.push('DataPointProps value length exceeds defined length');
    }
    
    for (const area of dto.areas) {
        if (!Object.values(DataArea).includes(area)) {
            errors.push(`Invalid DataArea '${area}' in DataPointProps areas`);
            continue
        }

        if ((area === DataArea.DiscreteInput || area === DataArea.InputRegister) && dto.areas.length === 1 && dto.accessMode !== AccessMode.ReadOnly) {
            errors.push(`DataPointProps address must be even for ASCII area`);
        } else if (dto.type !== DataType.Bool && (area === DataArea.Coil || area === DataArea.DiscreteInput)) {
            errors.push('DataPointProps of type other than Bool cannot be in Coils or DiscreteInputs areas');
        }
    }

    if (dto.type !== DataType.ASCII && dto.simulation) {
        if (typeof dto.simulation !== 'object') {
            errors.push('DataPointProps simulation must be an object');
        } else {
            if (dto.simulation.minValue === undefined || dto.simulation.maxValue === undefined) {
                errors.push('DataPointProps simulation must have minValue and maxValue defined');
            } else if (dto.simulation.minValue < getMinValueForType(dto.type))
                errors.push(`DataPointProps simulation minValue is out of range for type ${dto.type} in data point '${dto.id}'`);
            else if (dto.simulation.maxValue > getMaxValueForType(dto.type))
                errors.push(`DataPointProps simulation maxValue is out of range for type ${dto.type} in data point '${dto.id}'`);
        }
    }

    if (errors.length > 0)
        return { success: false, errors: errors };

    const props: DataPointProps = {
        id                  : dto.id,
        areas               : dto.areas,
        type                : dto.type,
        address             : dto.address,
        accessMode          : dto.accessMode,
        length              : dto.length,
        defaultValue        : dto.defaultValue,
        name                : dto.name,
        unit                : dto.unit,
        simulation          : dto.simulation
    };

    if (dto.feedbackDataPoint && typeof dto.feedbackDataPoint === 'string')
        props.feedbackDataPoint = dto.feedbackDataPoint;

    return { success: true, value: new DataPoint(props) };
}