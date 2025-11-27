import { DataPoint } from "../../DataPoint.js";
import { ParseResult } from "../../types/enums/ParseResult.js";
import { getJSTypeFromDataType } from "../../util/modbusUtils.js";
import { DataPointDTO } from "../dto/DataPointDTO.js";
import { dataPointFromObject, dataPointToDataPointProps } from "../../mapper/DataPointMapper.js";
import { serializeValue } from "../../util/jsonUtils.js";

/**
 * Converts a DataPoint to a DataPointDTO.
 * @param dp The DataPoint to convert.
 * @returns The corresponding DataPointDTO.
 * @throws Error if the DataPoint is undefined.
 */
export function dataPointToDataPointDTO(dp: DataPoint): DataPointDTO {
    // Check if data point is valid.
    if (!dp)
        throw new Error('Cannot convert undefined DataPoint to DataPointDTO');

    // Map properties.
    const props = dataPointToDataPointProps(dp);

    // Add DTO specific value serialization.
    const dto: DataPointDTO = {
        ...props,
        value: serializeValue(dp.getValue())
    };

    return dto;
}

/**
 * Creates a DataPointDTO from a plain object.
 * @param obj Object to convert to DataPointDTO.
 * @returns ParseResult containing the DataPointDTO or errors.
 * @throws Error if the object is invalid.
 */
export function dataPointDTOFromObject(obj: any): ParseResult<DataPointDTO> {
    // Collect errors.
    const errors: string[] = [];

    // Check if obj is valid.
    if (obj === null || typeof obj !== 'object') {
        errors.push('Invalid object for DataPointDTO');
        return { success: false, errors: errors };
    }

    // Try to parse props of the DataPointProps.
    const propsResult = dataPointFromObject(obj);
    if (!propsResult.success) {
        errors.push(...propsResult.errors);
        return { success: false, errors: errors };
    }

    // Create DTO from props.
    const dp = propsResult.value;
    const props = dataPointToDataPointProps(dp);
    const dto: DataPointDTO = {
        ...props
    };

    // Check if value is defined.
    const value = obj.value;
    if (value !== undefined) {
        // Validate value type.
        if (typeof value !== getJSTypeFromDataType(dp.getType())) {
            errors.push(`DataPointDTO value type ${typeof value} does not match DataType for data point '${dp.getId()}'`);
            return { success: false, errors: errors };
        }

        // Add serialized value.
        dto.value = serializeValue(value);
    }

    return { success: true, value: dto };
}

/**
 * Creates a DataPoint from a DataPointDTO.
 * @param dto The DataPointDTO to convert.
 * @returns ParseResult containing the DataPoint or errors.
 * @throws Error if the DataPointDTO is invalid.
 */
export function dataPointFromDTO(dto: DataPointDTO): ParseResult<DataPoint> {
    // Collect errors.
    const errors: string[] = [];

    // Check if dto is valid.
    if (dto === null || typeof dto !== 'object') {
        errors.push('Invalid object for DataPointDTO');
        return { success: false, errors: errors };
    }

    // Try to parse DataPoint from props.
    const propsResult = dataPointFromObject(dto);
    if (!propsResult.success) {
        errors.push(...propsResult.errors);
        return { success: false, errors: errors };
    }
    const dataPoint = propsResult.value;

    // Check if value is defined.
    const value = dto.value;
    if (value !== undefined) {
        // Validate value type.
        if (typeof value !== getJSTypeFromDataType(dataPoint.getType())) {
            errors.push(`DataPointDTO value type ${typeof value} does not match DataType for data point '${dataPoint.getId()}'`);
            return { success: false, errors: errors };
        }

        // Set value.
        dataPoint.setValue(value);
    }

    return { success: true, value: dataPoint };
}