/**
 * Enumeration of Modbus exception codes.
 */
export enum ModbusError {
    ILLEGAL_FUNCTION                    = 0x01, // The function code received in the query is not recognized or allowed by the server.
    ILLEGAL_DATA_ADDRESS                = 0x02, // The data address received in the query is not an allowable address for the server.
    ILLEGAL_DATA_VALUE                  = 0x03, // A value contained in the query data field is not an allowable value for the server.
    SERVER_DEVICE_FAILURE               = 0x04, // An unrecoverable error occurred while the server was attempting to perform the requested action.
    ACKNOWLEDGE                         = 0x05, // The server has accepted the request and is processing it, but a long duration of time is required to do so.
    SERVER_DEVICE_BUSY                  = 0x06, // The server is busy processing a long-duration command.
    NEGATIVE_ACKNOWLEDGE                = 0x07, // The server cannot perform the program function received in the query.
    MEMORY_PARITY_ERROR                 = 0x08, // The server detected a parity error in memory.
    GATEWAY_PATH_UNAVAILABLE            = 0x0A, // The gateway path is unavailable.
    GATEWAY_TARGET_FAILED_TO_RESPOND    = 0x0B  // The gateway target failed to respond.
}