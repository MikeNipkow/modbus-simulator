import { DataType } from "../types/enums/DataType.js";
import { deserializeValue } from "./jsonUtils.js";

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
      throw new Error(
        "Cannot determine register length for ASCII type without string length",
      );

    default:
      return 1;
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
      return "boolean";

    case DataType.Byte:
    case DataType.Int16:
    case DataType.Int32:
    case DataType.UInt16:
    case DataType.UInt32:
    case DataType.Float32:
    case DataType.Float64:
      return "number";

    case DataType.Int64:
    case DataType.UInt64:
      return "bigint";

    case DataType.ASCII:
      return "string";

    default:
      throw new Error(`Unsupported DataType ${type} for JS type mapping`);
  }
}

/**
 * Checks if the given DataType corresponds to a BigInt type.
 * @param type Data type to check.
 * @returns True if the type is Int64 or UInt64, false otherwise.
 */
export function isBigIntType(type: DataType): boolean {
  return type === DataType.Int64 || type === DataType.UInt64;
}

/**
 * Checks if the given DataType corresponds to an integer type.
 * @param type Data type to check.
 * @returns True if the type is an integer type, false otherwise.
 */
export function isIntType(type: DataType): boolean {
  return (
    type === DataType.Byte ||
    type === DataType.Int16 ||
    type === DataType.Int32 ||
    type === DataType.UInt16 ||
    type === DataType.UInt32
  );
}

/**
 * Gets the default value for a given DataType.
 * @param type Data type.
 * @returns Default value corresponding to the data type.
 */
export function getDefaultValueForType(
  type: DataType,
): boolean | number | bigint | string {
  switch (type) {
    case DataType.Bool:
      return false;

    case DataType.Byte:
    case DataType.Int16:
    case DataType.Int32:
    case DataType.UInt16:
    case DataType.UInt32:
    case DataType.Float32:
    case DataType.Float64:
      return 0;

    case DataType.Int64:
    case DataType.UInt64:
    case DataType.Float64:
      return BigInt(0);

    case DataType.ASCII:
      return "";
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
      return -3.4028235e38;
    case DataType.Float64:
      return -1.7976931348623157e308;
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
      return 3.4028235e38;
    case DataType.Float64:
      return 1.7976931348623157e308;

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

/**
 * Deserializes a string value into the appropriate JavaScript type based on the provided DataType.
 * @param value String value to deserialize.
 * @param type Data type to deserialize into.
 * @returns Deserialized value in the appropriate JavaScript type, or null if deserialization fails.
 */
export function deserializeValueForType(
  value: string,
  type: DataType,
): boolean | number | bigint | string | null {
  switch (type) {
    case DataType.Bool:
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
      return null;

    case DataType.Byte:
    case DataType.Int16:
    case DataType.Int32:
    case DataType.UInt16:
    case DataType.UInt32:
    case DataType.Float32:
    case DataType.Float64:
      const num = Number(value);
      if (isNaN(num)) return null;
      return num;

    case DataType.Int64:
    case DataType.UInt64:
      const bigint = deserializeValue(String(value));
      if (typeof bigint !== "bigint") return null;
      return bigint;

    case DataType.ASCII:
      return value;
    default:
      throw new Error(`Unsupported DataType ${type} for deserialization`);
  }
}
