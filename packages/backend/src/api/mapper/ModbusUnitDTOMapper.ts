import {
  unitFromObject,
  unitToUnitProps,
} from "../../mapper/ModbusUnitMapper.js";
import { ModbusUnit } from "../../ModbusUnit.js";
import { ParseResult } from "../../types/enums/ParseResult.js";
import { ModbusUnitDTO } from "../dto/ModbusUnitDTO.js";
import { dataPointToDataPointDTO } from "./DataPointDTOMapper.js";

/**
 * Converts a ModbusUnit to a ModbusUnitDTO.
 * @param unit The ModbusUnit to convert.
 * @returns The corresponding ModbusUnitDTO.
 * @throws Error if the unit is invalid.
 */
export function unitToUnitDTO(unit: ModbusUnit): ModbusUnitDTO {
  // Check if unit is valid.
  if (!unit)
    throw new Error("Cannot convert undefined ModbusUnit to ModbusUnitDTO");

  const props = unitToUnitProps(unit);
  const dto: ModbusUnitDTO = {
    ...props,
    dataPoints: unit
      .getAllDataPoints()
      .map((dp) => dataPointToDataPointDTO(dp)),
  };

  return dto;
}

/**
 * Creates a ModbusUnitDTO from a plain object.
 * @param obj Object to convert to ModbusUnitDTO.
 * @returns ParseResult containing the ModbusUnitDTO or errors.
 * @throws Error if the object is invalid.
 */
export function unitDTOFromObject(obj: any): ParseResult<ModbusUnitDTO> {
  // Collect errors.
  const errors: string[] = [];

  // Check if obj is valid.
  if (obj === null || typeof obj !== "object") {
    errors.push("Invalid object for ModbusUnitDTO");
    return { success: false, errors: errors };
  }

  // Try to parse ModbusUnit.
  const unitResult = unitFromObject(obj);
  if (!unitResult.success) {
    errors.push(...unitResult.errors);
    return { success: false, errors: errors };
  }

  // Get props from unit.
  const unit = unitResult.value;
  const unitProps = unitToUnitProps(unit);
  const dto: ModbusUnitDTO = {
    ...unitProps,
  };

  return { success: true, value: dto };
}

/**
 * Creates a ModbusUnit from a ModbusUnitDTO.
 * @param dto ModbusUnitDTO to convert.
 * @returns ParseResult containing the ModbusUnit or errors.
 * @throws Error if the dto is invalid.
 */
export function modbusUnitFromDTO(dto: ModbusUnitDTO): ParseResult<ModbusUnit> {
  // Collect errors.
  const errors: string[] = [];

  // Check if dto is valid.
  if (dto === null || typeof dto !== "object") {
    errors.push("Invalid ModbusUnitDTO object");
    return { success: false, errors: errors };
  }

  const parseResult = unitFromObject(dto);
  if (!parseResult.success) {
    errors.push(...parseResult.errors);
    return { success: false, errors: errors };
  }

  return { success: true, value: parseResult.value };
}
