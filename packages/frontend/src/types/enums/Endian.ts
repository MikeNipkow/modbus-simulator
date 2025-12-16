/**
 * Enumeration of endianness options for the modbus registers.
 */
export enum Endian {
  BigEndian = "BigEndian", // Most significant register first (for multi-register data types).
  LittleEndian = "LittleEndian", // Least significant register first (for multi-register data types).
}
