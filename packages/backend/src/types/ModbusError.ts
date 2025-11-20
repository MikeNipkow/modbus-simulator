/**
 * Enumeration of Modbus exception codes.
 */
export enum ModbusError {
    ILLEGAL_FUNCTION                    = 0x01,
    ILLEGAL_DATA_ADDRESS                = 0x02,
    ILLEGAL_DATA_VALUE                  = 0x03,
    SERVER_DEVICE_FAILURE               = 0x04,
    ACKNOWLEDGE                         = 0x05,
    SERVER_DEVICE_BUSY                  = 0x06,
    NEGATIVE_ACKNOWLEDGE                = 0x07,
    MEMORY_PARITY_ERROR                 = 0x08,
    GATEWAY_PATH_UNAVAILABLE            = 0x0A,
    GATEWAY_TARGET_FAILED_TO_RESPOND    = 0x0B
}