import { AccessMode } from "../types/enums/AccessMode.js";
import { DataArea } from "../types/enums/DataArea.js";
import { DataPointProps } from "../types/DataPointProps.js";
import { DataType } from "../types/enums/DataType.js";
import {
  getJSTypeFromDataType,
  getMaxValueForType,
  getMinValueForType,
} from "../util/modbusUtils.js";
import { ParseResult } from "../types/enums/ParseResult.js";
import { serializeValue, deserializeValue } from "../util/jsonUtils.js";
import { DataPoint } from "../classes/DataPoint.js";

/**
 * Maps a DataPoint to its DataPointProps representation.
 * @param dataPoint DataPoint to map.
 * @returns DataPointProps representation of the DataPoint.
 * @throws Error if the DataPoint is invalid.
 */
export function dataPointToDataPointProps(
  dataPoint: DataPoint,
): DataPointProps {
  // Check if dataPoint is valid.
  if (!dataPoint) throw new Error("Invalid DataPoint");

  const props: DataPointProps = {
    id: dataPoint.getId(),
    areas: dataPoint.getAreas(),
    type: dataPoint.getType(),
    address: dataPoint.getAddress(),
    accessMode: dataPoint.getAccessMode(),

    defaultValue: serializeValue(dataPoint.getDefaultValue()),

    name: dataPoint.getName(),
    unit: dataPoint.getUnit(),

    simulation: dataPoint.getSimulation(),
  };

  // Add length if type is ASCII.
  if (dataPoint.getType() === DataType.ASCII)
    props.length = dataPoint.getLength();

  // Add feedbackDataPoint if defined.
  if (dataPoint.hasFeedbackDataPoint())
    props.feedbackDataPoint = dataPoint.getFeedbackDataPoint() as string;

  return props;
}

/**
 * Creates a DataPoint from a plain object, validating its properties.
 * @param obj Object to convert to DataPoint.
 * @returns ParseResult containing the DataPoint or errors.
 */
export function dataPointFromObject(obj: any): ParseResult<DataPoint> {
  // Array of errors.
  const errors: string[] = [];

  // Check if obj is valid.
  if (obj === null || typeof obj !== "object") {
    errors.push("Invalid object for DataPoint");
    return { success: false, errors: errors };
  }

  // Check if id is valid.
  if (!obj.id || typeof obj.id !== "string")
    errors.push("DataPoint must have a valid id");

  // Check if areas are valid.
  if (!obj.areas || !Array.isArray(obj.areas))
    errors.push("DataPoint must have valid areas");

  // Validate each area.
  if (Array.isArray(obj.areas)) {
    // Check each area.
    for (const area of obj.areas) {
      // Validate area.
      if (!Object.values(DataArea).includes(area)) {
        errors.push(`Invalid DataArea '${area}' in DataPoint areas`);
        continue;
      }

      // Specific area validations.
      if (
        (area === DataArea.DiscreteInput || area === DataArea.InputRegister) &&
        obj.areas.length === 1 &&
        obj.accessMode !== AccessMode.ReadOnly
      )
        errors.push(
          "DataPoint in DiscreteInputs and InputRegisters can only have ReadOnly accessMode",
        );
      else if (
        obj.type !== DataType.Bool &&
        (area === DataArea.Coil || area === DataArea.DiscreteInput)
      )
        errors.push(
          "DataPoint of type other than Bool cannot be in Coils or DiscreteInputs areas",
        );
    }
  }

  // Check if type is valid.
  if (obj.type === undefined || !Object.values(DataType).includes(obj.type))
    errors.push("DataPoint must have a valid type");

  // Check if address is valid.
  if (
    obj.address === undefined ||
    typeof obj.address !== "number" ||
    obj.address < 0 ||
    obj.address > 65535
  )
    errors.push("DataPoint must have a valid address");

  // Check if accessMode is valid.
  if (
    obj.accessMode === undefined ||
    !Object.values(AccessMode).includes(obj.accessMode)
  )
    errors.push("DataPoint must have a valid accessMode");

  // Return errors if any.
  if (errors.length > 0) return { success: false, errors: errors };

  // Check if defaultValue is valid for type.
  let defaultValue = obj.defaultValue;
  if (obj.defaultValue !== undefined) {
    defaultValue = deserializeValue(obj.defaultValue);
    if (typeof defaultValue !== getJSTypeFromDataType(obj.type)) {
      errors.push(
        `DataPoint defaultValue type does not match DataType ${obj.type}`,
      );
      return { success: false, errors: errors };
    }
  }

  // ~~~~~ Create DataPointProps ~~~~~

  const id = obj.id;
  const areas = obj.areas;
  const type = obj.type;
  const address = obj.address;
  const accessMode = obj.accessMode;
  const name = obj.name;
  const unit = obj.unit;

  // Create DataPointProps.
  const props: DataPointProps = {
    id: id,
    areas: areas,
    type: type,
    address: address,
    accessMode: accessMode,
    defaultValue: defaultValue,
    name: name,
    unit: unit,
  };

  // Add length if type is ASCII.
  if (obj.type === DataType.ASCII) {
    // Validate length.
    if (typeof obj.length !== "number" || obj.length < 1) {
      errors.push(
        "DataPoint of type ASCII must have a valid length greater than 0",
      );
      return { success: false, errors: errors };
    }

    // Validate defaultValue length.
    const length = obj.length;
    if ((defaultValue as string).length / 2 > length) {
      errors.push("DataPoint defaultValue length exceeds defined length");
      return { success: false, errors: errors };
    }

    // Set length in props.
    props.length = obj.length;
  }

  // Add simulation if provided.
  if (obj.simulation !== undefined && obj.type !== DataType.ASCII) {
    // Validate simulation object.
    if (typeof obj.simulation !== "object") {
      errors.push("DataPoint simulation must be an object");
      return { success: false, errors: errors };
    }

    // Check if enabled is provided.
    if (
      obj.simulation.enabled === undefined ||
      typeof obj.simulation.enabled !== "boolean"
    ) {
      errors.push(
        "DataPoint simulation must have enabled property of type boolean",
      );
      return { success: false, errors: errors };
    }

    // Check minValue and maxValue.
    const minValue = obj.simulation.minValue;
    const maxValue = obj.simulation.maxValue;
    if (minValue === undefined || maxValue === undefined) {
      errors.push(
        "DataPoint simulation must have minValue and maxValue defined",
      );
      return { success: false, errors: errors };
    }

    // Validate minValue and maxValue against DataType ranges.
    if (minValue < getMinValueForType(type)) {
      errors.push(
        `DataPoint simulation minValue is out of range for type ${type} in data point '${id}'`,
      );
      return { success: false, errors: errors };
    }
    if (maxValue > getMaxValueForType(type)) {
      errors.push(
        `DataPoint simulation maxValue is out of range for type ${type} in data point '${id}'`,
      );
      return { success: false, errors: errors };
    }

    // Set simulation in props.
    props.simulation = obj.simulation;
  }

  // Add feedbackDataPoint if provided.
  if (obj.feedbackDataPoint !== undefined) {
    if (typeof obj.feedbackDataPoint !== "string") {
      errors.push("DataPoint feedbackDataPoint must be a string");
      return { success: false, errors: errors };
    }

    // Set feedbackDataPoint in props.
    props.feedbackDataPoint = obj.feedbackDataPoint;
  }

  // Return successful ParseResult with new DataPoint.
  return { success: true, value: new DataPoint(props) };
}
