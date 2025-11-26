import { DataPoint } from "../DataPoint.js";
import { DataType } from "../types/enums/DataType.js";

/**
 * Gets the number of Modbus registers required to store a value of the specified data type (except ASCII).
 * @param type Data type.
 * @returns Number of Modbus registers required.
 * @throws Error if the data type is ASCII, as its length depends on the string length.
 */
export function getRegisterLengthFromType(type: DataType): number {
    switch (type) {
        case DataType.Int64:
        case DataType.UInt64: 
        case DataType.Float64:
            return 4;

        case DataType.Int32:
        case DataType.UInt32:
        case DataType.Float32: 
            return 2;

        case DataType.ASCII:
            throw new Error("Cannot determine register length for ASCII type without string length");

        default: return 1;
    }
}

/**
 * Maps a DataType to its corresponding JavaScript type as a string.
 * @param type Data type to map.
 * @returns Corresponding JavaScript type as a string.
 * @throws Error if the data type is unsupported for JS type mapping.
 */
export function getJSTypeFromDataType(type: DataType): string {
    switch (type) {
        case DataType.Bool:
            return 'boolean';

        case DataType.Byte:
        case DataType.Int16:
        case DataType.Int32:
        case DataType.UInt16:
        case DataType.UInt32:
        case DataType.Float32:
        case DataType.Float64:
            return 'number';

        case DataType.Int64:
        case DataType.UInt64:
            return 'bigint';

        case DataType.ASCII:
            return 'string';

        default:
            throw new Error(`Unsupported DataType ${type} for JS type mapping`);
    }
}

/**
 * Gets the default value for a given DataType.
 * @param type Data type.
 * @returns Default value corresponding to the data type.
 */
export function getDefaultValueForType(type: DataType): boolean | number | bigint | string {
    switch (type) {
        case DataType.Bool:
            return false;

        case DataType.Byte:
        case DataType.Int16:
        case DataType.Int32:
        case DataType.UInt16:
        case DataType.UInt32:
        case DataType.Float32:
            return 0;

        case DataType.Int64:
        case DataType.UInt64:
        case DataType.Float64:
            return BigInt(0);

        case DataType.ASCII:
            return '';
    }
}

/**
 * Converts the value of a DataPoint into a DataView for Modbus register storage.
 * @param dataPoint DataPoint to convert.
 * @returns DataView representing the DataPoint's value.
 * @throws Error if the DataType is unsupported for conversion.
 */
export function getDataViewFromValue(dataPoint: DataPoint): DataView {
    // Create DataView for multi-register types.
    const dataView: DataView = new DataView(new ArrayBuffer(dataPoint.getLength() * 2));
    const value = dataPoint.getValue();

    switch (dataPoint.getType()) {
        case DataType.Bool:
            dataView.setUint8(0, (value as boolean) ? 1 : 0);
            return dataView;
        case DataType.Byte:
            dataView.setUint8(0, value as number);
            return dataView;

        case DataType.UInt16:
            dataView.setUint16(0, value as number);
            return dataView;
        case DataType.UInt32:
            dataView.setUint32(0, value as number);
            return dataView;
        case DataType.UInt64:
            dataView.setBigUint64(0, value as bigint);
            return dataView;

        case DataType.Int16:
            dataView.setInt16(0, value as number);
            return dataView;
        case DataType.Int32:
            dataView.setInt32(0, value as number);
            return dataView;
        case DataType.Int64:
            dataView.setBigInt64(0, value as bigint);
            return dataView;
            
        case DataType.Float32:
            dataView.setFloat32(0, value as number);
            return dataView;
        case DataType.Float64:
            dataView.setFloat64(0, value as number);
            return dataView;

        case DataType.ASCII:
            // For ASCII, we need to write each character as 2 bytes (1 register).
            const strValue: string = value as string;
            for (let i = 0; i < dataPoint.getLength() * 2; i++)
                dataView.setUint8(i, strValue.charCodeAt(i));
            return dataView;

        default:
            throw new Error(`Unsupported DataType ${dataPoint.getType()} for DataView conversion`);
    }
}

/**
 * Retrieves a value from a DataView based on the specified DataPoint's type.
 * @param dataView DataView containing the value.
 * @param dataPoint DataPoint defining the type and length.
 * @returns Value extracted from the DataView.
 * @throws Error if the DataType is unsupported for conversion.
 */
export function getValueFromDataView(dataView: DataView, dataPoint: DataPoint): boolean | number | bigint | string {
    switch (dataPoint.getType()) {
        case DataType.Bool:
            return dataView.getUint8(0) !== 1;
        case DataType.Byte:
            return dataView.getUint8(0);

        case DataType.UInt16:
            return dataView.getUint16(0);
        case DataType.UInt32:
            return dataView.getUint32(0);
        case DataType.UInt64:
            return dataView.getBigUint64(0);

        case DataType.Int16:
            return dataView.getInt16(0);
        case DataType.Int32:
            return dataView.getInt32(0);
        case DataType.Int64:
            return dataView.getBigInt64(0);
            
        case DataType.Float32:
            return dataView.getFloat32(0);
        case DataType.Float64:
            return dataView.getFloat64(0);

        case DataType.ASCII:
            // Create the new string.
            let newVal = '';
            for (let i = 0; i < dataPoint.getLength() * 2; i++)
                newVal += String.fromCharCode(dataView.getUint8(i));

            return newVal;

        default:
            throw new Error(`Unsupported DataType ${dataPoint.getType()} for DataView conversion`);
    }
}

/**
 * Gets the minimum value for a given DataType.
 * @param type Data type.
 * @returns Minimum value corresponding to the data type.
 * @throws Error if the DataType does not have a defined minimum value.
 */
export function getMinValueForType(type: DataType): number | bigint {
    switch (type) {
        case DataType.Bool:
        case DataType.Byte:
        case DataType.UInt16:
        case DataType.UInt32:
            return 0;

        case DataType.Int16:
            return -32_768;
        case DataType.Int32:
            return -2_147_483_648;
        case DataType.Int64:
            return -9_223_372_036_854_775_808n;

        case DataType.UInt64:
            return 0n;

            

        case DataType.Float32:
            return -3.4028235e+38;
        case DataType.Float64:
            return -1.7976931348623157e+308;
    }

    throw new Error(`Type ${type} does not have a defined minimum value`);
}

/**
 * Gets the maximum value for a given DataType.
 * @param type Data type.
 * @returns Maximum value corresponding to the data type.
 * @throws Error if the DataType does not have a defined maximum value.
 */
export function getMaxValueForType(type: DataType): number | bigint {
    switch (type) {
        case DataType.Bool:
            return 1;

        case DataType.Byte:
            return 255;

        case DataType.Float32:
            return 3.4028235e+38;
        case DataType.Float64:
            return 1.7976931348623157e+308;

        case DataType.Int16:
            return 32_767;
        case DataType.Int32:
            return 2_147_483_647;
        case DataType.Int64:
            return 9_223_372_036_854_775_807n;
            
        case DataType.UInt16:
            return 65_535;
        case DataType.UInt32:
            return 4_294_967_295;
        case DataType.UInt64:
            return 18_446_744_073_709_551_615n;
    }
    
    throw new Error(`Type ${type} does not have a defined minimum value`);
}