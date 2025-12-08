
/**
 * Represents the result of a parsing operation.
 * It can either be a success with a value of type T,
 * or a failure with an array of error messages.
 */
export type ParseResult<T> = {
    success : true;     // Parsing was successful.
    value   : T;        // The successfully parsed value.
} | {
    success : false;    // Parsing failed.
    errors  : string[]; // Array of error messages if parsing failed.
};