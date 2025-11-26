
/**
 * Serializes a value for JSON storage, converting BigInt to string.
 * @param value Value to serialize.
 * @returns Serialized value.
 */
export function serializeValue(value: boolean | number | bigint | string): boolean | number | bigint | string {
    if (typeof value === 'bigint')
        return value.toString();

    return value;
}

/**
 * Deserializes a value from JSON storage, converting strings back to BigInt when appropriate.
 * @param value Value to deserialize.
 * @returns Deserialized value.
 */
export function deserializeValue(value: boolean | number | bigint | string): boolean | number | bigint | string {
    // Convert numeric strings to BigInt.
    if (typeof value === "string" && /^[0-9-]+$/.test(value)) {
      try {
        return BigInt(value);
      } catch {
        return value; // Fallback, if conversion fails, return original string.
      }
    }

    return value;
}